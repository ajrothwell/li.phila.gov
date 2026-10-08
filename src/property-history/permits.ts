import { fetchAllRows, type DatabridgeRow } from '@/shared/databridge'
import type { AddressRecord } from '@/shared/ais'

/** One permit, in our names. The table shows three fields; the detail page will use the rest. */
export interface Permit {
  id: number
  permitNumber: string
  description: string
  type: string
  typeOfWork: string
  status: string
  /** UTC timestamp, e.g. "2022-06-15T04:00:00Z" (midnight in Philadelphia). */
  issuedDate: string
  scopeOfWork: string
  address: string
  unit: string
  zipCode: string
  contractorName: string
  contractorAddress: string
  opaAccountNumber: string
}

/** Wraps a value as a SQL string literal, doubling any apostrophes (O'NEILL ST). */
function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

/** A quoted, comma-separated list for IN (…). An empty list becomes IN ('') so it matches nothing. */
function quoteList(values: string[]): string {
  if (values.length === 0) return "''"
  return values.map(quote).join(', ')
}

/**
 * The WHERE clause that picks a property's rows in the permits-style tables (permits,
 * violations, investigations, appeals share these columns). L&I has two systems of record:
 * HANSEN rows match the address, the L&I address keys, or the OPA account; eCLIPSE rows
 * match the eCLIPSE location ids, the parcel, or the OPA account. Copied from vue3-atlas,
 * where the two arms were proven to return the same rows as the old app's UNION.
 */
export function propertyRecordsWhere(address: AddressRecord): string {
  const opa = address.opaAccountNumber
    ? ` OR opa_account_num IN (${quote(address.opaAccountNumber)})`
    : ''
  const hansen =
    `address = ${quote(address.streetAddress)} ` +
    `OR addressobjectid IN (${quoteList(address.liAddressKeys)}) AND systemofrecord IN ('HANSEN')${opa}`
  const eclipse =
    `addressobjectid IN (${quoteList(address.eclipseLocationIds)}) ` +
    `OR parcel_id_num IN (${quote(address.pwdParcelId)}) AND systemofrecord IN ('ECLIPSE')${opa}`
  return `(${hansen}) OR (${eclipse})`
}

/** A column as text; null and undefined become "". */
function text(value: unknown): string {
  return value == null ? '' : String(value)
}

function toPermit(row: DatabridgeRow): Permit {
  const unitNumber = text(row.unit_num)
  const unitType = text(row.unit_type) || 'Unit'
  const contractorAddress = [
    text(row.contractoraddress1),
    text(row.contractoraddress2),
    [text(row.contractorcity), text(row.contractorstate), text(row.contractorzip)].join(' ').trim(),
  ]
    .filter((line) => line !== '')
    .join(', ')

  return {
    id: Number(row.objectid),
    permitNumber: text(row.permitnumber),
    description: text(row.permitdescription),
    type: text(row.permittype),
    typeOfWork: text(row.typeofwork),
    status: text(row.status),
    issuedDate: text(row.permitissuedate),
    scopeOfWork: text(row.approvedscopeofwork),
    address: text(row.address),
    unit: unitNumber ? `${unitType} ${unitNumber}` : '',
    zipCode: text(row.zip),
    contractorName: text(row.contractorname),
    contractorAddress,
    opaAccountNumber: text(row.opa_account_num),
  }
}

/** Every permit for the property, newest first. */
export async function fetchPermits(address: AddressRecord): Promise<Permit[]> {
  const rows = await fetchAllRows({ table: 'permits', where: propertyRecordsWhere(address) })
  return rows.map(toPermit).sort((a, b) => b.issuedDate.localeCompare(a.issuedDate))
}

import { gatewayClientId } from './gateway'

const AIS_URL = 'https://api-prod.phila.gov/ais/v1'

/** The parts of an AIS address record that this app uses. */
export interface AddressRecord {
  /** The official street address, e.g. "1234 MARKET ST". */
  streetAddress: string
  /** The address as the Office of Property Assessment has it; may be empty. */
  opaAddress: string
  opaAccountNumber: string
  pwdParcelId: string
  /** Address keys in L&I's older HANSEN system. Usually one; may be several or none. */
  liAddressKeys: string[]
  /** Location ids in L&I's eCLIPSE system. Empty for some properties. */
  eclipseLocationIds: string[]
  /** Building identification numbers. */
  bins: string[]
  liDistrict: string
  owners: string
  unitType: string
  unitNumber: string
  zipCode: string
}

/** The fields we read from one AIS feature's properties. AIS has ~100 more. */
interface AisProperties {
  street_address: string
  opa_address: string
  opa_account_num: string
  pwd_parcel_id: string
  li_address_key: string | null
  eclipse_location_id: string | null
  bin: string | null
  li_district: string
  opa_owners: string
  unit_type: string
  unit_num: string
  zip_code: string
}

interface AisResponse {
  features: { properties: AisProperties }[]
}

/** AIS joins multiple ids with "|". Null or empty becomes an empty list. */
function splitIds(value: string | null): string[] {
  if (!value) return []
  return value.split('|').filter((id) => id !== '')
}

function toAddressRecord(p: AisProperties): AddressRecord {
  return {
    streetAddress: p.street_address,
    opaAddress: p.opa_address,
    opaAccountNumber: p.opa_account_num,
    pwdParcelId: p.pwd_parcel_id,
    liAddressKeys: splitIds(p.li_address_key),
    eclipseLocationIds: splitIds(p.eclipse_location_id),
    bins: splitIds(p.bin),
    liDistrict: p.li_district,
    owners: p.opa_owners,
    unitType: p.unit_type,
    unitNumber: p.unit_num,
    zipCode: p.zip_code,
  }
}

/**
 * Looks up a typed address in AIS. Returns the record, or null when AIS has no match
 * (a 404 is an answer, not a failure). Throws on any other problem.
 */
export async function lookupAddress(query: string): Promise<AddressRecord | null> {
  const params = new URLSearchParams()
  if (gatewayClientId) {
    params.set('client_id', gatewayClientId)
  }
  // Partitions the gateway's response cache by origin. The gateway echoes the request
  // origin into Access-Control-Allow-Origin but its cache ignores the Vary: Origin it
  // declares, so an entry cached for one origin CORS-blocks every other origin for the
  // cache TTL. Remove when the gateway's CORS policy is origin-independent.
  params.set('cache_origin', location.hostname)

  const response = await fetch(`${AIS_URL}/search/${encodeURIComponent(query)}?${params}`)
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`AIS search failed with status ${response.status}`)

  const data = (await response.json()) as AisResponse
  const properties = data.features[0]?.properties
  if (!properties) return null
  return toAddressRecord(properties)
}

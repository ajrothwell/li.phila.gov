import { formatInTimeZone } from 'date-fns-tz'
import { PHILADELPHIA } from './databridge'

/**
 * Shows a UTC timestamp as a Philadelphia date, e.g. "Jun 15, 2022". L&I records are
 * stamped in Philadelphia time, so the date is read in the City's zone, not the viewer's.
 */
export function formatDate(isoTimestamp: string): string {
  if (!isoTimestamp) return ''
  return formatInTimeZone(isoTimestamp, PHILADELPHIA, 'MMM d, yyyy')
}

export interface Section {
  title: string
  description: string
  /** An app path (starts with "/") or a full external URL. */
  href: string
}

export const eclipseUrl = 'https://eclipse.phila.gov/phillylmsprod/pub/lms/Login.aspx'

export const sections: Section[] = [
  {
    title: 'Property History',
    description: 'Find permits, licenses, violations, and appeals by address.',
    href: '/property-history',
  },
  {
    title: 'Find a Licensed Contractor',
    description: 'Find licensed contractors and other Philadelphia trade license holders.',
    href: '/contractor-lookup',
  },
  {
    title: 'Contractor Permit Lookup',
    description:
      'Search by contractor name to find permits issued to or naming that contractor. You can also search for individual permits by permit number.',
    href: '/contractor-permit-lookup',
  },
  {
    title: 'eCLIPSE Dashboard',
    description:
      'Log in, register, request a Certificate of Rental Suitability, pay L&I violation fees and fines, and access public eCLIPSE searches for daily zoning reports and permit and license information.',
    href: eclipseUrl,
  },
  {
    title: 'L&I Appeal Calendar',
    description:
      'Board of License and Inspection Review (BLIR), the Board of Building Standards (BBS), and the Plumbing Advisory Board (PAB) details, hearing information, and decisions.',
    href: '/appeals-calendar',
  },
]

export function isInternal(href: string): boolean {
  return href.startsWith('/')
}

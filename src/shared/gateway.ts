/**
 * The app's client id for the phila.gov API gateway. One id covers AIS and databridge.
 *
 * Only a dev build sends it. The gateway recognizes the deployed origins and adds the
 * id itself, which it can't do for localhost, since every app shares that. In a
 * production build this is undefined, so callers leave the parameter out entirely.
 */
export const gatewayClientId: string | undefined = import.meta.env.DEV
  ? import.meta.env.VITE_GATEWAY_CLIENT_ID
  : undefined

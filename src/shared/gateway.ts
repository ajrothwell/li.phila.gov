/**
 * The app's client id for the phila.gov API gateway. One id covers AIS and databridge.
 *
 * It is sent whenever the build has one: in local dev it comes from the developer's
 * gitignored .env.local, and the GitHub Pages demo build gets it from a repository
 * secret, because Anypoint doesn't know that origin. The City's own builds set no id;
 * the gateway recognizes their origins and adds the id itself. Undefined in that case,
 * so callers leave the parameter out entirely.
 */
export const gatewayClientId: string | undefined = import.meta.env.VITE_GATEWAY_CLIENT_ID

/// <reference types="vite/client" />

// The environment variables this app reads, so `import.meta.env.X` is typed.
interface ImportMetaEnv {
  /** phila.gov API gateway client id, from a developer's gitignored .env.local. */
  readonly VITE_GATEWAY_CLIENT_ID?: string
}

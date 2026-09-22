# li.phila.gov

Public lookup tools for the Philadelphia Department of Licenses and Inspections: property history, contractor lookup, contractor permit lookup, and the L&I and ZBA appeal calendars.

A rewrite of [L-I-Consolidation](https://github.com/CityOfPhiladelphia/L-I-Consolidation) on Vue 3 and [phila-ui-4](https://github.com/CityOfPhiladelphia/phila-ui-4).

## Setup

```sh
pnpm install
pnpm dev
```

Data comes from the databridge API gateway, which needs a client id in a gitignored `.env.local`:

```
VITE_GATEWAY_CLIENT_ID=...
```

Other scripts: `pnpm build`, `pnpm test:unit`, `pnpm lint`.

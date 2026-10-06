# Decisions

Why the app is the way it is. Newest at the bottom.

## Rewrite, not upgrade (2026-09-22)

A new repo on Vue 3 rather than upgrading L-I-Consolidation in place. Every layer changes (Vue 2.7 → 3, Vuex → Pinia, vue-router 3 → 5, phila-ui 2 → phila-ui-4, maplibre direct → map-core), so an in-place upgrade would have touched every file anyway. The old app is the spec: same features, same behavior, phila-ui-4 look.

## Sections (2026-09-22)

Dashboard, Property History, Contractor Lookup, Contractor Permit Lookup, Appeals Calendar (L&I and ZBA modes, one layout), plus the `/eclipse-dashboard` redirect. Dropped: Permit Application Tracker (a 2022 stub whose dashboard entry was never turned on) and `/zoning-appeal-calendar` (a redirect nothing has linked to since 2022).

## TypeScript, kept light (2026-09-22)

phila-ui-4 is typed, so the editor can check props and catch wiring mistakes before the page runs. No clever generics.

## Pinia, one store per section (2026-09-22)

One address drives a dozen datasets read by many components. Without a store that ends up as props threaded through everything or a giant provide/inject.

## pnpm, enforced (2026-09-22)

`packageManager` field plus a `preinstall` guard so `npm install` fails instead of leaving a stray `package-lock.json`.

## Header title through the logo, no subtitle (2026-09-23)

phila-ui-4's `AppHeader` shows the app name via its `logo` prop (bell + bold text) and has no subtitle. The old app's per-section subtitles move into each section's page as a lead line.

## Mobile overrides live in one block in App.vue (2026-09-23)

`compact-mobile` shrinks the header but not the trusted-site banner height, the single-line title, or the burger/logo gap, and `AppFooter` has no hide-on-mobile. Rather than fight each one separately, all four overrides sit in one `@media` block with a comment naming the phila-ui-4 bead (`map-core-nhy`). When phila-ui-4 exposes these, the block shrinks to just the footer rule.

## Burger rendered by the app, only on mobile (2026-09-23)

`AppHeader`'s built-in burger can't be shown from slot content alone (a boolean-default bug in 3.0.0) and has no desktop breakpoint. The app fills the `navbar-toggle` slot with its own `NavbarBurger` under `v-if="isMobile"`. `v-if` rather than a hide class because the header's brand padding depends on the burger being absent from the DOM on desktop, not just hidden.

## Breakpoint: 768px, in JS and CSS (2026-09-23)

`useIsMobile` and the App.vue `@media` block use the same query so the burger appears exactly when the footer disappears. Duplicated on purpose — CSS can't import from JS — with a comment on each side.

## PhilaLink for UI links, plain `<a>` for content links (2026-09-24)

`PhilaLink` adds size, variants, and icons on top of three stacked components. Base CSS already styles bare `<a>` correctly. Use `PhilaLink` in chrome (footer, nav, cards); use `<a>` / `<RouterLink>` in prose and table cells, where Property History renders links by the hundreds.

## Folders by feature, not by type (2026-09-29)

`src/<section>/` holds everything for one section — views, components, store, composables. Cross-cutting code goes in `src/shared/`, which gets by-type subfolders (`shared/composables/`, `shared/components/`) once it has more than a few files. Reason: five sections that share little; by-type folders would scatter each section across four places. The scaffold's `src/stores/` is a by-type leftover and goes away when the first section has its own store.

## "Section" is the word for one of the five (2026-09-30)

Each dashboard entry is a former standalone app — its own layout, search, and data. In code that unit is a `Section` (`src/dashboard/sections.ts`), matching the folder-per-section layout. Not "tile" (names the look, not the thing) and not "app" (collides with `App.vue`, `createApp`, `#app`). eCLIPSE is a section that lives on another site. The list will likely move to `src/shared/` once the router and header read it too.

## Dashboard cards are stock InfoCards, navigated by click (2026-09-30)

phila-ui-4 cards accept `href` (a plain `<a>`, which would reload the page for in-app paths) but not a router `to`. Internal sections use `@click` / Enter → `router.push`, the same way pinboard-3's cards and the old app's buttons did; the eCLIPSE card uses a real `href`. The cost is that internal cards aren't true links (no middle-click, no "copy link"). If `BaseCard` gains a `to` prop, switch to it.

No arrow icon on the cards, though the old app had one. Unmodified cards are the defensible default and match the other phila-ui-4 apps; it's a small addition later if users miss the cue.

Card titles use `has-text-heading-6`. phila-ui's type scale is larger on narrow screens, so on mobile the card titles (20px) are still bigger than the app name in the header (16px, from the single-line title override). Same in the pinboard apps. Still under consideration.

## Header title comes from the route (2026-10-02)

Each section route carries `meta: { title }`, and `App.vue` shows the current route's title in the header, falling back to the app name on the dashboard. The old app did this with a flag in the store that each layout had to remember to set; a route's title is a fact about the route, so it lives on the route. `/appeals-calendar` and `/zba-appeals-calendar` share one page and differ only in `meta`.

The titles now exist in both `sections.ts` and the router. When that duplication costs something, the router reads them from `sections.ts`.

## Page container lives on `<main>` (2026-10-02)

Max width, centering, and padding are set once on `<main>` in `App.vue`, as the old app did with `main.container`, so every page lines up without repeating it. A page that needs the full width (the old app widened Contractor Lookup) will ask for it through route `meta`.

## Section pages have a hidden `<h1>` (2026-10-02)

The header already shows the section's name, so a visible page heading would repeat it. Each page keeps an `<h1>` for screen readers and accessibility checkers, hidden with phila-ui's `screen-reader-only` class.

## Subtitle comes from the route, shown above the breadcrumbs (2026-10-06)

The old app's subtitle was the header's second line. It is route information like the title (`meta.subtitle`), and `App.vue` shows it directly under the header, above the breadcrumbs — the old app's order. It was briefly each page's first line instead; that put it below the breadcrumbs and couldn't differ between the two calendar routes.

## Breadcrumbs come from the matched routes (2026-10-06)

`App.vue` builds the trail from `route.matched`: one crumb per matched route with a `meta.title`, in parent-to-child order. `@phila/phila-ui-breadcrumbs` adds the home link itself, so the trail doesn't include the dashboard, and breadcrumbs are hidden on the dashboard. The old app kept a hand-written crumb list on every route plus a component full of per-crumb special cases. Crumb links are plain `<a>` (full reload) — the package takes `href` only; same gap as cards.

## phila-ui-4 packages stay on `latest`, not `beta` (2026-10-02)

The `beta` channel is ahead (search 2.0.0-beta has a `label` prop that 1.2.3 lacks, for example). But beta packages pin exact beta versions of `phila-ui-core` and each other, so it's all packages or none; mixing would put two copies of core in the app. pinboard-3 runs on betas because it was built while phila-ui-4 was, and needed changes daily. This app uses the stable parts and doesn't. Which channel City apps should ship on is not yet decided. Revisit if `latest` blocks something real, and then switch every `@phila` package together, with exact versions pinned.

When checking what a component accepts, read the installed package (`node_modules/@phila/<pkg>/dist`), not the phila-ui-4 repo, which is ahead of both channels.

## File names say what the file is, even inside a section folder (2026-10-06)

`property-history/propertyHistoryStore.ts`, not `property-history/store.ts`. Folder-defines-it names (`store.ts`, `index.ts`) are a real convention, but ten of them make editor tabs, diffs, and search results unreadable. Components are PascalCase (`PropertyHistoryView.vue`); other `.ts` files are camelCase and named for what they export (`useIsMobile.ts`, `propertyHistoryStore.ts`). Spec files take the name of the file they test. The same goes for variables: a store is held as `const propertyHistoryStore = usePropertyHistoryStore()` — the function name without `use` — never `const store = …`, so the name says both which store and that it's a store.

## Pinia "setup" stores, not "option" stores (2026-10-06)

Stores are written as `defineStore('name', () => { refs, functions, return })` — the same shape as a composable — rather than `{ state, actions, getters }` as in vue3-atlas. Chosen so there's one shape to learn (composables and stores read alike), and it's the more flexible form. Every store in this app uses it.

## AIS lookup lives in `src/shared/ais.ts`, behind its own record type (2026-10-06)

`lookupAddress()` is the only code that knows AIS's field names and pipe-joined ids. It returns an `AddressRecord` in our names, with ids as lists and `null` ids as empty lists (the old app crashed on properties with no eCLIPSE id). A 404 is "not found" (`null`), anything else is an error. Calls go to the MuleSoft gateway (`api-prod.phila.gov/ais/v1`) with the app's client id in dev builds only, as vue3-atlas does; deployed origins are recognized by Anypoint. The `cache_origin` parameter is atlas's workaround for the gateway's CORS cache.

## No in-app Carto fallback, no `apiSources` switch (2026-10-06)

Data calls go to the databridge gateway only. The gateway itself falls back to Carto when its first backend fails; the client-side Carto fallback and per-dataset source switch in L-I-Consolidation and vue3-atlas were a feature-flag rollback for the migration, not a reliability feature, and a new app has nothing to roll back to. If the gateway proves unreliable, that's a gateway problem to raise, not a second data path to carry.

## Demo deploy to GitHub Pages (2026-10-06)

`.github/workflows/pages.yml` publishes `main` to `https://ajrothwell.github.io/li.phila.gov/` so colleagues can see progress. It is not the real deployment (that waits for the City org). Three things make a sub-path work: `vite build --base=/li.phila.gov/`, a `404.html` copy of `index.html` so deep links reach the router, and base-aware home links in `App.vue` (`import.meta.env.BASE_URL`, `router.resolve(...).href`). The build gets the gateway client id from a repository secret, since Anypoint doesn't know that origin; `gateway.ts` now sends the id whenever the build has one. City builds set none and rely on origin recognition, as before.

## Vitest for wiring and data, not for maps or CSS (2026-09-24)

jsdom has no layout and no WebGL. Tests cover component wiring (slots, imports, router), stores, and API calls. How things look is checked in the browser. Map components get no unit tests.

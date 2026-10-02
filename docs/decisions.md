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

Max width, centering, and padding are set once on `<main>` in `App.vue`, as the old app did with `main.container`, so every page lines up without repeating it. A page that needs the full width (the Property History map) will ask for it through route `meta`.

## Section pages have a hidden `<h1>` (2026-10-02)

The header already shows the section's name, so a visible page heading would repeat it. Each page keeps an `<h1>` for screen readers and accessibility checkers, hidden with phila-ui's `screen-reader-only` class, and shows the old app's subtitle as its first visible line.

## Vitest for wiring and data, not for maps or CSS (2026-09-24)

jsdom has no layout and no WebGL. Tests cover component wiring (slots, imports, router), stores, and API calls. How things look is checked in the browser. Map components get no unit tests.

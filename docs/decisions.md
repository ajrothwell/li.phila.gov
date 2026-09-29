# Decisions

Why the app is the way it is. Newest at the bottom.

## Rewrite, not upgrade (2026-09-22)

A new repo on Vue 3 rather than upgrading L-I-Consolidation in place. Every layer changes (Vue 2.7 → 3, Vuex → Pinia, vue-router 3 → 5, phila-ui 2 → phila-ui-4, maplibre direct → map-core), so an in-place upgrade would have touched every file anyway. The old app is the spec: same features, same behavior, phila-ui-4 look.

## Sections (2026-09-22)

Dashboard, Property History, Contractor Lookup, Contractor Permit Lookup, Appeals Calendar (L&I and ZBA modes, one layout), plus the `/eclipse-dashboard` redirect. Dropped: Permit Application Tracker (a 2022 stub whose dashboard tile was never turned on) and `/zoning-appeal-calendar` (a redirect nothing has linked to since 2022).

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

## Vitest for wiring and data, not for maps or CSS (2026-09-24)

jsdom has no layout and no WebGL. Tests cover component wiring (slots, imports, router), stores, and API calls. How things look is checked in the browser. Map components get no unit tests.

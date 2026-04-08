# Architecture

> Keep this document updated as the project evolves.
>
> Adapted for the requirements in [PRD.md](PRD.md). See [research/gri-ux-analysis.md](research/gri-ux-analysis.md) for the GRI interaction model this architecture targets. See [METHODOLOGY.md](METHODOLOGY.md) for MapX API/SDK discovery approach.

## Overview

Static site, no backend. The app embeds MapX in an iframe via the SDK's postMessage bridge and wraps it in a sidebar UI styled with Mangrove. See the [PRD](PRD.md) for what we're building; this doc covers how.

## Structure

```
undrr-risk-resilience-maps/
├── index.html                  # Main entry point
├── src/
│   ├── pin-gate.js             # Preview PIN gate (sessionStorage auth)
│   ├── main.js                 # App bootstrap, SDK init
│   ├── config/
│   │   ├── layers/             # Per-category layer definitions
│   │   │   ├── index.js        # Assembles TABS array
│   │   │   ├── projects.js     # MapX project IDs
│   │   │   ├── hazard.js       # Compound + simple hazard layers
│   │   │   ├── exposure.js
│   │   │   ├── vulnerability.js
│   │   │   └── risk.js
│   │   └── validate.js         # Startup config validation
│   ├── sdk/                    # MapX SDK wrapper modules
│   │   ├── client.js           # mxsdk.Manager lifecycle
│   │   ├── views.js            # view add/remove/query
│   │   ├── filters.js          # layer transparency, filters
│   │   └── map-control.js      # flyTo, zoom, projection
│   ├── state/
│   │   ├── store.js            # openViews Set, activeTab, activeSourceIndex
│   │   └── hash.js             # URL hash encoding (stub)
│   ├── ui/
│   │   ├── sidebar.js          # Floating panel, accordion, nav routing
│   │   ├── home.js             # Home / About full-page view
│   │   ├── info-panels.js      # Guide, Sources, Downloads full-page views
│   │   ├── infobox.js          # Feature click popup
│   │   └── widgets/            # Source-switching widgets (registry pattern)
│   │       ├── index.js        # Widget registry + isCompound helper
│   │       ├── sub-tabs.js     # Button bar for metric switching
│   │       └── stepped-slider.js # Range slider for return periods
│   └── styles/
│       ├── shared.css          # CSS entry point (@imports)
│       ├── tokens.css          # Design tokens (custom properties)
│       └── components/         # Per-component CSS files
│           ├── layout.css      # App shell, nav, info-page containers
│           ├── pin-gate.css    # PIN gate overlay
│           ├── layer-panel.css # Floating sidebar panel
│           ├── layer-accordion.css
│           ├── opacity-slider.css
│           ├── legend.css
│           ├── home-panel.css  # Info page hero, sections, cards
│           ├── widgets.css     # Sub-tabs and stepped-slider
│           └── infobox.css
├── .github/workflows/deploy.yml # GitHub Pages CI
├── vite.config.js
├── server.js                   # Static production server
└── package.json
```

## Architectural decisions

### MapX SDK integration (iframe + postMessage)

MapX runs in an iframe. All communication goes through `mxsdk.Manager`, which uses `window.postMessage` RPC under the hood. SDK methods are wrapped in thin facade modules under `src/sdk/` so nothing else in the app touches postMessage directly.

```
Browser tab
  ├── Our app (parent window)
  │     ├── src/sdk/client.js    → mxsdk.Manager lifecycle
  │     ├── src/sdk/views.js     → view add/remove/query
  │     ├── src/sdk/filters.js   → layer transparency, filters
  │     └── src/sdk/map-control.js → flyTo, zoom, projection
  │
  └── MapX iframe (cross-origin)
        └── communicates via postMessage ↕
```

### Navigation and layer panel

Category tabs (Hazard, Exposure, Vulnerability, Risk) live in a Mangrove `mg-mega-topbar` navigation bar below the page header. The nav bar uses the Simple Nav variant from the [Mangrove MegaMenu component](https://unisdr.github.io/undrr-mangrove/?path=/docs/components-megamenu--docs) — plain HTML links, no React.

Layers for the active category appear in a floating panel positioned over the top-left of the map. The panel is collapsible and scrollable, with per-layer accordion controls (opacity sliders, legends). Layer definitions live in `src/config/layers/`, split by category.

### Simple vs compound layers

A **simple layer** maps to one MapX view ID. A **compound layer** groups multiple related views under a single accordion item with a widget to switch between them. Only one source view is active on the map at a time.

Compound layers are config-driven. The `sources` array lists the view IDs and labels; the `widget` object says how to render the switcher:

```js
{
  id: null,
  label: "Earthquake PGA",
  type: "rt",
  sources: [
    { id: "MX-J3YTW-...", label: "250 yr" },
    { id: "MX-4XSGY-...", label: "475 yr" },
    // ...
  ],
  widget: { type: "stepped-slider", label: "Return period" },
}
```

**Widget types** are registered in `src/ui/widgets/index.js`. Current types:

| Type | UI | Use case |
|---|---|---|
| `sub-tabs` | Button bar | Switching between data metrics (depth / frequency / exposure) |
| `stepped-slider` | Range input with tick labels | Selecting return periods or thresholds |

To add a new widget type: create a factory function in `src/ui/widgets/`, register it in the index. No sidebar.js changes needed.

### State management

Plain ES module exports with setter functions, no framework. Lightweight enough for this class of app.

**Terminology note:** in the MapX SDK, a dataset on the map is called a "view." In our UI and docs, we call them "layers" (what the user sees). The code uses both: `openViews` is the SDK-facing set, but UI labels say "layer."

- `openViews` (Set) — tracks which MapX views (layers) are currently active
- `activeSourceIndex` (Map) — for compound layers, tracks which source is selected
- Per-tab state: visibility, opacity, filter values

### UI layer (Mangrove)

All styling builds on the [UNDRR Mangrove component library](https://assets.undrr.org/static/mangrove/latest/css/style.css) (CSS only, no JS framework). Components used:

- `mg-page-header` — UNDRR branding bar with Sendai stripe
- `mg-mega-topbar` — category navigation bar (Simple Nav variant)
- `mg-hero` — full-width hero header band on info pages
- `mg-card`, `mg-card__icon--bordered` — category cards on the home page
- `mg-highlight-box` — callout boxes on info pages
- `mg-button` / `mg-tag` — interactive controls and layer type badges
- `mg-container` — centred layout
- Utility classes (`mg-u-*`) for spacing, colour, typography

### Feature popups and click handling

MapX fires `click_attributes` events on vector feature clicks. For passthrough Mapbox GL layers (custom GeoJSON), features are cached in a local registry and matched via spatial lookup (ray casting for polygons, proximity for points).

### Country page linking

Clicking a country opens the external Risk & Resilience country page. Just a URL template, not a deep SDK integration.

### Dual map views

The GRI model allows up to two simultaneous map panels. Each panel needs its own `mxsdk.Manager` instance (its own iframe).

## Build pipeline

- Vite dev server with hot reload
- Vite/Rollup produces static assets to `dist/`
- Serve with the Node.js static server (`server.js`) or any static host
- No backend needed. All data comes from MapX.

## Testing

| Layer | Tool | What it covers |
|---|---|---|
| Unit | Vitest (jsdom) | Pure functions, config validation, state mutations |
| E2E | Playwright (Chromium) | SDK connection, layer toggles, click interactions, navigation |

## What this is not

- Not a full geospatial analysis platform (no draw-box queries, spatial mining)
- Not a data viz tool beyond risk-to-resilience scope
- Not an SPA. If multiple pages are needed, use Vite MPA (one HTML entry per page).

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
│   ├── main.js                 # App bootstrap: validates config, builds UI, inits SDK
│   ├── config/
│   │   ├── layers/             # Per-category layer definitions
│   │   │   ├── index.js        # Assembles TABS array + exports PRIMARY_PROJECT
│   │   │   ├── projects.js     # MapX project IDs (ECO_DRR, HOME, CDC)
│   │   │   ├── hazard.js       # Compound + simple hazard layers
│   │   │   ├── exposure.js
│   │   │   ├── vulnerability.js
│   │   │   └── risk.js
│   │   └── validate.js         # Startup config validation (throws on errors)
│   ├── sdk/                    # MapX SDK wrapper modules
│   │   ├── client.js           # mxsdk.Manager lifecycle + SDK readiness flag
│   │   ├── views.js            # view add/remove/query
│   │   ├── filters.js          # layer transparency, filters
│   │   └── map-control.js      # flyTo, zoom, projection
│   ├── state/
│   │   ├── store.js            # openViews Set, activeTab, activeSourceIndex Map
│   │   └── hash.js             # URL hash encoding/decoding + layer index lookup
│   ├── ui/
│   │   ├── sidebar.js          # Nav routing, layer panel, accordions, clear-all
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

### Startup sequence

The app initialises in two phases to keep the UI responsive even if the MapX SDK is slow to load:

1. **Immediate** — `validateLayers()` runs first and throws on config errors. `buildSidebar()` follows: nav links are wired, info pages are built, and layer accordions are rendered. The user can read the home/guide/sources/downloads pages without waiting for the map.
2. **On SDK ready** — once `mapx.on("ready")` fires, `setSDKReady(true)` unlocks layer toggles, vector highlight is enabled, and any layers in the URL hash are restored.

Layer toggle buttons check `isSDKReady()` before calling SDK methods, so clicking a layer before the map has loaded produces a console warning rather than a silent failure.

### MapX SDK integration (iframe + postMessage)

MapX runs in an iframe. All communication goes through `mxsdk.Manager`, which uses `window.postMessage` RPC under the hood. SDK methods are wrapped in thin facade modules under `src/sdk/` so nothing else in the app touches postMessage directly.

```
Browser tab
  ├── Our app (parent window)
  │     ├── src/sdk/client.js    → mxsdk.Manager lifecycle + readiness flag
  │     ├── src/sdk/views.js     → view add/remove/query
  │     ├── src/sdk/filters.js   → layer transparency, filters
  │     └── src/sdk/map-control.js → flyTo, zoom, projection
  │
  └── MapX iframe (cross-origin)
        └── communicates via postMessage ↕
```

**Single-project constraint:** the SDK connects to one MapX project at a time (`PRIMARY_PROJECT = ECO_DRR`). All enabled layers must belong to this project. `validateLayers()` enforces this at startup — any enabled layer with a different `project` value throws an error. Layers that belong to other projects (e.g. `HOME`) are marked `disabled: true` with a TODO comment until data is consolidated.

### Navigation and layer panel

Category tabs (Hazard, Exposure, Vulnerability, Risk) live in a Mangrove `mg-mega-topbar` navigation bar. Info tabs (Home, Guide, Sources, Downloads) appear alongside them.

**Two routing modes driven by `switchTab()`:**
- **Info tabs** — hide the map (`#app-map`), show the full-page `#info-page` container, display the matching info panel.
- **Data tabs** — show the map, show the floating layer panel with the matching tab's layers.

The active tab and open layers are encoded in the URL hash (format: `#tab?layers=key:sourceIdx,...`) so links are shareable and browser back/forward works. On `hashchange`, both the active tab and the open layer set are reconciled against the new URL.

### Simple vs compound layers

A **simple layer** maps to one MapX view ID. A **compound layer** groups multiple related views under a single accordion item with a widget to switch between them. Only one source view is active on the map at a time.

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

**Widget types** are registered in `src/ui/widgets/index.js`:

| Type | UI | Use case |
|---|---|---|
| `sub-tabs` | Button bar | Switching between data metrics (depth / frequency / exposure) |
| `stepped-slider` | Range input with tick labels | Selecting return periods or thresholds |

To add a new widget type: create a factory function in `src/ui/widgets/`, register it in the index. No changes to `sidebar.js` needed.

**Duplicate view ID constraint:** each MapX view ID must appear at most once across all layer configs. Reusing the same ID in two layers corrupts `openViews` state (the Set can't tell them apart) and breaks hash serialisation. `validateLayers()` treats duplicates as errors.

### State management

Plain ES module exports with setter functions, no framework.

**Terminology note:** in the MapX SDK, a dataset on the map is called a "view." In our UI and docs, we call them "layers." The code uses both: `openViews` is the SDK-facing set, but UI labels say "layer."

- `openViews` (Set) — MapX view IDs currently active on the map
- `activeTab` (string) — currently selected tab ID
- `activeSourceIndex` (Map) — for compound layers, tracks which source is selected

### UI layer (Mangrove)

All styling builds on the [UNDRR Mangrove component library](https://assets.undrr.org/static/mangrove/latest/css/style.css) (`latest` channel). Components used:

- `mg-page-header` — UNDRR branding bar with Sendai stripe
- `mg-mega-topbar` — category navigation bar (Simple Nav variant)
- `mg-card`, `mg-card__icon--bordered` — interactive category cards on the home page
- `mg-highlight-box` — callout boxes on info pages
- `mg-button` / `mg-tag` — interactive controls and layer type badges
- `mg-container` — centred layout
- `mg-table` — feature attribute table in the infobox

### Layer panel controls

The floating layer panel includes:
- **Per-layer accordions** — expand to reveal opacity slider, legend, and source-switching widget
- **Eye toggle** — turns a layer on/off; aria-pressed reflects state
- **Clear all button** — appears in the panel header when any layer is active; turns off all active layers across all tabs at once

### Feature popups and click handling

MapX fires `click_attributes` events on vector feature clicks. The SDK emits varying arg shapes depending on view type; `main.js` normalises all payloads to `{ attributes: ... }` before passing them to `showInfobox()`. The infobox uses a single managed `keydown` handler that is removed on every close path (Escape key or close button).

### URL hash and shareability

Format: `#tab?layers=key:sourceIdx,key:sourceIdx,...`

- Simple layers: just the key (e.g. `population`)
- Compound layers: key + source index (e.g. `earthquake-pga:2`); index 0 is omitted for brevity
- On initial load, `restoreLayersFromHash()` validates and clamps source indices before applying them
- On `hashchange`, `reconcileLayersFromHash()` diffs current state against the new URL and turns layers on/off accordingly

## Build pipeline

- Vite dev server with hot reload
- Vite/Rollup produces static assets to `dist/`
- Serve with the Node.js static server (`server.js`) or any static host
- No backend needed. All data comes from MapX.

## Testing

No automated tests are currently configured. `npm test` will return "no test files found." Priority areas for future coverage: hash parse/write round-trips, `switchTab` routing, compound layer source switching, and duplicate view ID detection.

## What this is not

- Not a full geospatial analysis platform (no draw-box queries, spatial mining)
- Not a data viz tool beyond risk-to-resilience scope
- Not an SPA. If multiple pages are needed, use Vite MPA (one HTML entry per page).

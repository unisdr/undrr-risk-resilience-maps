# TODO

Deferred work items, tracked here until they move into issues or get done.

## State store upgrade

The current store (`src/state/store.js`) is a Set of open view IDs plus an active tab string. This works for basic layer toggling, but will need to grow when we add:

- **Per-layer filter state** -- numeric ranges, text filters, dropdown selections. Currently the only per-layer control is the opacity slider, which reads/writes directly to the SDK. Adding more filters means storing their values locally so we can restore state on tab switch or page reload.
- **Session persistence** -- saving the user's layer selections and filter settings to `localStorage` so they survive a page refresh.
- **URL state encoding** -- encoding active layers and filters in the URL for shareable deep links (a GRI feature we want to replicate).

The upgrade path: replace the flat Set with a keyed object (`{ [layerId]: { visible, opacity, filters } }`) and add `saveSession()` / `loadSession()` helpers. Do this before adding any filter widgets beyond opacity.

## Multi-project data strategy

The SDK connects to one MapX project at a time. Our layers currently span two projects (Eco-DRR and HOME), and cross-project `view_add` calls may fail silently.

**Plan:** Rather than building a multi-project SDK adapter, create a dedicated UNDRR project in MapX that aggregates all needed data sources. This keeps the SDK integration simple (one project, one iframe) and avoids the complexity of managing multiple Manager instances. Coordinate with the MapX platform contact at GRID-Geneva to set this up.

Until then, layers from non-primary projects (e.g. Land Cover from HOME) may not load reliably.

## Widget event bus

When we add more control widget types (dropdowns, date pickers, toggle groups), the widgets will need a way to communicate changes back to the SDK. Currently the opacity slider calls `setViewLayerTransparency()` directly. A lightweight event emitter pattern would decouple widgets from SDK calls and allow widget composition (e.g. a date range that also triggers a layer refresh).

Not needed until the second widget type is added.

## Dual-panel map view

The GRI Risk Viewer supports side-by-side map panels. Each panel requires its own `mxsdk.Manager` instance (separate iframe). This is a v2 feature -- the architecture supports it (see ARCHITECTURE.md) but no code exists yet.

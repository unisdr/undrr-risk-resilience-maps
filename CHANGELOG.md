# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [Unreleased]

### Added

- Mangrove `mg-mega-topbar` navigation bar with Hazard / Exposure / Vulnerability / Risk category tabs
- Floating layer panel over full-width map (collapsible, scrollable)
- Accordion layer items with expand arrow, type tags, and eye toggle
- Per-layer opacity sliders (inverted to MapX SDK transparency)
- Local legend override system (HTML swatches) with SDK PNG as diagnostic fallback
- River Flooding legend override (blue depth ramp, <=10mm to >5000mm)
- Feature click popup (infobox) from MapX `click_attributes` events
- MapX SDK wrapper modules (`src/sdk/client.js`, `views.js`, `filters.js`, `map-control.js`)
- Layer definitions for 4 categories, 23 layers total (`src/config/layers.js`)
- Vite dev server, production build, static Node.js server
- UNDRR Mangrove page header with Sendai stripe

### Changed

- Layout from fixed sidebar to floating panel over full-width map
- Category tabs from in-panel tab bar to Mangrove mega menu navigation bar
- Status badge moved from page header to navigation bar

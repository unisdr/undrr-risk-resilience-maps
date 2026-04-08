# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Common Changelog](https://common-changelog.org/).

## [Unreleased]

### Added

- Compound layer system: one accordion item can switch between multiple MapX views
- Sub-tabs widget for switching data metrics (depth / frequency / exposure)
- Stepped slider widget for return period selection (earthquake PGA: 250-2475yr)
- Widget registry (`src/ui/widgets/`) -- add new types without touching sidebar code
- Earthquake PGA layer with 5 return period sources
- River Flooding compound layer (depth, frequency, exposure sub-tabs)
- Tropical Cyclone, Landslide, Tsunami compound layers (exposure/frequency)
- Home / About panel, Guide, Sources, Downloads info pages
- Preview PIN gate for prototype access control
- GitHub Actions workflow for GitHub Pages deployment
- Startup config validation (catches typos, missing IDs, bad legend entries)
- Mangrove `mg-mega-topbar` navigation bar with category tabs and info links
- Floating layer panel over full-width map (collapsible, scrollable)
- Accordion layer items with expand arrow, type tags, and eye toggle
- Per-layer opacity sliders (inverted to MapX SDK transparency)
- Local legend override system (HTML swatches) with SDK PNG as diagnostic fallback
- Feature click popup (infobox) from MapX `click_attributes` events
- MapX SDK wrapper modules (`src/sdk/client.js`, `views.js`, `filters.js`, `map-control.js`)
- CSS split into design tokens + per-component files
- Accessibility: focus-visible, aria attributes, keyboard nav, prefers-reduced-motion
- Layer config split into per-category files under `src/config/layers/`

### Changed

- Layout from fixed sidebar to floating panel over full-width map
- Hazard layers reorganised into compound layers where data pairs exist

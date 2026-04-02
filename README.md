# UNDRR Risk to Resilience Maps

Interactive maps for UNDRR (United Nations Office for Disaster Risk Reduction) built on the MapX SDK and styled with the Mangrove component library.

## Background

This project builds on learnings from the [mapx-demo-embed](../mapx-demo-embed/) proof-of-concept, which explored embedding MapX disaster risk reduction maps via the SDK. Key takeaways carried forward:

- **MapX SDK embedding** — iframe-based embed with the `@aspect/mapx` SDK postMessage bridge for map control, view management, and data queries
- **Mangrove UI** — UNDRR's component library for cards, navigation, and layout styling
- **Vite MPA** — multi-page app setup with Vite for fast dev and clean production builds
- **Scrollytelling & narrative** — guided story-driven map experiences (step-by-step animations, scenario toggling)
- **Data overlays** — damage/risk layers, preset queries, and interactive charts
- **Testing** — Vitest for unit tests, Playwright for E2E browser tests

## Status

**Planning** — Requirements gathering in progress. See [NOTES.md](NOTES.md) for working notes.

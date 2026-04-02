# Working Notes

## Learnings from mapx-demo-embed

The `mapx-demo-embed` repo served as an investigation proof-of-concept for embedding MapX maps. These are the patterns and decisions worth reusing or revisiting:

### What worked well

- **Vite MPA structure** — each demo as its own page under `/demos/<name>/` kept concerns separate and build output clean
- **MapX SDK via iframe** — the postMessage bridge is reliable; wrapping it in a thin helper made view loading and scenario switching straightforward
- **Mangrove component library** — gave us UNDRR-branded cards, toasts, and layout out of the box
- **Scrollytelling pattern** — Intersection Observer driving map state changes proved effective for narrative flows
- **Chart.js integration** — lightweight, good enough for risk metrics and country-level data viz

### What to improve

- **View discovery** — finding the right MapX view IDs required manual probing; consider building a view catalogue or config layer early
- **Error handling** — SDK connection failures were silent in the PoC; need proper user-facing feedback
- **Mobile responsiveness** — the PoC was desktop-first; this project should be mobile-ready from the start
- **Accessibility** — needs attention from day one (keyboard nav, screen reader support for map interactions)
- **Performance** — multiple iframes on a single page were heavy; plan for lazy loading or single-iframe architecture

## Requirements

_To be defined — feed in requirements to start building._

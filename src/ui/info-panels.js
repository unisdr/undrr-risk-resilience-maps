/**
 * Static info panels: Guide, Sources, Downloads.
 * Each returns a DOM element ready to be appended to the panel body.
 */

// ── Guide ─────────────────────────────────────────────────────────────────────

export function buildGuidePanel() {
  return buildPanel("tab-guide", `
    <p class="home-intro">A step-by-step guide to using the Risk to Resilience Map.</p>

    <section class="home-section">
      <h2 class="home-section-title">Getting started</h2>
      <ol class="info-steps">
        <li><strong>Select a category</strong> — choose Hazard, Exposure, Vulnerability, or Risk from the navigation bar. The panel updates to show layers for that category.</li>
        <li><strong>Enable a layer</strong> — click the eye icon next to any layer name to toggle it on the map.</li>
        <li><strong>Expand for details</strong> — click the layer name to open its accordion and see a description, opacity slider, and legend.</li>
        <li><strong>Adjust opacity</strong> — use the slider to blend a layer with the basemap.</li>
        <li><strong>Inspect features</strong> — click any map feature to see its attribute data in a popup.</li>
        <li><strong>Return here</strong> — click <em>Risk to Resilience Map</em> in the navigation bar to return to the About panel.</li>
      </ol>
    </section>

    <section class="home-section">
      <h2 class="home-section-title">Notes</h2>
      <ul class="home-roadmap-list">
        <li>Layers marked as coming soon are greyed out and not yet available.</li>
        <li>This tool is in active development. Data and design are subject to change.</li>
        <li>For questions or feedback, contact the UNDRR digital team.</li>
      </ul>
    </section>
  `);
}

// ── Sources ───────────────────────────────────────────────────────────────────

const SOURCES = [
  {
    category: "Hazard",
    entries: [
      {
        label: "River & coastal flooding",
        detail: "GAR/PREVIEW platform (UNEP/GRID‑Geneva) via MapX. Reference data: WRI Aqueduct Floods (CC BY 4.0), JRC Global River Flood Hazard Maps (CC BY 4.0).",
      },
      {
        label: "Tropical cyclones",
        detail: "STORM Tropical Cyclone dataset (CC0 1.0); IRIS Imperial College Storm Model (CC BY 4.0).",
      },
      {
        label: "Extreme heat & droughts",
        detail: "Lange et al. 2020 via ISIMIP (CC0 1.0). Multi-model ensemble; RCP 2.6 / 6.0 scenarios.",
      },
      {
        label: "Earthquakes",
        detail: "GEM Global Seismic Hazard Map (CC BY‑NC‑SA 4.0). Peak Ground Acceleration, 10% probability of exceedance in 50 years.",
      },
      {
        label: "Additional hazard layers",
        detail: "To be confirmed with the UNDRR programme team. Upgraded CRI layers are in preparation.",
      },
    ],
  },
  {
    category: "Exposure",
    entries: [
      {
        label: "Roads & railways",
        detail: "OpenStreetMap contributors (ODbL). Extract via the GRI baseline.",
      },
      {
        label: "Power infrastructure",
        detail: "Gridfinder transmission network (CC BY 4.0); WRI Global Powerplants Database (CC BY 4.0).",
      },
      {
        label: "Cropland",
        detail: "UNDRR Metrics project. Layer confirmed; final MapX view ID to be confirmed.",
      },
      {
        label: "Additional exposure layers",
        detail: "To be confirmed with the UNDRR programme team.",
      },
    ],
  },
  {
    category: "Vulnerability",
    entries: [
      {
        label: "Placeholder",
        detail: "Sources to be confirmed with the UNDRR programme team. GRI reference sources include: Global Data Lab Subnational HDI, Relative Wealth Index (Meta Data for Good), and WDPA Protected Areas (UNEP‑WCMC / IUCN).",
      },
    ],
  },
  {
    category: "Risk",
    entries: [
      {
        label: "Placeholder",
        detail: "Derived layers (hazard × exposure) to be confirmed. Methodology to be aligned with UNDRR Risk & Resilience Metrics framework.",
      },
    ],
  },
  {
    category: "Platform",
    entries: [
      {
        label: "MapX",
        detail: "Map data hosted on MapX by UNEP/GRID‑Geneva (app.mapx.org).",
      },
      {
        label: "GRI Risk Viewer",
        detail: "This tool is the successor to the GRI Risk Viewer by Oxford OPSIS (global.infrastructureresilience.org). Layer inventory and interaction model adapted under attribution.",
      },
    ],
  },
];

export function buildSourcesPanel() {
  const sections = SOURCES.map(({ category, entries }) => `
    <section class="home-section">
      <h2 class="home-section-title">${category}</h2>
      <ul class="info-source-list">
        ${entries.map((e) => `
          <li class="info-source-item">
            <span class="info-source-label">${e.label}</span>
            <span class="home-category-desc">${e.detail}</span>
          </li>
        `).join("")}
      </ul>
    </section>
  `).join("");

  return buildPanel("tab-sources", `
    <p class="home-intro">Data sources for each category. Placeholder entries will be updated as layers are confirmed with the UNDRR programme team.</p>
    ${sections}
  `);
}

// ── Downloads ─────────────────────────────────────────────────────────────────

export function buildDownloadsPanel() {
  return buildPanel("tab-downloads", `
    <p class="home-intro">Data download links will be added here as layers are confirmed and licensed for distribution.</p>

    <section class="home-section">
      <h2 class="home-section-title">In the meantime</h2>
      <ul class="home-roadmap-list">
        <li>Visit the original data providers listed in <strong>Sources</strong> for direct data access.</li>
        <li>The <a href="https://global.infrastructureresilience.org/downloads" target="_blank" rel="noopener">GRI Risk Viewer downloads page</a> provides access to GRI baseline datasets.</li>
        <li>Each dataset is subject to its own licensing terms — see Sources for full attribution.</li>
      </ul>
    </section>

    <section class="home-section">
      <h2 class="home-section-title">Planned</h2>
      <ul class="home-roadmap-list">
        <li>Per-layer download links to source datasets</li>
        <li>Site data export (attribute data for a clicked location)</li>
        <li>Bulk data package download</li>
      </ul>
    </section>
  `);
}

// ── Helper ────────────────────────────────────────────────────────────────────

function buildPanel(id, innerHTML) {
  const el = document.createElement("div");
  el.className = "home-panel";
  el.id = id;
  el.style.display = "none";
  el.innerHTML = innerHTML;
  return el;
}

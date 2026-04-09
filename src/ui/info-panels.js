/**
 * Static info panels: Guide, Sources, Downloads.
 * Full-page views using UNDRR Mangrove design system classes.
 */

import { downloadLayerInventory } from "../utils/export-layers.js";

// ── Guide ─────────────────────────────────────────────────────────────────────

const GUIDE_STEPS = [
  {
    title: "Select a category",
    desc: "Choose Hazard, Exposure, Vulnerability, or Risk from the navigation bar. The layer panel updates to show datasets for that category.",
  },
  {
    title: "Enable a layer",
    desc: "Click the eye icon next to any layer name to toggle it on the map.",
  },
  {
    title: "Expand for details",
    desc: "Click a layer name to open its accordion and see a description, opacity slider, and legend.",
  },
  {
    title: "Adjust opacity",
    desc: "Use the slider to blend a layer with the basemap and compare multiple datasets.",
  },
  {
    title: "Inspect features",
    desc: "Click any map feature to see its attribute data in a popup.",
  },
  {
    title: "Return to this page",
    desc: "Click <em>UNDRR Resilience Maps</em> in the navigation bar at any time.",
  },
];

export function buildGuidePanel() {
  return buildPanel("tab-guide", `
    <div class="info-page-hero info-page-hero--secondary">
      <div class="mg-container">
        <h1 class="info-page-hero__title">Guide</h1>
        <p class="info-page-hero__intro">A step-by-step guide to using the UNDRR Risk to Resilience Maps prototype.</p>
      </div>
    </div>

    <div class="info-page-section">
      <div class="mg-container">
        <h2 class="info-page-section__title">Getting started</h2>
        <ol class="info-steps-list">
          ${GUIDE_STEPS.map((s, i) => `
            <li class="info-step">
              <span class="info-step__num">${String(i + 1).padStart(2, "0")}</span>
              <div class="info-step__content">
                <strong class="info-step__title">${s.title}</strong>
                <p class="info-step__desc">${s.desc}</p>
              </div>
            </li>
          `).join("")}
        </ol>
      </div>
    </div>

    <div class="info-page-section info-page-section--grey">
      <div class="mg-container">
        <div class="mg-highlight-box mg-highlight-box--secondary">
          <h3>Notes</h3>
          <ul>
            <li>Layers marked as <em>coming soon</em> are not yet available.</li>
            <li>This tool is in active development. Data and design are subject to change.</li>
            <li>For questions or feedback, contact the UNDRR digital team.</li>
          </ul>
        </div>
      </div>
    </div>
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
        url: "https://unepgrid.ch/en/activity/1BDE1705",
      },
      {
        label: "Tropical cyclones",
        detail: "STORM Tropical Cyclone dataset (CC0 1.0); IRIS Imperial College Storm Model (CC BY 4.0).",
        url: "https://www.stormtropical.eu/",
      },
      {
        label: "Extreme heat & droughts",
        detail: "Lange et al. 2020 via ISIMIP (CC0 1.0). Multi-model ensemble; RCP 2.6 / 6.0 scenarios.",
        url: "https://www.isimip.org/",
      },
      {
        label: "Earthquakes",
        detail: "GEM Global Seismic Hazard Map (CC BY‑NC‑SA 4.0). Peak Ground Acceleration, 10% probability of exceedance in 50 years.",
        url: "https://www.globalquakemodel.org/product/global-seismic-hazard-assessment-program",
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
        url: "https://www.openstreetmap.org/",
      },
      {
        label: "Power infrastructure",
        detail: "Gridfinder transmission network (CC BY 4.0); WRI Global Powerplants Database (CC BY 4.0).",
        url: "https://datasets.wri.org/dataset/globalpowerplantdatabase",
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
        url: "https://globaldatalab.org/shdi/",
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
        detail: "Map data hosted on MapX by UNEP/GRID‑Geneva.",
        url: "https://app.mapx.org/",
      },
      {
        label: "GRI Risk Viewer",
        detail: "This tool is the successor to the GRI Risk Viewer by Oxford OPSIS. Layer inventory and interaction model adapted under attribution.",
        url: "https://global.infrastructureresilience.org",
      },
    ],
  },
];

export function buildSourcesPanel() {
  const sections = SOURCES.map(({ category, entries }) => `
    <div class="info-source-category">
      <h3 class="info-source-category__title">
        <span class="mg-tag mg-tag--outline">${category}</span>
      </h3>
      <div class="info-source-entries">
        ${entries.map((e) => `
          <div class="info-source-entry">
            <p class="info-source-entry__label">${e.url
              ? `<a href="${e.url}" target="_blank" rel="noopener">${e.label}</a>`
              : e.label
            }</p>
            <p class="info-source-entry__detail">${e.detail}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  const panel = buildPanel("tab-sources", `
    <div class="info-page-hero info-page-hero--secondary">
      <div class="mg-container">
        <h1 class="info-page-hero__title">Sources</h1>
        <p class="info-page-hero__intro">Data sources for each category. Placeholder entries will be updated as layers are confirmed with the UNDRR programme team.</p>
      </div>
    </div>

    <div class="info-page-section">
      <div class="mg-container">
        ${sections}
      </div>
    </div>

    <div class="info-page-section info-page-section--grey">
      <div class="mg-container">
        <h2 class="info-page-section__title">Layer inventory</h2>
        <p>Download a full inventory of all data layers configured in this tool, including MapX view IDs, data types, source attribution, and status notes. Useful for technical review and handoff.</p>
        <p>
          <button id="btn-download-inventory" class="mg-button mg-button-secondary">
            Download layer inventory (CSV)
          </button>
        </p>
      </div>
    </div>
  `);

  panel.querySelector("#btn-download-inventory").addEventListener("click", downloadLayerInventory);

  return panel;
}

// ── Downloads ─────────────────────────────────────────────────────────────────

export function buildDownloadsPanel() {
  return buildPanel("tab-downloads", `
    <div class="info-page-hero info-page-hero--secondary">
      <div class="mg-container">
        <h1 class="info-page-hero__title">Downloads</h1>
        <p class="info-page-hero__intro">Data download links will be added here as layers are confirmed and licensed for distribution.</p>
      </div>
    </div>

    <div class="info-page-section">
      <div class="mg-container">
        <h2 class="info-page-section__title">In the meantime</h2>
        <ul class="info-plain-list">
          <li>Visit the original data providers listed in <strong>Sources</strong> for direct data access.</li>
          <li>The <a href="https://global.infrastructureresilience.org/downloads" target="_blank" rel="noopener">GRI Risk Viewer downloads page</a> provides access to GRI baseline datasets.</li>
          <li>Each dataset is subject to its own licensing terms — see Sources for full attribution.</li>
        </ul>
      </div>
    </div>

    <div class="info-page-section info-page-section--grey">
      <div class="mg-container">
        <div class="mg-highlight-box mg-highlight-box--secondary">
          <h3>Planned</h3>
          <ul>
            <li>Per-layer download links to source datasets</li>
            <li>Site data export (attribute data for a clicked location)</li>
            <li>Bulk data package download</li>
          </ul>
        </div>
      </div>
    </div>
  `);
}

// ── Helper ────────────────────────────────────────────────────────────────────

function buildPanel(id, innerHTML) {
  const el = document.createElement("div");
  el.className = "info-page-panel";
  el.id = id;
  el.innerHTML = innerHTML;
  return el;
}


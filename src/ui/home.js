/**
 * Home panel — shown when the user clicks "Risk to Resilience Map"
 * in the nav bar. Provides an overview of the tool, category descriptions,
 * coming-soon roadmap items, and source credits.
 */

const CATEGORIES = [
  {
    id: "hazard",
    label: "Hazard",
    desc: "Natural hazards including river and coastal floods, droughts, earthquakes, and tropical cyclones.",
  },
  {
    id: "exposure",
    label: "Exposure",
    desc: "Infrastructure and population elements at risk: roads, railways, power networks, and cropland.",
  },
  {
    id: "vulnerability",
    label: "Vulnerability",
    desc: "Socioeconomic and structural factors that amplify harm when hazards strike.",
  },
  {
    id: "risk",
    label: "Risk",
    desc: "Combined assessment showing where hazard, exposure, and vulnerability converge.",
  },
];

const ROADMAP = [
  "Subnational vulnerability indices",
  "Early warning system layers",
  "Country-level risk profiles",
  "Side-by-side map comparison",
];

export function buildHomePanel() {
  const el = document.createElement("div");
  el.className = "home-panel";
  el.id = "tab-home";

  el.innerHTML = `
    <p class="home-intro">A geospatial explorer organised around the risk&#8209;to&#8209;resilience framework. Select a category in the navigation bar to explore map layers.</p>

    <section class="home-section">
      <h2 class="home-section-title">Categories</h2>
      <ul class="home-category-list">
        ${CATEGORIES.map(
          (c) => `<li class="home-category-item">
            <span class="home-category-label">${c.label}</span>
            <span class="home-category-desc">${c.desc}</span>
          </li>`
        ).join("")}
      </ul>
    </section>

    <section class="home-section">
      <h2 class="home-section-title">Coming soon</h2>
      <ul class="home-roadmap-list">
        ${ROADMAP.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="home-section home-credits">
      <h2 class="home-section-title">Credits</h2>
      <p>Built on the interaction model of the <a href="https://global.infrastructureresilience.org" target="_blank" rel="noopener">GRI Risk Viewer</a> by Oxford OPSIS. Map data hosted on <a href="https://app.mapx.org/" target="_blank" rel="noopener">MapX</a> by UNEP/GRID&#8209;Geneva.</p>
    </section>
  `;

  return el;
}

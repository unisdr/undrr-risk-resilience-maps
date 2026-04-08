/**
 * Home / About page — full-page view using UNDRR Mangrove design system classes.
 */

const CATEGORIES = [
  {
    id: "hazard",
    label: "Hazard",
    icon: "01",
    desc: "Natural hazards including river and coastal floods, droughts, earthquakes, and tropical cyclones.",
    color: "#c72236",
  },
  {
    id: "exposure",
    label: "Exposure",
    icon: "02",
    desc: "Infrastructure and population elements at risk: roads, railways, power networks, and cropland.",
    color: "#ed833f",
  },
  {
    id: "vulnerability",
    label: "Vulnerability",
    icon: "03",
    desc: "Socioeconomic and structural factors that amplify harm when hazards strike.",
    color: "#f0b429",
  },
  {
    id: "risk",
    label: "Risk",
    icon: "04",
    desc: "Combined assessment showing where hazard, exposure, and vulnerability converge.",
    color: "#004f91",
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
  el.className = "info-page-panel";
  el.id = "tab-home";

  el.innerHTML = `
    <div class="info-page-hero">
      <div class="mg-container">
        <p class="info-page-hero__eyebrow">Prototype · Interaction review only</p>
        <h1 class="info-page-hero__title">UNDRR Risk to Resilience Maps</h1>
        <p class="info-page-hero__intro">A geospatial explorer organised around the risk&#8209;to&#8209;resilience framework. Select a category in the navigation bar to explore datasets across Hazard, Exposure, Vulnerability, and Risk.</p>
      </div>
    </div>

    <div class="info-page-section">
      <div class="mg-container">
        <h2 class="info-page-section__title">Explore by category</h2>
        <div class="info-category-grid">
          ${CATEGORIES.map((c) => `
            <article class="mg-card mg-card__icon mg-card__icon--bordered info-category-card" style="--mg-card-border: ${c.color}">
              <div class="mg-card__visual">
                <div class="mg-card__icon-wrap mg-card__icon-wrap--small">
                  <span class="info-category-card__num" style="color: ${c.color}">${c.icon}</span>
                </div>
              </div>
              <div class="mg-card__content">
                <header class="mg-card__title" style="color: ${c.color}">${c.label}</header>
                <div class="mg-card__summary">${c.desc}</div>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    </div>

    <div class="info-page-section info-page-section--grey">
      <div class="mg-container">
        <div class="mg-highlight-box mg-highlight-box--secondary">
          <h3>Coming soon</h3>
          <ul>
            ${ROADMAP.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      </div>
    </div>

    <div class="info-page-section">
      <div class="mg-container info-page-credits">
        <h2 class="info-page-section__title">Credits</h2>
        <p>Built on the interaction model of the <a href="https://global.infrastructureresilience.org" target="_blank" rel="noopener">GRI Risk Viewer</a> by Oxford OPSIS. Map data hosted on <a href="https://app.mapx.org/" target="_blank" rel="noopener">MapX</a> by UNEP/GRID&#8209;Geneva.</p>
      </div>
    </div>
  `;

  return el;
}


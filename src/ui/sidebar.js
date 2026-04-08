/**
 * Floating layer panel + info page routing.
 *
 * - Data tabs (hazard / exposure / vulnerability / risk): show map + sidebar.
 * - Info tabs (home / guide / sources / downloads): show full-page view, hide map.
 *
 * Layer definitions come from config/layers.js; this module is purely UI.
 */
import { TABS } from "../config/layers.js";
import * as store from "../state/store.js";
import { viewAdd, viewRemove, getViewLegendImage } from "../sdk/views.js";
import {
  setViewLayerTransparency,
  getViewLayerTransparency,
} from "../sdk/filters.js";
import { buildHomePanel } from "./home.js";
import { buildGuidePanel, buildSourcesPanel, buildDownloadsPanel } from "./info-panels.js";

// MapX view types: cc = custom coded (live), rt = raster tile, vt = vector tile
const TYPE_LABELS = { cc: "live", rt: "raster", vt: "vector" };

const INFO_TABS = ["home", "guide", "sources", "downloads"];

/**
 * Build the UI and wire up all nav links.
 */
export function buildSidebar() {
  const sidebarBody = document.getElementById("panel-body");
  const panel = document.getElementById("sidebar");
  const toggle = document.getElementById("panel-toggle");
  const infoPage = document.getElementById("info-page");

  // Collapse / expand sidebar
  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-collapsed");
  });

  // Populate info page with all info panels
  infoPage.appendChild(buildHomePanel());
  infoPage.appendChild(buildGuidePanel());
  infoPage.appendChild(buildSourcesPanel());
  infoPage.appendChild(buildDownloadsPanel());

  // Populate sidebar with layer panels (data tabs only)
  for (const tab of TABS) {
    const tabPanel = document.createElement("div");
    tabPanel.className = "tab-panel";
    tabPanel.id = `tab-${tab.id}`;
    tabPanel.style.display = "none";

    for (const layer of tab.layers) {
      tabPanel.appendChild(buildLayerAccordion(layer));
    }

    sidebarBody.appendChild(tabPanel);
  }

  // Wire nav home link
  const homeLink = document.querySelector(".nav-home-link");
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab("home");
    });
  }

  // Wire nav info links
  for (const link of document.querySelectorAll(".nav-info-link")) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(link.dataset.panel);
    });
  }

  // Wire nav category links
  for (const link of document.querySelectorAll(".nav-tab-link")) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
      // Expand panel if collapsed
      panel.classList.remove("is-collapsed");
    });
  }

  // Set initial state
  switchTab(store.activeTab);
}

function switchTab(tabId) {
  store.setActiveTab(tabId);

  const appMap = document.getElementById("app-map");
  const infoPage = document.getElementById("info-page");
  const isInfoTab = INFO_TABS.includes(tabId);

  // Toggle map vs full-page info view
  appMap.style.display = isInfoTab ? "none" : "";
  infoPage.style.display = isInfoTab ? "" : "none";

  // Active state on all nav links
  for (const link of document.querySelectorAll(".nav-tab-link")) {
    link.classList.toggle("is-active", link.dataset.tab === tabId);
  }
  const homeLink = document.querySelector(".nav-home-link");
  if (homeLink) homeLink.classList.toggle("is-active", tabId === "home");
  for (const link of document.querySelectorAll(".nav-info-link")) {
    link.classList.toggle("is-active", link.dataset.panel === tabId);
  }

  if (isInfoTab) {
    // Show the right info panel, hide the others
    for (const id of INFO_TABS) {
      const el = document.getElementById(`tab-${id}`);
      if (el) el.style.display = el.id === `tab-${tabId}` ? "" : "none";
    }
  } else {
    // Show the right layer panel in the sidebar, hide the others
    for (const panel of document.querySelectorAll(".tab-panel")) {
      panel.style.display = panel.id === `tab-${tabId}` ? "block" : "none";
    }
  }
}

function buildLayerAccordion(layer) {
  const wrapper = document.createElement("div");
  wrapper.className = "layer-item" + (layer.disabled ? " layer-disabled" : "");

  // Header row: expand arrow + label + type tag + eye toggle
  const header = document.createElement("div");
  header.className = "layer-header";

  const arrow = document.createElement("span");
  arrow.className = "layer-arrow";
  arrow.textContent = "\u25B6"; // ▶
  arrow.setAttribute("aria-hidden", "true");
  header.appendChild(arrow);

  const label = document.createElement("span");
  label.className = "layer-label";
  label.textContent = layer.label;
  header.appendChild(label);

  const tag = document.createElement("span");
  tag.className = "mg-tag layer-type-tag";
  if (layer.type === "rt") tag.classList.add("mg-tag--accent");
  if (layer.type === "vt") tag.classList.add("mg-tag--secondary");
  tag.textContent = TYPE_LABELS[layer.type] || layer.type;
  header.appendChild(tag);

  if (!layer.disabled) {
    const eyeBtn = document.createElement("button");
    eyeBtn.className = "layer-eye";
    eyeBtn.setAttribute("aria-label", `Toggle ${layer.label}`);
    eyeBtn.setAttribute("aria-pressed", "false");
    eyeBtn.innerHTML = `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    eyeBtn.title = "Toggle layer";
    eyeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleLayer(layer, eyeBtn, wrapper);
    });
    header.appendChild(eyeBtn);
  }

  wrapper.appendChild(header);

  // Expandable body (description + controls)
  const body = document.createElement("div");
  body.className = "layer-body";
  body.style.display = "none";

  if (layer.desc) {
    const desc = document.createElement("p");
    desc.className = "layer-desc mg-form-help";
    desc.textContent = layer.desc;
    body.appendChild(desc);
  }

  // Opacity slider placeholder (added when layer is active)
  const sliderSlot = document.createElement("div");
  sliderSlot.className = "layer-slider-slot";
  body.appendChild(sliderSlot);

  // Legend slot
  const legendSlot = document.createElement("div");
  legendSlot.className = "layer-legend-slot";
  body.appendChild(legendSlot);

  wrapper.appendChild(body);

  // Toggle accordion on header click or Enter/Space
  if (!layer.disabled) {
    header.tabIndex = 0;
    header.setAttribute("role", "button");
    header.setAttribute("aria-expanded", "false");

    const toggleAccordion = () => {
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "block";
      arrow.textContent = open ? "\u25B6" : "\u25BC"; // ▶ / ▼
      header.setAttribute("aria-expanded", String(!open));
    };

    header.addEventListener("click", toggleAccordion);
    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion();
      }
    });
  }

  return wrapper;
}

async function toggleLayer(layer, eyeBtn, wrapper) {
  const sliderSlot = wrapper.querySelector(".layer-slider-slot");
  const legendSlot = wrapper.querySelector(".layer-legend-slot");

  if (store.openViews.has(layer.id)) {
    try {
      await viewRemove(layer.id);
    } catch (err) {
      console.warn(`Failed to remove layer ${layer.id}:`, err);
    }
    store.openViews.delete(layer.id);
    eyeBtn.classList.remove("is-active");
    eyeBtn.setAttribute("aria-pressed", "false");
    wrapper.classList.remove("layer-active");
    sliderSlot.innerHTML = "";
    legendSlot.innerHTML = "";
  } else {
    try {
      await viewAdd(layer.id);
    } catch (err) {
      console.warn(`Failed to add layer ${layer.id}:`, err);
      return; // Don't update UI if SDK call failed
    }
    store.openViews.add(layer.id);
    eyeBtn.classList.add("is-active");
    eyeBtn.setAttribute("aria-pressed", "true");
    wrapper.classList.add("layer-active");

    // Expand accordion to show controls
    const body = wrapper.querySelector(".layer-body");
    const header = wrapper.querySelector(".layer-header");
    const arrow = wrapper.querySelector(".layer-arrow");
    body.style.display = "block";
    arrow.textContent = "\u25BC";
    header.setAttribute("aria-expanded", "true");

    addOpacitySlider(layer.id, sliderSlot);
    addLegend(layer, legendSlot);
  }
}

async function addOpacitySlider(idView, container) {
  const row = document.createElement("div");
  row.className = "opacity-row";

  const lbl = document.createElement("label");
  lbl.textContent = "Opacity";
  row.appendChild(lbl);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "100";
  slider.value = "100";

  const valueDisplay = document.createElement("span");
  valueDisplay.className = "opacity-value";
  valueDisplay.textContent = "100%";

  // SDK uses "transparency" (0=opaque, 100=invisible); UI shows "opacity"
  // (0=invisible, 100=opaque). Convert: opacity = 100 - transparency.
  try {
    const current = await getViewLayerTransparency(idView);
    if (typeof current === "number") {
      slider.value = String(100 - current);
      valueDisplay.textContent = `${100 - current}%`;
    }
  } catch {
    // Default to 100% opacity
  }

  slider.addEventListener("input", async () => {
    const opacity = Number(slider.value);
    valueDisplay.textContent = `${opacity}%`;
    try {
      await setViewLayerTransparency(idView, 100 - opacity);
    } catch {
      // Transparency errors are non-fatal
    }
  });

  row.appendChild(slider);
  row.appendChild(valueDisplay);
  container.appendChild(row);
}

/**
 * Render the legend for a layer. If the layer config has a local `legend`
 * array, render HTML swatches from that. The SDK legend image (server-
 * rendered PNG) is still fetched -- shown as the primary legend when no
 * local override exists, or tucked into a collapsed diagnostic toggle
 * when one does.
 */
async function addLegend(layer, container) {
  const hasLocalLegend = Array.isArray(layer.legend) && layer.legend.length > 0;
  if (hasLocalLegend) {
    const el = document.createElement("div");
    el.className = "html-legend";
    for (const item of layer.legend) {
      const row = document.createElement("div");
      row.className = "html-legend-row";

      const swatch = document.createElement("span");
      swatch.className = "html-legend-swatch";
      swatch.style.background = item.color || "#ccc";
      row.appendChild(swatch);

      const label = document.createElement("span");
      label.className = "html-legend-label";
      label.textContent = item.label || "";
      row.appendChild(label);

      el.appendChild(row);
    }
    container.appendChild(el);
  }

  // Fetch SDK legend image
  try {
    const legendData = await getViewLegendImage(layer.id);
    if (!legendData) return;

    const img = document.createElement("img");
    img.className = "layer-legend-img";
    img.src = legendData.startsWith("data:")
      ? legendData
      : `data:image/png;base64,${legendData}`;
    img.alt = "SDK legend";

    if (hasLocalLegend) {
      // Show as collapsed diagnostic
      const details = document.createElement("details");
      details.className = "legend-diagnostic";
      const summary = document.createElement("summary");
      summary.textContent = "SDK legend (diagnostic)";
      details.appendChild(summary);
      details.appendChild(img);
      container.appendChild(details);
    } else {
      // No local override -- show SDK image directly
      container.appendChild(img);
    }
  } catch {
    // Not all layers have legends
  }
}

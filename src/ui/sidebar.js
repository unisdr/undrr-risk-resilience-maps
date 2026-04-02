import { TABS } from "../config/layers.js";
import * as store from "../state/store.js";
import { viewAdd, viewRemove, getViewLegendImage } from "../sdk/views.js";
import {
  setViewLayerTransparency,
  getViewLayerTransparency,
} from "../sdk/filters.js";

const TYPE_LABELS = { cc: "live", rt: "raster", vt: "vector" };

/**
 * Build the full sidebar: tab buttons + accordion layer panels.
 */
export function buildSidebar() {
  const sidebar = document.getElementById("sidebar");

  // Tab bar
  const tabBar = document.createElement("div");
  tabBar.className = "tab-bar";
  for (const tab of TABS) {
    const btn = document.createElement("button");
    btn.className = "tab-btn mg-button";
    btn.textContent = tab.label;
    btn.dataset.tab = tab.id;
    if (tab.id === store.activeTab) btn.classList.add("is-active");
    btn.addEventListener("click", () => switchTab(tab.id));
    tabBar.appendChild(btn);
  }
  sidebar.appendChild(tabBar);

  // Tab panels
  for (const tab of TABS) {
    const panel = document.createElement("div");
    panel.className = "tab-panel";
    panel.id = `tab-${tab.id}`;
    panel.style.display = tab.id === store.activeTab ? "block" : "none";

    for (const layer of tab.layers) {
      panel.appendChild(buildLayerAccordion(layer));
    }

    sidebar.appendChild(panel);
  }
}

function switchTab(tabId) {
  store.setActiveTab(tabId);

  // Update tab buttons
  for (const btn of document.querySelectorAll(".tab-btn")) {
    btn.classList.toggle("is-active", btn.dataset.tab === tabId);
  }

  // Show/hide panels
  for (const panel of document.querySelectorAll(".tab-panel")) {
    panel.style.display = panel.id === `tab-${tabId}` ? "block" : "none";
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
    eyeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
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

  // Toggle accordion on header click (not eye button)
  if (!layer.disabled) {
    header.addEventListener("click", () => {
      const open = body.style.display !== "none";
      body.style.display = open ? "none" : "block";
      arrow.textContent = open ? "\u25B6" : "\u25BC"; // ▶ / ▼
    });
  }

  return wrapper;
}

async function toggleLayer(layer, eyeBtn, wrapper) {
  const sliderSlot = wrapper.querySelector(".layer-slider-slot");
  const legendSlot = wrapper.querySelector(".layer-legend-slot");

  if (store.openViews.has(layer.id)) {
    await viewRemove(layer.id);
    store.openViews.delete(layer.id);
    eyeBtn.classList.remove("is-active");
    wrapper.classList.remove("layer-active");
    sliderSlot.innerHTML = "";
    legendSlot.innerHTML = "";
  } else {
    await viewAdd(layer.id);
    store.openViews.add(layer.id);
    eyeBtn.classList.add("is-active");
    wrapper.classList.add("layer-active");

    // Expand accordion to show controls
    const body = wrapper.querySelector(".layer-body");
    const arrow = wrapper.querySelector(".layer-arrow");
    body.style.display = "block";
    arrow.textContent = "\u25BC";

    addOpacitySlider(layer.id, sliderSlot);
    addLegend(layer.id, legendSlot);
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

  // Read current transparency from SDK
  try {
    const current = await getViewLayerTransparency(idView);
    if (typeof current === "number") {
      slider.value = String(100 - current);
      valueDisplay.textContent = `${100 - current}%`;
    }
  } catch {
    // Default to 100%
  }

  slider.addEventListener("input", async () => {
    const opacity = Number(slider.value);
    valueDisplay.textContent = `${opacity}%`;
    try {
      await setViewLayerTransparency(idView, 100 - opacity);
    } catch {
      // Silently ignore transparency errors
    }
  });

  row.appendChild(slider);
  row.appendChild(valueDisplay);
  container.appendChild(row);
}

async function addLegend(idView, container) {
  try {
    const legendData = await getViewLegendImage(idView);
    if (!legendData) return;

    const img = document.createElement("img");
    img.className = "layer-legend-img";
    img.src = legendData.startsWith("data:")
      ? legendData
      : `data:image/png;base64,${legendData}`;
    img.alt = "Legend";
    container.appendChild(img);
  } catch {
    // Not all layers have legends
  }
}

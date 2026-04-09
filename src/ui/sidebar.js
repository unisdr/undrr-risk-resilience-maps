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
import { isSDKReady } from "../sdk/client.js";
import {
  setViewLayerTransparency,
  getViewLayerTransparency,
} from "../sdk/filters.js";
import { buildHomePanel } from "./home.js";
import { buildGuidePanel, buildSourcesPanel, buildDownloadsPanel } from "./info-panels.js";
import { buildWidget, isCompound, compoundKey } from "./widgets/index.js";
import { parseHash, writeHash } from "../state/hash.js";

// MapX view types: cc = custom coded (live), rt = raster tile, vt = vector tile
const TYPE_LABELS = { cc: "live", rt: "raster", vt: "vector" };

const INFO_TABS = ["home", "guide", "sources", "downloads"];

// All valid tab IDs for hash routing
const ALL_TABS = [...INFO_TABS, ...["hazard", "exposure", "vulnerability", "risk"]];

/**
 * Build the UI and wire up all nav links.
 */
export function buildSidebar() {
  const sidebarBody = document.getElementById("panel-body");
  const panel = document.getElementById("sidebar");
  const toggle = document.getElementById("panel-toggle");
  const infoPage = document.getElementById("info-page");
  const clearBtn = document.getElementById("layer-clear-btn");

  // Collapse / expand sidebar
  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-collapsed");
  });

  // "Clear all" turns off every active layer across all tabs
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      for (const eyeBtn of document.querySelectorAll(".layer-eye.is-active")) {
        eyeBtn.click();
      }
    });
  }

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

  // Read initial tab from URL hash, fall back to default
  const { tab: hashTab } = parseHash();
  const initialTab = (hashTab && ALL_TABS.includes(hashTab)) ? hashTab : store.activeTab;
  switchTab(initialTab);

  // Browser back/forward: reconcile both tab and layer state from the new hash
  window.addEventListener("hashchange", () => {
    const { tab, layers: hashLayers } = parseHash();
    if (tab && ALL_TABS.includes(tab) && tab !== store.activeTab) switchTab(tab);
    if (isSDKReady()) reconcileLayersFromHash(hashLayers);
  });

  // Home page category cards dispatch a custom event to navigate to a data tab
  document.addEventListener("navigate-tab", (e) => {
    const tabId = e.detail;
    if (tabId && ALL_TABS.includes(tabId)) {
      switchTab(tabId);
      // Expand the sidebar panel if it was collapsed
      const panel = document.getElementById("sidebar");
      if (panel) panel.classList.remove("is-collapsed");
    }
  });
}

function switchTab(tabId) {
  store.setActiveTab(tabId);
  syncHashFromState();

  const appMap = document.getElementById("app-map");
  const infoPage = document.getElementById("info-page");
  const isInfoTab = INFO_TABS.includes(tabId);

  // Toggle map vs full-page info view
  appMap.style.display = isInfoTab ? "none" : "";
  infoPage.style.display = isInfoTab ? "block" : "none";

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
      if (el) el.style.display = el.id === `tab-${tabId}` ? "block" : "none";
    }
  } else {
    // Show the right layer panel in the sidebar, hide the others
    for (const panel of document.querySelectorAll(".tab-panel")) {
      panel.style.display = panel.id === `tab-${tabId}` ? "block" : "none";
    }
  }
}

/**
 * Write current state (active tab + open layers) to the URL hash.
 * Called after every tab switch, layer toggle, and source switch.
 */
function syncHashFromState() {
  const layers = [];
  for (const tab of TABS) {
    for (const layer of tab.layers) {
      if (!layer.key || layer.disabled) continue;
      const compound = isCompound(layer);
      if (compound) {
        const activeSource = layer.sources.find((s) => store.openViews.has(s.id));
        if (activeSource) {
          const idx = layer.sources.indexOf(activeSource);
          layers.push({ key: layer.key, sourceIdx: idx });
        }
      } else if (store.openViews.has(layer.id)) {
        layers.push({ key: layer.key, sourceIdx: 0 });
      }
    }
  }
  writeHash(store.activeTab, layers);
  updateClearBtn();
}

/** Show/hide the "Clear all" button based on whether any layers are active. */
function updateClearBtn() {
  const clearBtn = document.getElementById("layer-clear-btn");
  if (clearBtn) clearBtn.hidden = store.openViews.size === 0;
}

/**
 * Clamp a sourceIdx from the hash to valid bounds for the given layer.
 * Returns 0 if the value is invalid or out of range.
 */
function safeSourceIdx(layer, sourceIdx) {
  if (!isCompound(layer)) return 0;
  const n = layer.sources.length;
  return Number.isInteger(sourceIdx) && sourceIdx >= 0 && sourceIdx < n
    ? sourceIdx
    : 0;
}

/**
 * Restore layer state from the URL hash. Call after SDK is ready.
 * Programmatically clicks the eye button for each layer in the hash.
 */
export async function restoreLayersFromHash() {
  const { layers } = parseHash();
  if (layers.length === 0) return;

  for (const { key, sourceIdx } of layers) {
    // Find the layer config and its DOM wrapper
    for (const tab of TABS) {
      for (let i = 0; i < tab.layers.length; i++) {
        const layer = tab.layers[i];
        if (layer.key !== key || layer.disabled) continue;

        // Validate and clamp source index before storing
        const safeIdx = safeSourceIdx(layer, sourceIdx);
        if (isCompound(layer) && safeIdx > 0) {
          store.setActiveSource(compoundKey(layer), safeIdx);
        }

        // Find the corresponding DOM eye button and click it
        const tabPanel = document.getElementById(`tab-${tab.id}`);
        if (!tabPanel) continue;
        const items = tabPanel.querySelectorAll(".layer-item");
        const eyeBtn = items[i]?.querySelector(".layer-eye");
        if (eyeBtn && !eyeBtn.classList.contains("is-active")) {
          eyeBtn.click();
        }
      }
    }
  }
}

/**
 * Reconcile open layer state against a parsed hash layers array.
 * Called on hashchange (back/forward) after initial load.
 * Turns off layers not in the hash, turns on layers that should be on.
 */
async function reconcileLayersFromHash(hashLayers) {
  const targetKeys = new Set(hashLayers.map((l) => l.key));

  // Build a flat list of all active layer keys from current state
  for (const tab of TABS) {
    for (let i = 0; i < tab.layers.length; i++) {
      const layer = tab.layers[i];
      if (!layer.key || layer.disabled) continue;

      const tabPanel = document.getElementById(`tab-${tab.id}`);
      if (!tabPanel) continue;
      const items = tabPanel.querySelectorAll(".layer-item");
      const eyeBtn = items[i]?.querySelector(".layer-eye");
      if (!eyeBtn) continue;

      const isOn = eyeBtn.classList.contains("is-active");
      const shouldBeOn = targetKeys.has(layer.key);

      if (isOn && !shouldBeOn) {
        eyeBtn.click(); // turn off
      } else if (!isOn && shouldBeOn) {
        // Apply source index before turning on
        const entry = hashLayers.find((l) => l.key === layer.key);
        if (entry && isCompound(layer)) {
          const safeIdx = safeSourceIdx(layer, entry.sourceIdx);
          if (safeIdx > 0) store.setActiveSource(compoundKey(layer), safeIdx);
        }
        eyeBtn.click(); // turn on
      }
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

  // Widget slot (compound layers render source-switcher here)
  const widgetSlot = document.createElement("div");
  widgetSlot.className = "layer-widget-slot";
  body.appendChild(widgetSlot);

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
  // Guard: SDK must be ready before attempting map operations
  if (!isSDKReady()) {
    const label = wrapper.querySelector(".layer-label");
    const msg = label ? `${label.textContent} cannot be toggled yet — map is still loading.` : "Map is still loading.";
    console.warn(msg);
    return;
  }

  const widgetSlot = wrapper.querySelector(".layer-widget-slot");
  const sliderSlot = wrapper.querySelector(".layer-slider-slot");
  const legendSlot = wrapper.querySelector(".layer-legend-slot");
  const compound = isCompound(layer);

  // Determine which view ID is currently active
  const key = compound ? compoundKey(layer) : null;
  const activeIdx = compound ? store.getActiveSource(key) : 0;
  // Guard against out-of-bounds active index (defensive; shouldn't happen with validated config)
  const safeIdx = compound && activeIdx < layer.sources.length ? activeIdx : 0;
  const activeViewId = compound ? layer.sources[safeIdx].id : layer.id;

  // Is this layer currently on? For compound layers, check if ANY source is open.
  const isOn = compound
    ? layer.sources.some((s) => store.openViews.has(s.id))
    : store.openViews.has(layer.id);

  if (isOn) {
    // Turn off -- remove whichever source view is active
    const removeId = compound
      ? layer.sources.find((s) => store.openViews.has(s.id))?.id
      : layer.id;
    if (removeId) {
      try { await viewRemove(removeId); } catch (err) {
        console.warn(`Failed to remove view ${removeId}:`, err);
      }
      store.openViews.delete(removeId);
    }
    eyeBtn.classList.remove("is-active");
    eyeBtn.setAttribute("aria-pressed", "false");
    wrapper.classList.remove("layer-active");
    widgetSlot.innerHTML = "";
    sliderSlot.innerHTML = "";
    legendSlot.innerHTML = "";
    syncHashFromState();
  } else {
    // Turn on
    try { await viewAdd(activeViewId); } catch (err) {
      console.warn(`Failed to add view ${activeViewId}:`, err);
      return;
    }
    store.openViews.add(activeViewId);
    eyeBtn.classList.add("is-active");
    eyeBtn.setAttribute("aria-pressed", "true");
    wrapper.classList.add("layer-active");

    // Expand accordion
    const body = wrapper.querySelector(".layer-body");
    const header = wrapper.querySelector(".layer-header");
    const arrow = wrapper.querySelector(".layer-arrow");
    body.style.display = "block";
    arrow.textContent = "\u25BC";
    header.setAttribute("aria-expanded", "true");

    // Build source-switching widget for compound layers
    if (compound && layer.widget) {
      const descEl = wrapper.querySelector(".layer-desc");
      const widgetEl = buildWidget(
        layer.widget, layer.sources, activeIdx,
        (newIdx) => switchSource(layer, key, newIdx, descEl, sliderSlot, legendSlot),
      );
      if (widgetEl) widgetSlot.appendChild(widgetEl);

      // Show the active source's description instead of the parent's
      if (descEl && layer.sources[activeIdx].desc) {
        descEl.textContent = layer.sources[activeIdx].desc;
      }
    }

    addOpacitySlider(activeViewId, sliderSlot);
    // For compound layers, merge the active source's fields (desc, legend)
    // onto the parent layer so addLegend sees the right data.
    const legendLayer = compound
      ? { ...layer, ...layer.sources[activeIdx], label: layer.label }
      : layer;
    addLegend(legendLayer, legendSlot);
    syncHashFromState();
  }
}

/**
 * Switch between sources within a compound layer.
 * Removes the old view, adds the new one, and rebuilds controls.
 */
async function switchSource(layer, key, newIdx, descEl, sliderSlot, legendSlot) {
  const oldIdx = store.getActiveSource(key);
  const oldId = layer.sources[oldIdx].id;
  const newId = layer.sources[newIdx].id;
  if (oldId === newId) return;

  // Remove old, add new
  try { await viewRemove(oldId); } catch (e) { console.warn(e); }
  store.openViews.delete(oldId);

  try { await viewAdd(newId); } catch (e) {
    // Rollback: re-add old view if new one fails
    console.warn(`Failed to switch to source ${newIdx}:`, e);
    try { await viewAdd(oldId); store.openViews.add(oldId); } catch { /* */ }
    return;
  }
  store.openViews.add(newId);
  store.setActiveSource(key, newIdx);
  syncHashFromState();

  // Update description to the new source's text
  if (descEl && layer.sources[newIdx].desc) {
    descEl.textContent = layer.sources[newIdx].desc;
  }

  // Rebuild opacity slider and legend for the new source
  sliderSlot.innerHTML = "";
  addOpacitySlider(newId, sliderSlot);

  legendSlot.innerHTML = "";
  const legendLayer = { ...layer, ...layer.sources[newIdx], label: layer.label };
  addLegend(legendLayer, legendSlot);
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

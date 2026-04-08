/**
 * Layer config validation.
 *
 * Run at startup to catch typos and structural errors in config/layers.js
 * before the app tries to talk to the SDK. Throws on the first batch of
 * errors so they show up immediately in the console.
 */

const VALID_TYPES = ["rt", "vt", "cc"];

export function validateLayers(tabs) {
  const errors = [];
  const seenIds = new Set();

  for (const tab of tabs) {
    if (!tab.id || !tab.label || !Array.isArray(tab.layers)) {
      errors.push(`Tab missing id, label, or layers: ${JSON.stringify(tab)}`);
      continue;
    }

    for (const layer of tab.layers) {
      const ctx = `[${tab.id}] "${layer.label || "(no label)"}"`;
      const compound = Array.isArray(layer.sources) && layer.sources.length > 0;

      if (!layer.label) {
        errors.push(`${ctx} -- missing label`);
      }

      if (!VALID_TYPES.includes(layer.type)) {
        errors.push(`${ctx} -- invalid type "${layer.type}" (expected: ${VALID_TYPES.join(", ")})`);
      }

      if (compound) {
        // Compound layer: validate sources and widget
        if (!layer.widget || !layer.widget.type) {
          errors.push(`${ctx} -- compound layer missing widget.type`);
        }
        for (let s = 0; s < layer.sources.length; s++) {
          const src = layer.sources[s];
          if (!src.id || typeof src.id !== "string") {
            errors.push(`${ctx} -- sources[${s}] missing id`);
          }
          if (!src.label) {
            errors.push(`${ctx} -- sources[${s}] missing label`);
          }
          if (src.id && seenIds.has(src.id)) {
            console.warn(`Layer config: ${ctx} sources[${s}] reuses id "${src.id}"`);
          }
          if (src.id) seenIds.add(src.id);
        }
      } else {
        // Simple layer: must have a string ID (unless disabled)
        if (!layer.disabled && (typeof layer.id !== "string" || !layer.id)) {
          errors.push(`${ctx} -- enabled layer missing id`);
        }
      }

      // Warn on duplicate IDs (same view in multiple tabs is valid but notable)
      if (layer.id && seenIds.has(layer.id)) {
        console.warn(`Layer config: ${ctx} reuses id "${layer.id}" (shared across tabs)`);
      }
      if (layer.id) seenIds.add(layer.id);

      // Legend entries should have color + label
      if (Array.isArray(layer.legend)) {
        for (let i = 0; i < layer.legend.length; i++) {
          const item = layer.legend[i];
          if (!item.color) {
            errors.push(`${ctx} -- legend[${i}] missing color`);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("Layer config validation failed:");
    for (const err of errors) console.error(`  - ${err}`);
    throw new Error(`${errors.length} layer config error(s) -- see console`);
  }
}

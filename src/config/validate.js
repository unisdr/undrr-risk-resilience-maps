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

      if (!layer.label) {
        errors.push(`${ctx} -- missing label`);
      }

      if (!VALID_TYPES.includes(layer.type)) {
        errors.push(`${ctx} -- invalid type "${layer.type}" (expected: ${VALID_TYPES.join(", ")})`);
      }

      // Enabled layers must have a string ID
      if (!layer.disabled && (typeof layer.id !== "string" || !layer.id)) {
        errors.push(`${ctx} -- enabled layer missing id`);
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

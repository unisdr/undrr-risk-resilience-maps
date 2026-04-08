/**
 * Layer definitions organised by category.
 *
 * Each category file defines an array of layer objects. See validate.js
 * for the expected schema. To add a new layer, edit the relevant category
 * file -- no changes to UI code should be needed.
 *
 * Layer fields:
 *   id       - MapX view ID (null for "coming soon" layers)
 *   label    - Display name
 *   type     - "rt" (raster), "vt" (vector), or "cc" (custom coded / live)
 *   desc     - Short description shown when the layer accordion is expanded
 *   project  - MapX project ID that owns the view
 *   disabled - true = greyed out, not toggleable
 *   legend   - optional [{color, label}] array for local HTML legend override
 */
import { HAZARD_LAYERS } from "./hazard.js";
import { EXPOSURE_LAYERS } from "./exposure.js";
import { VULNERABILITY_LAYERS } from "./vulnerability.js";
import { RISK_LAYERS } from "./risk.js";
export { ECO_DRR, HOME, CDC } from "./projects.js";

export const TABS = [
  { id: "hazard", label: "Hazard", layers: HAZARD_LAYERS },
  { id: "exposure", label: "Exposure", layers: EXPOSURE_LAYERS },
  { id: "vulnerability", label: "Vulnerability", layers: VULNERABILITY_LAYERS },
  { id: "risk", label: "Risk", layers: RISK_LAYERS },
];

export const PRIMARY_PROJECT = "MX-2LD-FBB-58N-ROK-8RH";

import { ECO_DRR } from "./projects.js";

export const RISK_LAYERS = [
  {
    // TODO: replace with a composite risk view ID once available in MapX.
    // These IDs are currently shared with hazard exposure sources, which
    // corrupts toggle state. Disabled until dedicated risk views exist.
    id: null,
    key: "risk-river-flood",
    label: "River Flood Exposure",
    type: "rt",
    desc: "Annual physical exposure to river floods.",
    source: "Derived from hazard and exposure layers (GAR/PREVIEW).",
    note: "Disabled — dedicated risk view ID not yet available in MapX; current ID conflicts with hazard layer.",
    project: ECO_DRR,
    disabled: true,
  },
  {
    id: null,
    key: "risk-cyclone",
    label: "Cyclone Exposure",
    type: "rt",
    desc: "Annual physical exposure to tropical cyclones.",
    source: "Derived from hazard and exposure layers (GAR/PREVIEW).",
    note: "Disabled — dedicated risk view ID not yet available in MapX; current ID conflicts with hazard layer.",
    project: ECO_DRR,
    disabled: true,
  },
  {
    id: null,
    key: "risk-landslide",
    label: "Landslide Exposure",
    type: "rt",
    desc: "Annual physical exposure to landslides.",
    source: "Derived from hazard and exposure layers (GAR/PREVIEW).",
    note: "Disabled — dedicated risk view ID not yet available in MapX; current ID conflicts with hazard layer.",
    project: ECO_DRR,
    disabled: true,
  },
];

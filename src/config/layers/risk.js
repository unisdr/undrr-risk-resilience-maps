import { ECO_DRR } from "./projects.js";

export const RISK_LAYERS = [
  {
    id: "MX-4918F-8A0E5-AF76B",
    key: "risk-river-flood",
    label: "River Flood Exposure",
    type: "rt",
    desc: "Annual physical exposure to river floods.",
    project: ECO_DRR,
  },
  {
    id: "MX-10AE5-746D1-76777",
    key: "risk-cyclone",
    label: "Cyclone Exposure",
    type: "rt",
    desc: "Annual physical exposure to tropical cyclones.",
    project: ECO_DRR,
  },
  {
    id: "MX-04E66-2E550-81068",
    key: "risk-landslide",
    label: "Landslide Exposure",
    type: "rt",
    desc: "Annual physical exposure to landslides.",
    project: ECO_DRR,
  },
];

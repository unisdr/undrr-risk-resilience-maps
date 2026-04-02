/**
 * Layer definitions organised by GRI Risk Viewer tab categories.
 *
 * Each layer has:
 *   id       - MapX view ID
 *   label    - Display name
 *   type     - MapX view type (rt=raster, vt=vector, cc=custom coded)
 *   desc     - Short description shown when layer is expanded
 *   project  - MapX project ID (for cross-project awareness)
 *   disabled - true if layer is "coming soon" (greyed out, not toggleable)
 *
 * Layers from the Eco-DRR project (MX-2LD-FBB-58N-ROK-8RH) can be loaded
 * directly. Layers from other projects will need cross-project handling.
 */

const ECO_DRR = "MX-2LD-FBB-58N-ROK-8RH";
const HOME = "MX-YBJ-YYF-08R-UUR-QW6";
const CDC = "MX-CDC-CTV-4PZ-VQD-OZ3";

export const TABS = [
  {
    id: "hazard",
    label: "Hazard",
    layers: [
      {
        id: "MX-V07LO-829XA-4BIZ8",
        label: "River Flooding",
        type: "rt",
        desc: "Flood hazard 25yr return period (GAR model).",
        project: ECO_DRR,
      },
      {
        id: "MX-21A2A-BED99-D8D78",
        label: "River Flood Frequency",
        type: "rt",
        desc: "Annual frequency of river floods, 25-1000yr return period.",
        project: ECO_DRR,
      },
      {
        id: "MX-8C214-22C3A-82165",
        label: "Cyclone Surge Exposure",
        type: "rt",
        desc: "Annual physical exposure to surges from cyclones.",
        project: ECO_DRR,
      },
      {
        id: "MX-E180C-5B012-AFC77",
        label: "Tropical Cyclone Frequency",
        type: "rt",
        desc: "Cyclone wind speed probabilities (STORM dataset).",
        project: ECO_DRR,
      },
      {
        id: "MX-10AE5-746D1-76777",
        label: "Tropical Cyclone Exposure",
        type: "rt",
        desc: "Annual physical exposure to tropical cyclones.",
        project: ECO_DRR,
      },
      {
        id: "MX-04E66-2E550-81068",
        label: "Landslide Exposure",
        type: "rt",
        desc: "Annual exposure to landslides (earthquake + precipitation triggered).",
        project: ECO_DRR,
      },
      {
        id: "MX-05247-89997-66A64",
        label: "Landslide Frequency",
        type: "rt",
        desc: "Annual frequency of landslides.",
        project: ECO_DRR,
      },
      {
        id: "MX-YLZJG-JAIID-V27X5",
        label: "Earthquakes (live)",
        type: "cc",
        desc: "USGS Mag >= 5.5, past 30 days. Updated every 15 min.",
        project: ECO_DRR,
      },
      {
        id: "MX-F0DEE-12D97-6447B",
        label: "Tsunami Exposure",
        type: "rt",
        desc: "Annual physical exposure to tsunamis.",
        project: ECO_DRR,
      },
      {
        id: "MX-D7314-A5044-83377",
        label: "Tsunami Frequency",
        type: "rt",
        desc: "Annual frequency of tsunamis.",
        project: ECO_DRR,
      },
    ],
  },
  {
    id: "exposure",
    label: "Exposure",
    layers: [
      {
        id: "MX-6YLMU-U4WXC-2JJD7",
        label: "Population",
        type: "rt",
        desc: "Population distribution (HRSL/GHSL 2022).",
        project: ECO_DRR,
      },
      {
        id: "MX-KG1JB-OI13A-6RHKN",
        label: "Land Cover",
        type: "cc",
        desc: "ESA WorldCover 10m (2021). Sentinel-1/2 based.",
        project: HOME,
      },
      {
        id: "MX-8F9EB-10D0B-93564",
        label: "Forests",
        type: "rt",
        desc: "Global forest coverage (MODIS, 2020).",
        project: ECO_DRR,
      },
      {
        id: "MX-AB65A-A5AD3-06D68",
        label: "Mangroves",
        type: "rt",
        desc: "Global Mangrove Watch (1996-2016).",
        project: ECO_DRR,
      },
      {
        id: "MX-726D3-C0F95-0D97A",
        label: "Coral Reefs",
        type: "rt",
        desc: "Global coral reef distribution.",
        project: ECO_DRR,
      },
      {
        id: null,
        label: "Roads & Rail",
        type: "vt",
        desc: "Global road and rail network.",
        disabled: true,
      },
      {
        id: null,
        label: "Power Plants",
        type: "vt",
        desc: "WRI Global Power Plants Database.",
        disabled: true,
      },
    ],
  },
  {
    id: "vulnerability",
    label: "Vulnerability",
    layers: [
      {
        id: "MX-FX1HT-Z7KXL-8X22K",
        label: "Intact Forest Landscapes",
        type: "vt",
        desc: "Large intact forest ecosystems (IFLs).",
        project: ECO_DRR,
      },
      {
        id: "MX-1L2TA-6FXPV-N3QMX",
        label: "Water Stress (RCP8.5 2030)",
        type: "vt",
        desc: "Projected change in water stress.",
        project: ECO_DRR,
      },
      {
        id: null,
        label: "Human Development Index",
        type: "vt",
        desc: "Subnational HDI.",
        disabled: true,
      },
      {
        id: null,
        label: "Relative Wealth Index",
        type: "vt",
        desc: "Meta Data for Good.",
        disabled: true,
      },
    ],
  },
  {
    id: "risk",
    label: "Risk",
    layers: [
      {
        id: "MX-4918F-8A0E5-AF76B",
        label: "River Flood Exposure",
        type: "rt",
        desc: "Annual physical exposure to river floods.",
        project: ECO_DRR,
      },
      {
        id: "MX-10AE5-746D1-76777",
        label: "Cyclone Exposure",
        type: "rt",
        desc: "Annual physical exposure to tropical cyclones.",
        project: ECO_DRR,
      },
      {
        id: "MX-04E66-2E550-81068",
        label: "Landslide Exposure",
        type: "rt",
        desc: "Annual physical exposure to landslides.",
        project: ECO_DRR,
      },
    ],
  },
];

export const PRIMARY_PROJECT = ECO_DRR;

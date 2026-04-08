/**
 * App entry point.
 *
 * Initialises the MapX SDK iframe, waits for the map to be ready, then
 * builds the sidebar UI and wires up map click events. Everything after
 * initSDK() must wait for the "ready" event -- the map isn't interactive
 * until MapX finishes loading inside the iframe.
 */
import { initSDK } from "./sdk/client.js";
import { TABS, PRIMARY_PROJECT } from "./config/layers.js";
import { validateLayers } from "./config/validate.js";
import { buildSidebar } from "./ui/sidebar.js";
import { showInfobox } from "./ui/infobox.js";
import "./styles/shared.css";

// Fail fast if layer config has problems (typos, missing IDs, etc.)
validateLayers(TABS);

const mapx = initSDK(document.getElementById("mapx"), PRIMARY_PROJECT);

mapx.on("ready", async () => {
  buildSidebar();

  // Enable click-to-inspect on vector features in the map
  await mapx.ask("set_vector_highlight", { enable: true });
});

// The SDK fires click_attributes with varying arg shapes depending on
// the view type -- sometimes a single object, sometimes an array.
mapx.on("click_attributes", (...args) => {
  showInfobox(args.length === 1 ? args[0] : args);
});

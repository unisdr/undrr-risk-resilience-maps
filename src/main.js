import { initSDK } from "./sdk/client.js";
import { PRIMARY_PROJECT } from "./config/layers.js";
import { buildSidebar } from "./ui/sidebar.js";
import { showInfobox } from "./ui/infobox.js";
import "./styles/shared.css";

const mapx = initSDK(document.getElementById("mapx"), PRIMARY_PROJECT);

mapx.on("ready", async () => {
  document.getElementById("status").textContent = "Connected";
  document.getElementById("status").classList.add("status-ok");

  buildSidebar();

  await mapx.ask("set_vector_highlight", { enable: true });
});

mapx.on("click_attributes", (...args) => {
  showInfobox(args.length === 1 ? args[0] : args);
});

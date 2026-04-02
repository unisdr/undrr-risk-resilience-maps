import { getSDK } from "./client.js";

export function setViewLayerTransparency(idView, value) {
  return getSDK().ask("set_view_layer_transparency", { idView, value });
}

export function getViewLayerTransparency(idView) {
  return getSDK().ask("get_view_layer_transparency", { idView });
}

import { getSDK } from "./client.js";

export function mapFlyTo(options) {
  return getSDK().ask("map_fly_to", options);
}

export function mapGetZoom() {
  return getSDK().ask("map_get_zoom");
}

export function commonLocFitBbox(code, param) {
  return getSDK().ask("common_loc_fit_bbox", { code, param });
}

export function commonLocGetListCodes() {
  return getSDK().ask("common_loc_get_list_codes");
}

export function setModeAerial(action) {
  return getSDK().ask("set_mode_aerial", { action });
}

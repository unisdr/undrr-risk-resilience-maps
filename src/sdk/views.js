import { getSDK } from "./client.js";

export function viewAdd(idView) {
  return getSDK().ask("view_add", { idView });
}

export function viewRemove(idView) {
  return getSDK().ask("view_remove", { idView });
}

export function getViewLegendImage(idView) {
  return getSDK().ask("get_view_legend_image", { idView });
}

export function getViewMeta(idView) {
  return getSDK().ask("get_view_meta", { idView });
}

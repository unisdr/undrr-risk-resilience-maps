/** Active MapX views (layer IDs currently displayed on the map). */
export const openViews = new Set();

/** Currently active sidebar tab ID. */
export let activeTab = "hazard";

export function setActiveTab(tabId) {
  activeTab = tabId;
}

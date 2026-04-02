const SKIP_KEYS = ["gid", "mx_t0", "mx_t1", "geom", "geometry"];

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function showInfobox(data) {
  const box = document.getElementById("infobox");
  if (!box) return;

  if (!data || typeof data !== "object") {
    box.style.display = "none";
    return;
  }

  let props = null;
  if (
    data.attributes &&
    Array.isArray(data.attributes) &&
    data.attributes.length > 0
  ) {
    props = data.attributes[0];
  } else if (
    data.attributes &&
    typeof data.attributes === "object" &&
    !Array.isArray(data.attributes)
  ) {
    props = data.attributes;
  }

  if (!props || typeof props !== "object") {
    box.style.display = "none";
    return;
  }

  const entries = Object.entries(props).filter(
    ([k, v]) => !SKIP_KEYS.includes(k.toLowerCase()) && v != null && v !== "",
  );

  if (entries.length === 0) {
    box.style.display = "none";
    return;
  }

  const nameEntry = entries.find(([k]) =>
    ["name", "title", "label"].includes(k.toLowerCase()),
  );
  const featureName = nameEntry ? String(nameEntry[1]) : "Feature";

  const title = box.querySelector(".infobox-title");
  const body = box.querySelector(".infobox-body");
  const closeBtn = box.querySelector(".infobox-close");

  if (title) title.textContent = featureName;

  if (body) {
    let html = '<table class="mg-table mg-table--small">';
    for (const [key, value] of entries) {
      const label = key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      html += `<tr><td>${esc(label)}</td><td>${esc(value)}</td></tr>`;
    }
    html += "</table>";
    body.innerHTML = html;
  }

  box.style.display = "block";
  if (closeBtn) {
    closeBtn.onclick = () => {
      box.style.display = "none";
    };
  }
}

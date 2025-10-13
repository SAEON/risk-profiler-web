// src/utils/format.js

export function fmtNum(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  if (Math.abs(n) >= 1000 && !Number.isInteger(n))
    return n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  if (Math.abs(n) >= 1000) return n.toLocaleString();
  if (Math.abs(n) >= 100) return n.toFixed(1);
  if (Math.abs(n) >= 10) return n.toFixed(2);
  return n.toFixed(2);
}

export function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Small, dependency-free formatting helpers shared by every page.

export const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(typeof d === "string" && d.length === 10 ? `${d}T00:00:00` : d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const num = (n) => Number(n || 0).toLocaleString("en-US");

// 3.84 -> "3.8%" ; 0 -> "0%"
export const pct = (part, whole) => {
  const p = Number(part || 0), w = Number(whole || 0);
  if (!w || !p) return "0%";
  return `${((p / w) * 100).toFixed(1)}%`;
};

export const today = () => new Date().toISOString().slice(0, 10);

// The newest row (highest id) from a list, or null.
export const latestBy = (rows, key = "academic_period_id") =>
  rows.reduce((best, r) => (!best || Number(r[key]) > Number(best[key]) ? r : best), null);
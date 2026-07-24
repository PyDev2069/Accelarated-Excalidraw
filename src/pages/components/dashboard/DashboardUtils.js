// ── local-only favorites ─────────────────────────────────────────────────
// Not part of boardStorage.js — board objects don't have a `favorite`
// field yet, so this persists a simple id list in localStorage instead.
const FAVORITES_KEY = "whiteboard-dashboard-favorites";

export function loadFavoriteIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch {
    return new Set();
  }
}
export function saveFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
}

export function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Muted gradient pairs cycled per thumbnail — background for the vector art.
export const THUMB_GRADIENTS = [
  "from-slate-200 to-slate-300",
  "from-indigo-100 to-indigo-200",
  "from-amber-100 to-orange-200",
  "from-emerald-100 to-teal-200",
  "from-rose-100 to-pink-200",
];

// Stroke/fill colors paired to each gradient above, used by the placeholder art.
export const THUMB_TINTS = [
  { stroke: "#94A3B8", fill: "#CBD5E1" },
  { stroke: "#818CF8", fill: "#C7D2FE" },
  { stroke: "#FB923C", fill: "#FED7AA" },
  { stroke: "#2DD4BF", fill: "#99F6E4" },
  { stroke: "#FB7185", fill: "#FBCFE8" },
];

export const DATE_FILTERS = [
  { key: "all", label: "All dates" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];
export const SORTS = [
  { key: "recent", label: "Recent" },
  { key: "name", label: "Name A–Z" },
];
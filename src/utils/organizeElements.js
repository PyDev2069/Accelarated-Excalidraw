/**
 * organizeElements.js
 * ────────────────────
 * Pure layout engine — no React, no Excalidraw API calls.
 * Takes an array of Excalidraw elements and returns a new array
 * with updated x/y coordinates so everything is neatly arranged.
 *
 * Strategy
 * ─────────
 * 1. Ignore deleted elements.
 * 2. Build a connectivity graph: two elements are "connected" if
 *    they share an arrow/line endpoint, OR their bounding boxes
 *    overlap or are within PROXIMITY_THRESHOLD px of each other.
 * 3. Union-Find to extract clusters of connected elements.
 * 4. Sort clusters by size (largest first) then by original top-left position.
 * 5. Lay clusters out in a left-to-right, top-to-bottom grid with
 *    GAP_BETWEEN_CLUSTERS spacing, preserving relative positions within
 *    each cluster.
 * 6. Within each cluster, if it contains only unconnected text/shape items
 *    (no arrows between them), apply a tidy column layout to those items too.
 * 7. Return the full element array with updated x/y (arrows use
 *    startBinding/endBinding so their visual path auto-updates; we also
 *    shift their points array).
 */

const PROXIMITY_THRESHOLD = 40;   // px — elements this close are "same cluster"
const GAP_BETWEEN_CLUSTERS = 80;  // px — space between clusters in the grid
const CLUSTER_COLS = 3;           // max clusters per row before wrapping
const INNER_GAP = 24;             // px — gap inside a cluster when tidying loose items
const CANVAS_ORIGIN_X = 100;      // where the first cluster lands on the canvas
const CANVAS_ORIGIN_Y = 100;

// ── Bounding box helpers ──────────────────────────────────────────────────────

function getBBox(el) {
  return {
    x1: el.x,
    y1: el.y,
    x2: el.x + (el.width  || 0),
    y2: el.y + (el.height || 0),
  };
}

function bboxWidth(bb)  { return bb.x2 - bb.x1; }
function bboxHeight(bb) { return bb.y2 - bb.y1; }

function bboxesNear(a, b, threshold) {
  return (
    a.x1 - threshold <= b.x2 &&
    b.x1 - threshold <= a.x2 &&
    a.y1 - threshold <= b.y2 &&
    b.y1 - threshold <= a.y2
  );
}

// ── Union-Find ────────────────────────────────────────────────────────────────

function makeUnionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank   = new Array(n).fill(0);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(x, y) {
    const rx = find(x), ry = find(y);
    if (rx === ry) return;
    if (rank[rx] < rank[ry]) parent[rx] = ry;
    else if (rank[rx] > rank[ry]) parent[ry] = rx;
    else { parent[ry] = rx; rank[rx]++; }
  }
  return { find, union };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {Array} elements  — raw Excalidraw element array (may include deleted)
 * @returns {Array}         — same array shape, updated x/y for live elements
 */
export function organizeElements(elements) {
  // Work only with non-deleted elements
  const live = elements.filter(el => !el.isDeleted);
  if (live.length === 0) return elements;

  const n = live.length;
  const idxById = new Map(live.map((el, i) => [el.id, i]));
  const uf = makeUnionFind(n);

  // ── Step 1: union elements connected by arrows / lines ───────────────────
  for (const el of live) {
    if (el.type !== "arrow" && el.type !== "line") continue;
    const startId = el.startBinding?.elementId;
    const endId   = el.endBinding?.elementId;
    if (startId && endId && idxById.has(startId) && idxById.has(endId)) {
      uf.union(idxById.get(startId), idxById.get(endId));
    }
    // Also union the arrow itself with whatever it's bound to
    const arrowIdx = idxById.get(el.id);
    if (startId && idxById.has(startId)) uf.union(arrowIdx, idxById.get(startId));
    if (endId   && idxById.has(endId))   uf.union(arrowIdx, idxById.get(endId));
  }

  // ── Step 2: union by proximity ───────────────────────────────────────────
  const bboxes = live.map(getBBox);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (bboxesNear(bboxes[i], bboxes[j], PROXIMITY_THRESHOLD)) {
        uf.union(i, j);
      }
    }
  }

  // ── Step 3: group into clusters ──────────────────────────────────────────
  const clusterMap = new Map(); // root → [indices]
  for (let i = 0; i < n; i++) {
    const root = uf.find(i);
    if (!clusterMap.has(root)) clusterMap.set(root, []);
    clusterMap.get(root).push(i);
  }

  // Convert to array of { indices, bbox }
  let clusters = [...clusterMap.values()].map(indices => {
    const clusterEls = indices.map(i => live[i]);
    const x1 = Math.min(...clusterEls.map(el => el.x));
    const y1 = Math.min(...clusterEls.map(el => el.y));
    const x2 = Math.max(...clusterEls.map(el => el.x + (el.width  || 0)));
    const y2 = Math.max(...clusterEls.map(el => el.y + (el.height || 0)));
    return { indices, x1, y1, x2, y2 };
  });

  // ── Step 4: sort clusters — biggest first, then top-left original pos ────
  clusters.sort((a, b) => {
    const sizeA = (a.x2 - a.x1) * (a.y2 - a.y1);
    const sizeB = (b.x2 - b.x1) * (b.y2 - b.y1);
    if (Math.abs(sizeA - sizeB) > 10000) return sizeB - sizeA;
    return (a.y1 - b.y1) || (a.x1 - b.x1);
  });

  // ── Step 5: arrange clusters in a grid ───────────────────────────────────
  // First pass: tidy loose (non-arrow-connected) single-type clusters internally
  clusters = clusters.map(cluster => tidyClusterInternally(cluster, live));

  // Second pass: compute grid positions
  const deltas = new Map(); // elementIndex → { dx, dy }

  let curX = CANVAS_ORIGIN_X;
  let curY = CANVAS_ORIGIN_Y;
  let rowMaxHeight = 0;
  let col = 0;

  for (const cluster of clusters) {
    const w = cluster.x2 - cluster.x1;
    const h = cluster.y2 - cluster.y1;

    // Move to next row if needed
    if (col >= CLUSTER_COLS) {
      col = 0;
      curX = CANVAS_ORIGIN_X;
      curY += rowMaxHeight + GAP_BETWEEN_CLUSTERS;
      rowMaxHeight = 0;
    }

    const dx = curX - cluster.x1;
    const dy = curY - cluster.y1;

    for (const idx of cluster.indices) {
      const existing = deltas.get(idx) || { dx: 0, dy: 0 };
      deltas.set(idx, { dx: existing.dx + dx, dy: existing.dy + dy });
    }

    // Advance cursor
    curX += w + GAP_BETWEEN_CLUSTERS;
    rowMaxHeight = Math.max(rowMaxHeight, h);
    col++;
  }

  // ── Step 6: apply deltas to every live element ───────────────────────────
  const updatedById = new Map();

  for (let i = 0; i < n; i++) {
    const el = live[i];
    const { dx, dy } = deltas.get(i) || { dx: 0, dy: 0 };
    if (dx === 0 && dy === 0) { updatedById.set(el.id, el); continue; }

    const updated = { ...el, x: el.x + dx, y: el.y + dy };

    // Shift arrow points array (the visual path), keeping relative shape
    if ((el.type === "arrow" || el.type === "line") && Array.isArray(el.points)) {
      // points are relative to el.x/el.y in Excalidraw — no shift needed
      // but x/y of the element itself is the anchor, which we already moved
    }

    // Shift freedraw points (they're absolute when el.x/y is 0, relative otherwise)
    // Excalidraw stores freedraw points relative to el.x/el.y — no change needed.

    updatedById.set(el.id, updated);
  }

  // Merge back: return full original array, substituting updated live elements
  return elements.map(el => updatedById.has(el.id) ? updatedById.get(el.id) : el);
}


// ── Internal cluster tidying ──────────────────────────────────────────────────
// If a cluster contains only loose shapes/text (no arrows binding them),
// arrange them in a neat column sorted top-to-bottom.

function tidyClusterInternally(cluster, live) {
  const clusterEls = cluster.indices.map(i => live[i]);

  // Check if there are any binding arrows within this cluster
  const hasArrows = clusterEls.some(el => el.type === "arrow" || el.type === "line");
  if (hasArrows) return cluster; // leave arrow-connected groups as-is

  // Sort by original y then x
  const sorted = [...cluster.indices].sort((a, b) => {
    const ea = live[a], eb = live[b];
    return (ea.y - eb.y) || (ea.x - eb.x);
  });

  // Stack them vertically with INNER_GAP
  let curY = cluster.y1;
  const innerDeltas = new Map();

  for (const idx of sorted) {
    const el = live[idx];
    const dy = curY - el.y;
    innerDeltas.set(idx, { dx: 0, dy });
    curY += (el.height || 40) + INNER_GAP;
  }

  // Apply inner deltas and recompute cluster bbox
  const newEls = sorted.map(idx => {
    const el = live[idx];
    const { dy } = innerDeltas.get(idx);
    return { ...el, y: el.y + dy };
  });

  const x1 = Math.min(...newEls.map(el => el.x));
  const y1 = Math.min(...newEls.map(el => el.y));
  const x2 = Math.max(...newEls.map(el => el.x + (el.width  || 0)));
  const y2 = Math.max(...newEls.map(el => el.y + (el.height || 0)));

  // Write inner deltas back into the live array (mutate-safe: we'll re-read by index)
  for (const idx of sorted) {
    const { dy } = innerDeltas.get(idx);
    live[idx] = { ...live[idx], y: live[idx].y + dy };
  }

  return { ...cluster, x1, y1, x2, y2 };
}
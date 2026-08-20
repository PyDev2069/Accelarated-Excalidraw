

const GROUP_GAP       = 60;   // px between groups (vertical)
const ITEM_GAP        = 16;   // px between items inside a group
const SIDE_MARGIN     = 120;  // px gap between existing content and the cleaned column
const CANVAS_ORIGIN_Y = 80;   // top Y for the cleaned column



const TYPE_ORDER = ["frame", "shape", "text", "image", "arrow", "misc"];

function classifyElement(el) {
  const t = el.type;
  if (t === "frame")                          return "frame";
  if (t === "arrow" || t === "line")          return "arrow";
  if (t === "text")                           return "text";
  if (t === "image")                          return "image";
  if (["rectangle","ellipse","diamond",
       "triangle","hexagon","parallelogram",
       "roundedRectangle"].includes(t))       return "shape";
  // excalidraw shapes that aren't in that list
  if (!["freedraw","embeddable"].includes(t)) return "shape";
  return "misc";
}


function groupByType(elements) {
  const buckets = {};
  for (const el of elements) {
    if (el.isDeleted) continue;
    const bucket = classifyElement(el);
    if (!buckets[bucket]) buckets[bucket] = [];
    buckets[bucket].push(el.id);
  }

  const LABELS = {
    frame:  "Frames",
    shape:  "Shapes",
    text:   "Text",
    image:  "Images",
    arrow:  "Connectors",
    misc:   "Other",
  };

  return TYPE_ORDER
    .filter(k => buckets[k]?.length > 0)
    .map(k => ({ name: LABELS[k], ids: buckets[k] }));
}

// ── Layout ─────────────────────────────────────────────────────────────────────

/**
 * Find the right edge of all existing (out-of-scope) elements
 * so we can place the cleaned column just to the right.
 */
function findRightEdge(elements, scopeIds) {
  let maxX = 0;
  for (const el of elements) {
    if (el.isDeleted) continue;
    if (scopeIds && scopeIds.has(el.id)) continue;
    const right = el.x + (el.width || 0);
    if (right > maxX) maxX = right;
  }
  // If there are no out-of-scope elements (whole-board cleanup),
  // find the leftmost x of scoped elements and use that as origin.
  if (maxX === 0 && scopeIds) {
    for (const el of elements) {
      if (el.isDeleted || !scopeIds.has(el.id)) continue;
      if (el.x < maxX || maxX === 0) maxX = el.x;
    }
  }
  return maxX;
}

/**
 * Compute new {x, y} for every element in the scope.
 * Stacks groups vertically in a single column to the right of existing content.
 * Returns Map<id, {x, y}>.
 */
function layoutGroups(groups, elementMap, columnX) {
  const positions = new Map();
  let curY = CANVAS_ORIGIN_Y;

  for (const group of groups) {
    const members = group.ids
      .map(id => elementMap.get(id))
      .filter(Boolean)
      .filter(el => !el.isDeleted);

    if (members.length === 0) continue;

    // Arrows/lines go at the end of each group
    const shapes = members.filter(el => el.type !== "arrow" && el.type !== "line");
    const arrows = members.filter(el => el.type === "arrow" || el.type === "line");

    for (const el of shapes) {
      positions.set(el.id, { x: columnX, y: curY });
      curY += (el.height || 40) + ITEM_GAP;
    }

    for (const el of arrows) {
      positions.set(el.id, { x: columnX, y: curY });
      curY += 40 + ITEM_GAP;
    }

    curY += GROUP_GAP; // extra breathing room between groups
  }

  return positions;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * @param {Array}  elements  — full Excalidraw element array
 * @param {Object} options
 *   onProgress(msg)  — status callback (string)
 *   scopeIds         — Set of ids to clean (null = whole board)
 * @returns {Promise<Array>} — new element array with updated positions
 */
export async function cleanupElements(elements, { onProgress, scopeIds } = {}) {
  const live = elements.filter(el => !el.isDeleted);

  const scope = scopeIds
    ? live.filter(el => scopeIds.has(el.id))
    : live;

  if (scope.length === 0) throw new Error("No elements to clean up.");

  // Step 1 — group by type
  onProgress?.("Grouping elements by type…");
  const groups = groupByType(scope);

  // Step 2 — figure out where to place the column
  onProgress?.("Calculating layout…");
  const rightEdge  = findRightEdge(elements, scopeIds);
  const columnX    = rightEdge > 0 ? rightEdge + SIDE_MARGIN : SIDE_MARGIN;

  const elementMap = new Map(live.map(el => [el.id, el]));
  const newPositions = layoutGroups(groups, elementMap, columnX);

  // Step 3 — apply
  onProgress?.("Applying layout…");
  return elements.map(el => {
    if (el.isDeleted) return el;
    const pos = newPositions.get(el.id);
    if (!pos) return el;

    const dx = pos.x - el.x;
    const dy = pos.y - el.y;
    if (dx === 0 && dy === 0) return el;

    return { ...el, x: pos.x, y: pos.y };
  });
}
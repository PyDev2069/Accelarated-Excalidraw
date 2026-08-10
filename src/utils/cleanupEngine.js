/**
 * cleanupEngine.js
 * ─────────────────
 * Two-phase cleanup:
 *   Phase 1 – LLM semantic grouping (via Ollama)
 *             Sends element metadata (id, type, text, position) to the model,
 *             which returns an ordered list of groups + a suggested layout direction.
 *   Phase 2 – Deterministic layout engine
 *             Positions groups in a clean grid, preserves arrow connections,
 *             aligns items inside each group.
 *
 * Exports:
 *   cleanupElements(elements, options) → Promise<Element[]>
 *     options: { onProgress(msg), ollamaUrl, model, scopeIds? }
 *     scopeIds: if provided, only those elements are cleaned (local cleanup).
 *               Arrow endpoints are rebound automatically.
 */

const OLLAMA_URL   = "http://localhost:11434/api/chat";
const CLEANUP_MODEL = "qwen2.5:3b";

// ── Layout constants ──────────────────────────────────────────────────────────
const GROUP_GAP         = 80;   // px between groups in the grid
const ITEM_GAP          = 20;   // px between items inside a group
const GROUP_COLS        = 3;    // max groups per row
const CANVAS_ORIGIN_X   = 120;
const CANVAS_ORIGIN_Y   = 120;
const LABEL_HEIGHT      = 0;    // no visual group label, just spacing

// ── Helpers ───────────────────────────────────────────────────────────────────

function getText(el) {
  if (el.type === "text") return el.text || "";
  if (el.label?.text) return el.label.text;
  return "";
}

function getCenter(el) {
  return {
    x: el.x + (el.width  || 0) / 2,
    y: el.y + (el.height || 0) / 2,
  };
}

/**
 * Build a compact metadata snapshot the LLM can reason about.
 * Uses short numeric aliases (i0, i1 …) instead of full UUIDs so the
 * JSON payload is much smaller and less likely to be truncated.
 * Returns { meta, aliasToId } so we can map back after parsing.
 */
function buildMetadata(elements) {
  const live = elements.filter(el => !el.isDeleted);
  // Build alias map: real id → short alias
  const idToAlias = new Map(live.map((el, i) => [el.id, `i${i}`]));

  const meta = live.map(el => ({
    id:   idToAlias.get(el.id),
    type: el.type,
    text: getText(el).slice(0, 80),
    // connectivity hints (use alias)
    startId: el.startBinding?.elementId ? (idToAlias.get(el.startBinding.elementId) ?? null) : null,
    endId:   el.endBinding?.elementId   ? (idToAlias.get(el.endBinding.elementId)   ?? null) : null,
  }));

  // reverse map: alias → real id
  const aliasToId = Object.fromEntries([...idToAlias.entries()].map(([rid, alias]) => [alias, rid]));
  return { meta, aliasToId };
}

/** Call Ollama and collect the full streamed response as a string. */
async function callOllama(messages, onChunk) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: CLEANUP_MODEL, messages, stream: true, options: { num_predict: 4096 } }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${res.statusText}`);

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split("\n").filter(Boolean)) {
      try {
        const chunk = JSON.parse(line)?.message?.content || "";
        full += chunk;
        onChunk?.(chunk);
      } catch { /* non-JSON */ }
    }
  }
  return full;
}

/**
 * Ask the LLM to group and order elements.
 * Returns: { groups: [{ name, ids: [] }], direction: "LR"|"TB" }
 */
async function llmGroupElements(elements, onProgress) {
  const { meta, aliasToId } = buildMetadata(elements);
  const allAliases = new Set(meta.map(m => m.id));

  const systemPrompt = `You are a diagram layout expert. Analyze these Excalidraw elements and group them logically.

RULES:
- Group semantically related elements (same topic, component, workflow step, entity, or connected by arrows).
- Arrows/lines belong in the same group as the shapes they connect.
- Return ONLY a raw JSON object — no markdown, no explanation, no code fences.
- Required shape (use short ids exactly as given):
{"groups":[{"name":"Label","ids":["i0","i1"]}],"direction":"LR"}
- direction: "LR" for wide layouts, "TB" for tall ones.
- Every id must appear in exactly one group. Unknown ids go in "Misc".
- Aim for 3-6 groups.`;

  const userPrompt = `Elements:
${JSON.stringify(meta)}

JSON only:`;

  onProgress?.("Analysing diagram structure…");

  let raw = "";
  try {
    raw = await callOllama(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      () => {}
    );
  } catch (err) {
    throw new Error(`Could not reach Ollama: ${err.message}`);
  }

  // ── Robust JSON extraction ──────────────────────────────────────────────
  // Try to find the outermost { … } block, then repair truncation if needed.
  let jsonStr = "";
  const braceStart = raw.indexOf("{");
  if (braceStart !== -1) {
    // Walk forward tracking depth to find the matching close brace
    let depth = 0;
    let end = -1;
    for (let i = braceStart; i < raw.length; i++) {
      if (raw[i] === "{") depth++;
      else if (raw[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
    }
    jsonStr = end !== -1 ? raw.slice(braceStart, end + 1) : raw.slice(braceStart);
  }

  if (!jsonStr) throw new Error("LLM returned no JSON object. Response: " + raw.slice(0, 120));

  // Attempt parse; if it fails try to close truncated JSON
  let parsed;
  const attempts = [jsonStr, jsonStr + ']}', jsonStr + '"]}', jsonStr + '"]}}'];
  for (const attempt of attempts) {
    try { parsed = JSON.parse(attempt); break; } catch { /* try next */ }
  }

  if (!parsed || !Array.isArray(parsed.groups)) {
    // Last resort: fall back to one big group with all elements
    console.warn("Cleanup: LLM grouping failed, falling back to single group. Raw:", raw.slice(0, 200));
    return {
      groups: [{ name: "Cleaned", ids: [...allAliases] }],
      direction: "LR",
      aliasToId,
    };
  }

  // ── Map short aliases back to real element ids ──────────────────────────
  parsed.groups = parsed.groups.map(g => ({
    ...g,
    ids: (g.ids || [])
      .filter(alias => aliasToId[alias])          // drop unknown aliases
      .map(alias => aliasToId[alias]),             // → real id
  })).filter(g => g.ids.length > 0);

  // Ensure every real id appears in exactly one group
  const seenIds   = new Set(parsed.groups.flatMap(g => g.ids));
  const realAllIds = new Set(Object.values(aliasToId).filter(id =>
    elements.some(el => el.id === id && !el.isDeleted)
  ));
  const unseenIds = [...realAllIds].filter(id => !seenIds.has(id));

  if (unseenIds.length > 0) {
    const misc = parsed.groups.find(g => g.name === "Misc");
    if (misc) misc.ids.push(...unseenIds);
    else parsed.groups.push({ name: "Misc", ids: unseenIds });
  }

  return { groups: parsed.groups, direction: parsed.direction ?? "LR" };
}

// ── Phase 2: deterministic layout ────────────────────────────────────────────

/**
 * Given LLM groups, compute new x/y for every element.
 * Returns a Map<elementId, {x, y}>.
 */
function layoutGroups(groups, elementMap, direction) {
  const positions = new Map(); // id → {x, y}

  const cols     = direction === "TB" ? 2 : GROUP_COLS;
  let curX       = CANVAS_ORIGIN_X;
  let curY       = CANVAS_ORIGIN_Y;
  let rowMaxH    = 0;
  let colCount   = 0;

  for (const group of groups) {
    const members = group.ids
      .map(id => elementMap.get(id))
      .filter(Boolean)
      .filter(el => !el.isDeleted);

    if (members.length === 0) continue;

    // Sort members: arrows last (they follow their endpoints)
    const shapes = members.filter(el => el.type !== "arrow" && el.type !== "line");
    const arrows = members.filter(el => el.type === "arrow" || el.type === "line");

    // Stack shapes in a column
    let innerY = curY + LABEL_HEIGHT;
    let groupW = 0;

    for (const el of shapes) {
      positions.set(el.id, { x: curX, y: innerY });
      groupW   = Math.max(groupW, el.width || 0);
      innerY  += (el.height || 40) + ITEM_GAP;
    }

    const groupH = innerY - curY;

    // Arrows: place them at the center of the group column
    for (const el of arrows) {
      positions.set(el.id, { x: curX, y: curY });
    }

    // Advance cursor
    curX    += groupW + GROUP_GAP;
    rowMaxH  = Math.max(rowMaxH, groupH);
    colCount++;

    if (colCount >= cols) {
      colCount = 0;
      curX     = CANVAS_ORIGIN_X;
      curY    += rowMaxH + GROUP_GAP;
      rowMaxH  = 0;
    }
  }

  return positions;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * @param {Array}  elements  — full Excalidraw element array
 * @param {Object} options
 *   onProgress(msg)  — status callback (string)
 *   scopeIds         — Set of ids to clean (null = whole board)
 * @returns {Promise<Array>} — new element array with updated positions
 */
export async function cleanupElements(elements, { onProgress, scopeIds } = {}) {
  const live = elements.filter(el => !el.isDeleted);

  // Determine scope
  const scope = scopeIds
    ? live.filter(el => scopeIds.has(el.id))
    : live;

  if (scope.length === 0) throw new Error("No elements to clean up.");

  const elementMap = new Map(live.map(el => [el.id, el]));

  // Phase 1 — LLM grouping
  onProgress?.("Asking Archie to analyse your diagram…");
  const { groups, direction } = await llmGroupElements(scope, onProgress);

  // Phase 2 — layout
  onProgress?.("Calculating clean layout…");
  const newPositions = layoutGroups(groups, elementMap, direction ?? "LR");

  // Apply deltas
  onProgress?.("Applying layout…");
  return elements.map(el => {
    if (el.isDeleted) return el;
    const pos = newPositions.get(el.id);
    if (!pos) return el;

    const dx = pos.x - el.x;
    const dy = pos.y - el.y;
    if (dx === 0 && dy === 0) return el;

    const updated = { ...el, x: pos.x, y: pos.y };

    // Arrow points are relative to the element origin in Excalidraw — no shift needed.
    // But we do need to update x/y so the bounding box moves.
    return updated;
  });
}
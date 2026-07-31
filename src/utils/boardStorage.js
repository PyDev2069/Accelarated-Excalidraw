// boardStorage.js
// All board persistence lives here. Every other file imports from this
// module — nothing else touches localStorage directly. That means if
// you later swap to IndexedDB or a backend API you only change this file.

const INDEX_KEY = "boards:index"; // stores the list of board metadata
const dataKey = (id) => `boards:data:${id}`; // stores the actual elements per board

// ─── helpers ────────────────────────────────────────────────────────────────

function readIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeIndex(index) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

// ─── public API ─────────────────────────────────────────────────────────────

/** Returns the metadata list (id, name, updatedAt) sorted newest-first. */
export function listBoards() {
  return readIndex().sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Creates a new board and returns its id. */
export function createBoard(name = "Untitled board") {
  const id = `board_${Date.now()}`;
  const meta = { id, name, updatedAt: Date.now() };
  writeIndex([...readIndex(), meta]);
  // write empty data so the key exists
  localStorage.setItem(dataKey(id), JSON.stringify({ elements: [], appState: {} }));
  return id;
}

/** Loads elements + appState for a board. Returns null if not found. */
export function loadBoard(id) {
  try {
    const raw = localStorage.getItem(dataKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Saves elements + appState for a board and bumps its updatedAt. */
export function saveBoard(id, elements, appState) {
  // Filter deleted elements — Excalidraw keeps them internally but we don't
  // need to persist them, and they can bloat/corrupt storage on reload.
  const cleanElements = elements.filter((el) => !el.isDeleted);

  // Only persist the appState fields that are safe to restore.
  // Saving the full appState includes Maps, Sets, and other non-serialisable
  // values that silently corrupt on JSON round-trip.
  const cleanAppState = {
    viewBackgroundColor: appState.viewBackgroundColor,
    gridSize: appState.gridSize,
    scrollX: appState.scrollX,
    scrollY: appState.scrollY,
    zoom: appState.zoom,
  };

  localStorage.setItem(dataKey(id), JSON.stringify({ elements: cleanElements, appState: cleanAppState }));

  const index = readIndex().map((m) =>
    m.id === id ? { ...m, updatedAt: Date.now() } : m
  );
  writeIndex(index);
}

/** Renames a board. */
export function renameBoard(id, newName) {
  const index = readIndex().map((m) =>
    m.id === id ? { ...m, name: newName.trim() || "Untitled board" } : m
  );
  writeIndex(index);
}

/** Deletes a board entirely. */
export function deleteBoard(id) {
  writeIndex(readIndex().filter((m) => m.id !== id));
  localStorage.removeItem(dataKey(id));
}


// ─── code snippets (per shape, per language) ────────────────────────────────

const snippetsKey = (boardId) => `boards:snippets:${boardId}`;

export function loadSnippets(boardId) {
  try {
    return JSON.parse(localStorage.getItem(snippetsKey(boardId)) || "{}");
  } catch {
    return {};
  }
}

// snippets[elementId] is now { python: "...", javascript: "...", ... }
// each language key is independent
// One snippet per element: snippets[elementId] = { code, language }
export function saveSnippet(boardId, elementId, code, language) {
  const all = loadSnippets(boardId);
  all[elementId] = { code, language };
  localStorage.setItem(snippetsKey(boardId), JSON.stringify(all));
}

export function deleteSnippet(boardId, elementId) {
  const all = loadSnippets(boardId);
  if (!(elementId in all)) return;
  delete all[elementId];
  localStorage.setItem(snippetsKey(boardId), JSON.stringify(all));
}


// ─── links (reference URLs per shape) ───────────────────────────────────────
// Same pattern as snippets, but simpler: one URL per element, not one per
// language. links[elementId] is just a plain string.

const linksKey = (boardId) => `boards:links:${boardId}`;

export function loadLinks(boardId) {
  try {
    return JSON.parse(localStorage.getItem(linksKey(boardId)) || "{}");
  } catch {
    return {};
  }
}

export function saveLink(boardId, elementId, url) {
  const all = loadLinks(boardId);
  all[elementId] = url;
  localStorage.setItem(linksKey(boardId), JSON.stringify(all));
}

export function deleteLink(boardId, elementId) {
  const all = loadLinks(boardId);
  if (!(elementId in all)) return;
  delete all[elementId];
  localStorage.setItem(linksKey(boardId), JSON.stringify(all));
}


// ─── notes (free-text note per shape) ───────────────────────────────────────
// Same pattern as links: one note per element, stored as a plain string.
// notes[elementId] is just a plain string.

const notesKey = (boardId) => `boards:notes:${boardId}`;

export function loadNotes(boardId) {
  try {
    return JSON.parse(localStorage.getItem(notesKey(boardId)) || "{}");
  } catch {
    return {};
  }
}

export function saveNote(boardId, elementId, note) {
  const all = loadNotes(boardId);
  all[elementId] = note;
  localStorage.setItem(notesKey(boardId), JSON.stringify(all));
}

export function deleteNote(boardId, elementId) {
  const all = loadNotes(boardId);
  if (!(elementId in all)) return;
  delete all[elementId];
  localStorage.setItem(notesKey(boardId), JSON.stringify(all));
}

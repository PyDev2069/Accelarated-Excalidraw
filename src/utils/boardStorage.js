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
  localStorage.setItem(dataKey(id), JSON.stringify({ elements, appState }));
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

import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import { loadBoard, saveBoard, renameBoard, listBoards } from "../utils/boardStorage";

// How long to wait after the last drawing action before saving (ms).
const AUTOSAVE_DEBOUNCE = 1000;

function WhiteboardPage() {
  const { boardId } = useParams();          // comes from /board/:boardId
  const navigate = useNavigate();

  const excalidrawAPIRef = useRef(null);    // Excalidraw API handle
  const saveTimerRef = useRef(null);         // debounce timer
  const initialDataRef = useRef(null);       // loaded once on mount

  const [boardName, setBoardName] = useState("Untitled board");
  const [isRenamingName, setIsRenamingName] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving"

  // ── load board once on mount ─────────────────────────────────────────────
  useEffect(() => {
    const data = loadBoard(boardId);
    if (!data) {
      // board id not found — go back to dashboard
      navigate("/dashboard", { replace: true });
      return;
    }
    initialDataRef.current = {
      elements: data.elements,
      appState: {
        ...data.appState,
        // always re-open in a clean state for these UI flags
        collaborators: [],
      },
    };

    // get name from the index
    const meta = listBoards().find((b) => b.id === boardId);
    if (meta) setBoardName(meta.name);
  }, [boardId, navigate]);

  // ── debounced auto-save on every canvas change ───────────────────────────
  const handleChange = useCallback(
    (elements, appState) => {
      setSaveStatus("saving");
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveBoard(boardId, elements, appState);
        setSaveStatus("saved");
      }, AUTOSAVE_DEBOUNCE);
    },
    [boardId]
  );

  // ── rename helpers ───────────────────────────────────────────────────────
  function startRename() {
    setRenameValue(boardName);
    setIsRenamingName(true);
  }

  function commitRename() {
    const trimmed = renameValue.trim() || "Untitled board";
    renameBoard(boardId, trimmed);
    setBoardName(trimmed);
    setIsRenamingName(false);
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>

      {/* Thin top bar — sits above the Excalidraw canvas */}
      <div
        style={{
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 14px",
          borderBottom: "1px solid #e5e1d8",
          background: "#fffdf7",
          zIndex: 10,
        }}
      >
        {/* Back to dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{ fontFamily: "Caveat, cursive", fontSize: 18, color: "#6965db", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Boards
        </button>

        <div style={{ width: 1, height: 20, background: "#e5e1d8" }} />

        {/* Board name / rename inline */}
        {isRenamingName ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setIsRenamingName(false);
            }}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              border: "1px solid #6965db",
              borderRadius: 6,
              padding: "2px 8px",
              outline: "none",
              minWidth: 180,
            }}
          />
        ) : (
          <span
            onDoubleClick={startRename}
            title="Double-click to rename"
            style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, cursor: "text", userSelect: "none" }}
          >
            {boardName}
          </span>
        )}

        {/* Rename button */}
        <button
          onClick={startRename}
          title="Rename board"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b6b76" }}
        >
          ✏️
        </button>

        {/* Auto-save status */}
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b6b76" }}>
          {saveStatus === "saving" ? "Saving…" : "✓ Saved"}
        </span>
      </div>

      {/* Excalidraw fills the rest */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Excalidraw
          excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
          initialData={initialDataRef.current}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default WhiteboardPage;

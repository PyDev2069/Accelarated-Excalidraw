import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import {
  loadBoard,
  saveBoard,
  renameBoard,
  listBoards,
  loadSnippets,
} from "../utils/boardStorage";
import CodeSidebar, { isSupportedElement } from "../components/CodeSidebar";

const AUTOSAVE_DEBOUNCE = 1000;

function WhiteboardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const excalidrawAPIRef = useRef(null);
  const saveTimerRef = useRef(null);
  const initialDataRef = useRef(null);

  const [boardName, setBoardName] = useState("Untitled board");
  const [isRenamingName, setIsRenamingName] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [selectedElement, setSelectedElement] = useState(null);
  const [snippets, setSnippets] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = loadBoard(boardId);
    if (!data) {
      navigate("/dashboard", { replace: true });
      return;
    }
    initialDataRef.current = {
      elements: data.elements,
      appState: { ...data.appState, collaborators: [] },
    };
    const meta = listBoards().find((b) => b.id === boardId);
    if (meta) setBoardName(meta.name);
    setSnippets(loadSnippets(boardId));
    setReady(true);
  }, [boardId, navigate]);

  function refreshSnippets() {
    setSnippets(loadSnippets(boardId));
  }

  const handleChange = useCallback(
    (elements, appState) => {
      setSaveStatus("saving");
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveBoard(boardId, elements, appState);
        setSaveStatus("saved");
      }, AUTOSAVE_DEBOUNCE);

      const selectedIds = Object.keys(appState.selectedElementIds || {}).filter(
        (id) => appState.selectedElementIds[id]
      );
      if (selectedIds.length === 1) {
        const el = elements.find((e) => e.id === selectedIds[0]);
        setSelectedElement(isSupportedElement(el) ? el : null);
      } else {
        setSelectedElement(null);
      }
    },
    [boardId]
  );

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

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{
        height: 44, flexShrink: 0, display: "flex", alignItems: "center",
        gap: 12, padding: "0 14px", borderBottom: "1px solid #e5e1d8",
        background: "#fffdf7", zIndex: 10,
      }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ fontFamily: "Caveat, cursive", fontSize: 18, color: "#6965db", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Boards
        </button>
        <div style={{ width: 1, height: 20, background: "#e5e1d8" }} />
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
            style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, border: "1px solid #6965db", borderRadius: 6, padding: "2px 8px", outline: "none", minWidth: 180 }}
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
        <button
          onClick={startRename}
          title="Rename board"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#6b6b76" }}
        >
          ✏️
        </button>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#6b6b76" }}>
          {saveStatus === "saving" ? "Saving…" : "✓ Saved"}
        </span>
      </div>

      {/* Canvas + sidebar */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {ready && (
            <Excalidraw
              excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
              initialData={initialDataRef.current}
              onChange={handleChange}
            />
          )}
        </div>
        {selectedElement && (
          <CodeSidebar
            boardId={boardId}
            selectedElement={selectedElement}
            snippets={snippets}
            onSnippetChange={refreshSnippets}
          />
        )}
      </div>
    </div>
  );
}

export default WhiteboardPage;
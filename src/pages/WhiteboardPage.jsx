import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import { loadBoard, saveBoard, renameBoard, listBoards } from "../utils/boardStorage";

// How long to wait after the last drawing action before saving (ms).
const AUTOSAVE_DEBOUNCE = 1000;

// ── design tokens ────────────────────────────────────────────────────────
// A "drafting table" direction: deep blueprint navy bar, architect's-pen
// red accent, monospace annotation type for meta, Space Grotesk for the
// board name itself.
const tokens = {
  navy: "#16324F",
  navyLight: "#21486D",
  navyLine: "rgba(255,255,255,0.07)",
  paper: "#F5F1E8",
  steel: "#8CA0B3",
  red: "#E4572E",
  amber: "#E4A72E",
  green: "#5FA88C",
};

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=JetBrains+Mono:wght@500&display=swap');

        @keyframes wb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.75); }
        }
        .wb-topbar {
          background-color: ${tokens.navy};
          background-image:
            repeating-linear-gradient(0deg, ${tokens.navyLine} 0px, ${tokens.navyLine} 1px, transparent 1px, transparent 24px),
            repeating-linear-gradient(90deg, ${tokens.navyLine} 0px, ${tokens.navyLine} 1px, transparent 1px, transparent 24px);
        }
        .wb-back-btn {
          transition: color 0.15s ease;
        }
        .wb-back-btn:hover {
          color: ${tokens.paper} !important;
        }
        .wb-dimension-line {
          position: relative;
          width: 28px;
          height: 1px;
          background: ${tokens.navyLine};
        }
        .wb-dimension-line::before,
        .wb-dimension-line::after {
          content: "";
          position: absolute;
          top: -4px;
          width: 1px;
          height: 9px;
          background: ${tokens.navyLine};
        }
        .wb-dimension-line::before { left: 0; }
        .wb-dimension-line::after { right: 0; }
        .wb-pencil-btn {
          transition: opacity 0.15s ease, transform 0.15s ease;
          opacity: 0.55;
        }
        .wb-pencil-btn:hover {
          opacity: 1;
          transform: rotate(-8deg);
        }
        .wb-name-input:focus {
          border-color: ${tokens.red} !important;
        }
      `}</style>

      {/* Thin top bar — sits above the Excalidraw canvas */}
      <div
        className="wb-topbar"
        style={{
          height: 46,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 16px",
          borderBottom: `1px solid ${tokens.navyLight}`,
          zIndex: 10,
        }}
      >
        {/* Back to dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="wb-back-btn"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: tokens.steel,
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 13 }}>←</span> Boards
        </button>

        <span className="wb-dimension-line" />

        {/* Board name / rename inline */}
        {isRenamingName ? (
          <input
            autoFocus
            className="wb-name-input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setIsRenamingName(false);
            }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: tokens.paper,
              background: tokens.navyLight,
              border: `1px solid ${tokens.navyLight}`,
              borderRadius: 4,
              padding: "3px 9px",
              outline: "none",
              minWidth: 180,
            }}
          />
        ) : (
          <span
            onDoubleClick={startRename}
            title="Double-click to rename"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: tokens.paper,
              cursor: "text",
              userSelect: "none",
              letterSpacing: "0.01em",
            }}
          >
            {boardName}
          </span>
        )}

        {/* Rename button */}
        <button
          onClick={startRename}
          title="Rename board"
          className="wb-pencil-btn"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: tokens.steel }}
        >
          ✏️
        </button>

        {/* Auto-save status — small stamped indicator instead of a plain checkmark */}
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: tokens.steel,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: saveStatus === "saving" ? tokens.amber : tokens.green,
              animation: saveStatus === "saving" ? "wb-pulse 0.9s ease-in-out infinite" : "none",
              boxShadow: saveStatus === "saving"
                ? `0 0 0 3px rgba(228,167,46,0.15)`
                : `0 0 0 3px rgba(95,168,140,0.15)`,
            }}
          />
          {saveStatus === "saving" ? "Saving" : "Saved"}
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
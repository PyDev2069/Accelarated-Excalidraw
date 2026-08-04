import { useState, useEffect } from "react";
import { sceneCoordsToViewportCoords } from "@excalidraw/excalidraw";
import { saveFile, deleteFile } from "../utils/boardStorage";
import { THEME, UploadIcon, DownloadIcon, EyeIcon, RefreshIcon, TrashIcon, FileIcon } from "./themeAndIcons";
import { UploadFileModal, FileViewerOverlay } from "./UploadFileModal";

/**
 * ShapeFileBox
 * ────────────
 * A small floating box that tracks a selected Excalidraw shape's on-screen
 * position (recalculated live as you drag/resize the shape or pan/zoom the
 * canvas) and hovers just above it.
 *
 * No file attached  → single "Upload File" button, which opens
 * UploadFileModal (fullscreen, portal-rendered).
 * File attached     → a compact card: filename + View / Download /
 * Replace / Delete icon buttons. Clicking View opens
 * the fullscreen, chrome-free file viewer.
 *
 * Mount this once in WhiteboardPage.jsx, as a sibling of the Excalidraw
 * canvas (not inside the sidebar column) — it positions itself with
 * `position: fixed` relative to the whole viewport.
 */
function ShapeFileBox({ boardId, selectedElement, appState, files, onFilesChange, dark = false }) {
  const t = dark ? THEME.dark : THEME.light;
  const [viewerOpen, setViewerOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // null | "upload" | "replace"

  const savedFile = selectedElement ? files[selectedElement.id] : null;

  // Clear any stale open state when switching shapes.
  useEffect(() => {
    setViewerOpen(false);
    setModalMode(null);
  }, [selectedElement?.id]);

  if (!selectedElement || !appState) return null;

  // ── position: top-center of the shape, converted from scene coords to
  // real screen pixels using Excalidraw's own conversion helper, so this
  // stays glued to the shape through drags, resizes, panning, and zoom. ──
  const { x: screenX, y: screenY } = sceneCoordsToViewportCoords(
    { sceneX: selectedElement.x + selectedElement.width / 2, sceneY: selectedElement.y },
    appState
  );

  const BOX_GAP = 14; // px between the box's bottom edge and the shape's top edge

  async function handleModalUpload(fileData) {
    saveFile(boardId, selectedElement.id, fileData);
    onFilesChange();
    setModalMode(null);
  }

  function handleDownload() {
    if (!savedFile) return;
    const a = document.createElement("a");
    a.href = savedFile.dataURL;
    a.download = savedFile.name || "file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleDelete() {
    if (!savedFile) return;
    deleteFile(boardId, selectedElement.id);
    setViewerOpen(false);
    onFilesChange();
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: screenX,
          top: screenY - BOX_GAP,
          transform: "translate(-50%, -100%)",
          zIndex: 30,
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: t.cardBg,
            backdropFilter: "blur(8px)",
            border: `1px solid ${t.lavenderBorder}`,
            borderRadius: 12,
            padding: 7,
            boxShadow: "0 10px 28px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {savedFile ? (
            <>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 10px 5px 6px",
                  maxWidth: 170,
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: t.lavenderBg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileIcon width={13} height={13} style={{ color: t.lavender }} />
                </div>
                <span style={{
                  fontSize: 12.5, fontWeight: 600, color: t.heading,
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {savedFile.name}
                </span>
              </div>

              <div style={{ width: 1, height: 22, background: t.lavenderBorder, flexShrink: 0 }} />

              <button onClick={() => setViewerOpen(true)} title="View" style={iconBtnStyle(t)}>
                <EyeIcon />
              </button>
              <button onClick={handleDownload} title="Download" style={iconBtnStyle(t)}>
                <DownloadIcon />
              </button>
              <button onClick={() => setModalMode("replace")} title="Replace" style={iconBtnStyle(t)}>
                <RefreshIcon />
              </button>
              <button
                onClick={handleDelete}
                title="Delete"
                style={iconBtnStyle(t)}
                onMouseEnter={(e) => { e.currentTarget.style.background = t.dangerHover; e.currentTarget.style.color = t.danger; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}
              >
                <TrashIcon />
              </button>
            </>
          ) : (
            <button
              onClick={() => setModalMode("upload")}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: t.lavender, color: "#fff",
                border: "none", borderRadius: 9, padding: "8px 14px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <UploadIcon />
              <span>Upload File</span>
            </button>
          )}
        </div>
      </div>

      {modalMode && (
        <UploadFileModal
          dark={dark}
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onUpload={handleModalUpload}
        />
      )}

      {viewerOpen && savedFile && (
        <FileViewerOverlay file={savedFile} onClose={() => setViewerOpen(false)} onDownload={handleDownload} />
      )}
    </>
  );
}

function iconBtnStyle(t) {
  return {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 30, height: 30,
    background: "transparent", color: t.textMuted,
    border: "none", borderRadius: 8, cursor: "pointer",
    flexShrink: 0,
    transition: "background 0.15s ease, color 0.15s ease",
  };
}

export default ShapeFileBox;
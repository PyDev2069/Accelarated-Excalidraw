import { useEffect, useState } from "react";
import { sceneCoordsToViewportCoords } from "@excalidraw/excalidraw";

/**
 * SelectionCleanupButton
 * ───────────────────────
 * Floats above the bounding box of the currently-selected elements
 * (multi-selection only — single element has the ShapeFileBox).
 * Shows a "✨ Clean up" button that triggers local cleanup.
 *
 * Props:
 *   selectedElements  – array of selected Excalidraw elements (>1)
 *   appState          – live Excalidraw appState (for coordinate conversion)
 *   dark              – boolean
 *   onCleanup()       – called when user clicks the button
 */
export function SelectionCleanupButton({ selectedElements, appState, dark, onCleanup }) {
  const [visible, setVisible] = useState(false);

  // Brief delay so the button doesn't flash on quick single-clicks
  useEffect(() => {
    if (!selectedElements || selectedElements.length < 2) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, [selectedElements]);

  if (!visible || !selectedElements || selectedElements.length < 2 || !appState) return null;

  // Compute bounding box of all selected elements in scene coords
  let minX = Infinity, minY = Infinity, maxX = -Infinity;
  for (const el of selectedElements) {
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + (el.width || 0));
  }

  // Convert the top-center point to screen pixels
  const { x: screenX, y: screenY } = sceneCoordsToViewportCoords(
    { sceneX: (minX + maxX) / 2, sceneY: minY },
    appState
  );

  const BTN_GAP = 12; // px above selection bounding box

  return (
    <div
      style={{
        position: "fixed",
        left: screenX,
        top: screenY - BTN_GAP,
        transform: "translate(-50%, -100%)",
        zIndex: 500,
        pointerEvents: "auto",
        animation: "sel-cleanup-pop 0.18s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      <button
        onClick={onCleanup}
        title={`Clean up ${selectedElements.length} selected elements`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 14px",
          fontSize: 13,
          fontWeight: 700,
          borderRadius: 999,
          border: "1.5px solid rgba(105,101,219,0.5)",
          background: dark
            ? "rgba(27,26,39,0.97)"
            : "rgba(255,255,255,0.97)",
          color: "#6965DB",
          cursor: "pointer",
          boxShadow: dark
            ? "0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px rgba(105,101,219,0.25)"
            : "0 4px 18px rgba(105,101,219,0.22), 0 1px 4px rgba(0,0,0,0.08)",
          backdropFilter: "blur(8px)",
          transition: "box-shadow 0.15s ease, transform 0.12s ease",
          whiteSpace: "nowrap",
          letterSpacing: 0.1,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.04)";
          e.currentTarget.style.boxShadow = dark
            ? "0 6px 22px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(105,101,219,0.5)"
            : "0 6px 22px rgba(105,101,219,0.32), 0 1px 4px rgba(0,0,0,0.10)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = dark
            ? "0 4px 18px rgba(0,0,0,0.55), 0 0 0 1px rgba(105,101,219,0.25)"
            : "0 4px 18px rgba(105,101,219,0.22), 0 1px 4px rgba(0,0,0,0.08)";
        }}
      >
        <SparkleIcon />
        Clean up
        <span style={{
          fontSize: 11,
          background: "#6965DB",
          color: "#fff",
          borderRadius: 999,
          padding: "1px 7px",
          fontWeight: 700,
          letterSpacing: 0,
        }}>
          {selectedElements.length}
        </span>
      </button>

      <style>{`
        @keyframes sel-cleanup-pop {
          from { opacity: 0; transform: translate(-50%, calc(-100% + 6px)) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        }
      `}</style>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}
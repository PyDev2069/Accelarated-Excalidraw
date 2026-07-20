import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listBoards,
  createBoard,
  renameBoard,
  deleteBoard,
} from "../utils/boardStorage";

// ── design tokens ────────────────────────────────────────────────────────
// Same drafting-table system as the whiteboard toolbar, inverted for a
// full page: light vellum background with a faint grid, navy ink text,
// the red pen reserved for the one primary action on the page.
const tokens = {
  navy: "#16324F",
  navyLight: "#21486D",
  navyFaint: "rgba(22,50,79,0.06)",
  navyHairline: "rgba(22,50,79,0.16)",
  paper: "#FBF9F4",
  steel: "#8CA0B3",
  steelText: "#5C7186",
  red: "#E4572E",
  redFaint: "rgba(228,87,46,0.08)",
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  function refresh() { setBoards(listBoards()); }
  useEffect(refresh, []);

  function handleNew() {
    const id = createBoard("Untitled board");
    navigate(`/board/${id}`);
  }

  function handleOpen(id) { navigate(`/board/${id}`); }

  function startRename(board) {
    setRenamingId(board.id);
    setRenameValue(board.name);
  }

  function commitRename(id) {
    renameBoard(id, renameValue);
    setRenamingId(null);
    refresh();
  }

  function handleDelete(id) {
    if (window.confirm("Delete this board?")) {
      deleteBoard(id);
      refresh();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.paper,
        backgroundImage: `
          repeating-linear-gradient(0deg, ${tokens.navyFaint} 0px, ${tokens.navyFaint} 1px, transparent 1px, transparent 28px),
          repeating-linear-gradient(90deg, ${tokens.navyFaint} 0px, ${tokens.navyFaint} 1px, transparent 1px, transparent 28px)
        `,
        color: tokens.navy,
        fontFamily: "'Space Grotesk', sans-serif",
        padding: "36px 40px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600&family=JetBrains+Mono:wght@500&display=swap');

        .db-ghost-btn { transition: background 0.15s ease, border-color 0.15s ease; }
        .db-ghost-btn:hover { background: ${tokens.navyFaint}; }

        .db-solid-btn { transition: background 0.15s ease, transform 0.1s ease; }
        .db-solid-btn:hover { background: ${tokens.navyLight}; }
        .db-solid-btn:active { transform: scale(0.98); }

        .db-cta-btn { transition: background 0.15s ease, transform 0.1s ease; }
        .db-cta-btn:hover { background: #cf4a24; }
        .db-cta-btn:active { transform: scale(0.98); }

        .db-card {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .db-card:hover {
          border-color: ${tokens.navy} !important;
          box-shadow: 3px 3px 0 ${tokens.navyHairline};
        }

        .db-thumb {
          background-color: #F3F0E8;
          background-image:
            repeating-linear-gradient(0deg, ${tokens.navyFaint} 0px, ${tokens.navyFaint} 1px, transparent 1px, transparent 12px),
            repeating-linear-gradient(90deg, ${tokens.navyFaint} 0px, ${tokens.navyFaint} 1px, transparent 1px, transparent 12px);
        }

        .db-icon-btn {
          transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease;
          opacity: 0.6;
        }
        .db-icon-btn:hover { opacity: 1; transform: rotate(-8deg); }
        .db-delete-btn:hover { opacity: 1; color: ${tokens.red} !important; transform: none; }

        .db-name-input:focus { border-color: ${tokens.red} !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
        <button onClick={() => navigate("/")} className="db-ghost-btn" style={ghostBtn}>
          <span style={{ fontSize: 13 }}>←</span> Home
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={dimensionLine} />
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: "0.005em" }}>My Boards</h1>
          <span style={dimensionLine} />
        </div>

        <button onClick={handleNew} className="db-cta-btn" style={ctaBtn}>+ New Board</button>
      </div>

      {/* Empty state */}
      {boards.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 90 }}>
          <div style={{ fontSize: 34, marginBottom: 14, opacity: 0.5 }}>✏️</div>
          <p style={{ ...monoLabel, fontSize: 12, color: tokens.steelText, marginBottom: 18 }}>
            Nothing on the board yet
          </p>
          <button onClick={handleNew} className="db-cta-btn" style={ctaBtn}>Create your first board</button>
        </div>
      )}

      {/* Board grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 18 }}>
        {boards.map((board) => (
          <div
            key={board.id}
            className="db-card"
            style={{
              border: `1px solid ${tokens.navyHairline}`,
              borderRadius: 6,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#fff",
            }}
          >
            {/* Thumbnail placeholder */}
            <div
              onClick={() => handleOpen(board.id)}
              className="db-thumb"
              style={{
                height: 104,
                borderRadius: 3,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              🖊️
            </div>

            {/* Name */}
            {renamingId === board.id ? (
              <input
                autoFocus
                className="db-name-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => commitRename(board.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(board.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                style={{
                  border: `1px solid ${tokens.navyHairline}`,
                  borderRadius: 3,
                  padding: "4px 7px",
                  fontSize: 13,
                  fontFamily: "'Space Grotesk', sans-serif",
                  width: "100%",
                  boxSizing: "border-box",
                  outline: "none",
                  color: tokens.navy,
                }}
              />
            ) : (
              <p
                onDoubleClick={() => startRename(board)}
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  cursor: "text",
                  color: tokens.navy,
                }}
                title={board.name}
              >
                {board.name}
              </p>
            )}

            <p style={{ ...monoLabel, margin: 0, fontSize: 10, color: tokens.steelText }}>
              {timeAgo(board.updatedAt)}
            </p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
              <button onClick={() => handleOpen(board.id)} className="db-solid-btn" style={{ ...solidBtn, flex: 1, fontSize: 12 }}>
                Open
              </button>
              <button onClick={() => startRename(board)} className="db-icon-btn" style={iconBtn} title="Rename">✏️</button>
              <button onClick={() => handleDelete(board.id)} className="db-icon-btn db-delete-btn" style={iconBtn} title="Delete">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const monoLabel = {
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  fontWeight: 500,
};

const dimensionLine = {
  width: 22,
  height: 1,
  background: "rgba(22,50,79,0.25)",
};

const solidBtn = {
  background: "#16324F",
  color: "#FBF9F4",
  border: "none",
  borderRadius: 4,
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "'Space Grotesk', sans-serif",
};

const ctaBtn = {
  ...solidBtn,
  background: "#E4572E",
  padding: "9px 16px",
};

const ghostBtn = {
  background: "none",
  color: "#16324F",
  border: "1px solid rgba(22,50,79,0.25)",
  borderRadius: 4,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: 12.5,
  fontFamily: "'JetBrains Mono', monospace",
  letterSpacing: "0.04em",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const iconBtn = {
  background: "none",
  border: "1px solid rgba(22,50,79,0.16)",
  borderRadius: 4,
  padding: "8px 10px",
  cursor: "pointer",
  fontSize: 12,
  color: "#16324F",
};

export default DashboardPage;

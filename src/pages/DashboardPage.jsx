import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listBoards,
  createBoard,
  renameBoard,
  deleteBoard,
} from "../utils/boardStorage";

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
    <div style={{ minHeight: "100vh", background: "#fff", color: "#000", fontFamily: "sans-serif", padding: 32 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <button onClick={() => navigate("/")} style={ghostBtn}>← Home</button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>My Boards</h1>
        <button onClick={handleNew} style={solidBtn}>+ New Board</button>
      </div>

      {/* Empty state */}
      {boards.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 80, color: "#888" }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>No boards yet.</p>
          <button onClick={handleNew} style={solidBtn}>Create your first board</button>
        </div>
      )}

      {/* Board grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        {boards.map((board) => (
          <div key={board.id} style={{ border: "1px solid #000", borderRadius: 4, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Thumbnail placeholder */}
            <div
              onClick={() => handleOpen(board.id)}
              style={{ height: 100, background: "#f5f5f5", borderRadius: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}
            >
              🖊️
            </div>

            {/* Name */}
            {renamingId === board.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => commitRename(board.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(board.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                style={{ border: "1px solid #000", borderRadius: 2, padding: "3px 6px", fontSize: 13, width: "100%", boxSizing: "border-box" }}
              />
            ) : (
              <p
                onDoubleClick={() => startRename(board)}
                style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "text" }}
                title={board.name}
              >
                {board.name}
              </p>
            )}

            <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{timeAgo(board.updatedAt)}</p>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
              <button onClick={() => handleOpen(board.id)} style={{ ...solidBtn, flex: 1, fontSize: 12 }}>Open</button>
              <button onClick={() => startRename(board)} style={{ ...ghostBtn, fontSize: 12 }} title="Rename">✏️</button>
              <button onClick={() => handleDelete(board.id)} style={{ ...ghostBtn, fontSize: 12 }} title="Delete">🗑️</button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

const solidBtn = {
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const ghostBtn = {
  background: "none",
  color: "#000",
  border: "1px solid #000",
  borderRadius: 4,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: 13,
};

export default DashboardPage;
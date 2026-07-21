import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  listBoards,
  createBoard,
  renameBoard,
  deleteBoard,
} from "../utils/boardStorage";

// ── local-only favorites ─────────────────────────────────────────────────
// Not part of boardStorage.js — board objects don't have a `favorite`
// field yet, so this persists a simple id list in localStorage instead.
const FAVORITES_KEY = "whiteboard-dashboard-favorites";

function loadFavoriteIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch {
    return new Set();
  }
}
function saveFavoriteIds(ids) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...ids]));
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}
function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Muted gradient pairs cycled per thumbnail — stand-in for real preview images.
const THUMB_GRADIENTS = [
  "from-slate-200 to-slate-300",
  "from-indigo-100 to-indigo-200",
  "from-amber-100 to-orange-200",
  "from-emerald-100 to-teal-200",
  "from-rose-100 to-pink-200",
];

const DATE_FILTERS = [
  { key: "all", label: "All dates" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];
const SORTS = [
  { key: "recent", label: "Recent" },
  { key: "name", label: "Name A–Z" },
];

function DashboardPage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(loadFavoriteIds);
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [openMenuId, setOpenMenuId] = useState(null);

  function refresh() {
    setBoards(listBoards());
  }
  useEffect(refresh, []);

  function handleNew() {
    const id = createBoard("Untitled board");
    navigate(`/board/${id}`);
  }
  function handleOpen(id) {
    navigate(`/board/${id}`);
  }
  function startRename(board) {
    setRenamingId(board.id);
    setRenameValue(board.name);
    setOpenMenuId(null);
  }
  function commitRename(id) {
    renameBoard(id, renameValue);
    setRenamingId(null);
    refresh();
  }
  function handleDelete(id) {
    setOpenMenuId(null);
    if (window.confirm("Delete this board?")) {
      deleteBoard(id);
      refresh();
    }
  }
  function toggleFavorite(id) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavoriteIds(next);
      return next;
    });
  }

  const visibleBoards = useMemo(() => {
    const now = Date.now();
    const windows = { today: 864e5, week: 7 * 864e5, month: 30 * 864e5 };
    let list = boards.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));
    if (dateFilter !== "all") {
      list = list.filter((b) => now - b.updatedAt < windows[dateFilter]);
    }
    list = [...list].sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt
    );
    return list;
  }, [boards, search, dateFilter, sortBy]);

  const recentBoards = useMemo(
    () => [...boards].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [boards]
  );

  const lastSyncedLabel = boards.length
    ? timeAgo(Math.max(...boards.map((b) => b.updatedAt)))
    : "—";

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .db-font { font-family: 'Inter', sans-serif; }
        @keyframes db-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .db-fade-up { animation: db-fade-up 0.4s ease both; }
      `}</style>

      <div className="db-font max-w-6xl mx-auto px-6 sm:px-8 py-10">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="db-fade-up flex flex-wrap items-start justify-between gap-3 mb-7">
          <div>
            <button
              onClick={() => navigate("/")}
              className="text-xs font-medium text-[#6B7280] hover:text-[#111827] mb-2 transition-colors"
            >
              ← Home
            </button>
            <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">My Whiteboards</h1>
            <p className="text-[#6B7280] text-sm mt-0.5">
              Manage your boards, all in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mt-1">
            <span>{boards.length} board{boards.length !== 1 ? "s" : ""}</span>
            <span className="text-[#D1D5DB]">•</span>
            <span>Last synced {lastSyncedLabel}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-600 font-medium">Synced</span>
          </div>
        </div>

        {/* ── TOOLBAR ────────────────────────────────────────────────── */}
        <div className="db-fade-up flex flex-wrap items-center gap-3 mb-9" style={{ animationDelay: "0.03s" }}>
          <div className="relative flex-1 min-w-[220px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search whiteboards…"
              className="w-full bg-white border border-[#E5E7EB] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-shadow focus:border-[#4F46E5]/50 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#374151] outline-none cursor-pointer hover:border-[#D1D5DB] transition-colors"
          >
            {DATE_FILTERS.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-sm text-[#374151] outline-none cursor-pointer hover:border-[#D1D5DB] transition-colors"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>

          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1">
            <button
              onClick={() => setView("grid")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                view === "grid" ? "bg-[#111827] text-white" : "text-[#9CA3AF] hover:bg-[#F3F4F6]"
              }`}
              title="Grid view"
            >
              ▦
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                view === "list" ? "bg-[#111827] text-white" : "text-[#9CA3AF] hover:bg-[#F3F4F6]"
              }`}
              title="List view"
            >
              ☰
            </button>
          </div>

          <button
            onClick={handleNew}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors shadow-sm shadow-indigo-500/20"
          >
            + New Board
          </button>
        </div>

        {boards.length === 0 ? (
          <EmptyState onCreate={handleNew} />
        ) : (
          <>
            {/* ── RECENT BOARDS ────────────────────────────────────── */}
            {recentBoards.length > 0 && !search && (
              <section className="db-fade-up mb-10" style={{ animationDelay: "0.06s" }}>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-[15px] font-bold">Recent Boards</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentBoards.map((board, i) => (
                    <RecentCard
                      key={board.id}
                      board={board}
                      gradient={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}
                      isFavorite={favoriteIds.has(board.id)}
                      onOpen={() => handleOpen(board.id)}
                      onToggleFavorite={() => toggleFavorite(board.id)}
                      menuOpen={openMenuId === `recent-${board.id}`}
                      onToggleMenu={() =>
                        setOpenMenuId(openMenuId === `recent-${board.id}` ? null : `recent-${board.id}`)
                      }
                      onRename={() => startRename(board)}
                      onDelete={() => handleDelete(board.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── ALL BOARDS ───────────────────────────────────────── */}
            <section className="db-fade-up" style={{ animationDelay: "0.09s" }}>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="text-[15px] font-bold">My Boards</h2>
                <span className="text-xs text-[#9CA3AF]">{visibleBoards.length} board{visibleBoards.length !== 1 ? "s" : ""}</span>
              </div>

              {visibleBoards.length === 0 ? (
                <p className="text-[#6B7280] text-sm py-14 text-center">No boards match your filters.</p>
              ) : view === "list" ? (
                <div className="bg-white border border-[#E5E7EB] rounded-2xl divide-y divide-[#F1F1F3] overflow-hidden">
                  {visibleBoards.map((board) => (
                    <BoardRow
                      key={board.id}
                      board={board}
                      isFavorite={favoriteIds.has(board.id)}
                      isRenaming={renamingId === board.id}
                      renameValue={renameValue}
                      onOpen={() => handleOpen(board.id)}
                      onToggleFavorite={() => toggleFavorite(board.id)}
                      onStartRename={() => startRename(board)}
                      onRenameChange={setRenameValue}
                      onCommitRename={() => commitRename(board.id)}
                      onCancelRename={() => setRenamingId(null)}
                      onDelete={() => handleDelete(board.id)}
                      menuOpen={openMenuId === board.id}
                      onToggleMenu={() => setOpenMenuId(openMenuId === board.id ? null : board.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleBoards.map((board, i) => (
                    <RecentCard
                      key={board.id}
                      board={board}
                      gradient={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}
                      isFavorite={favoriteIds.has(board.id)}
                      onOpen={() => handleOpen(board.id)}
                      onToggleFavorite={() => toggleFavorite(board.id)}
                      menuOpen={openMenuId === board.id}
                      onToggleMenu={() => setOpenMenuId(openMenuId === board.id ? null : board.id)}
                      onRename={() => startRename(board)}
                      onDelete={() => handleDelete(board.id)}
                      isRenaming={renamingId === board.id}
                      renameValue={renameValue}
                      onRenameChange={setRenameValue}
                      onCommitRename={() => commitRename(board.id)}
                      onCancelRename={() => setRenamingId(null)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ── Small "you" avatar badge ────────────────────────────────────────────
function Avatar() {
  return (
    <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
      U
    </span>
  );
}

// ── "..." dropdown menu ──────────────────────────────────────────────────
function CardMenu({ open, onToggle, onRename, onDelete }) {
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
      >
        ⋯
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-20 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 text-sm"
        >
          <button onClick={onRename} className="w-full text-left px-3 py-2 hover:bg-[#F7F8FA] transition-colors">
            Rename
          </button>
          <button onClick={onDelete} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 transition-colors">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ── Card used for both Recent Boards and grid view ──────────────────────
function RecentCard({
  board,
  gradient,
  isFavorite,
  onOpen,
  onToggleFavorite,
  menuOpen,
  onToggleMenu,
  onRename,
  onDelete,
  isRenaming,
  renameValue,
  onRenameChange,
  onCommitRename,
  onCancelRename,
}) {
  return (
    <div className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-[0_8px_24px_rgba(17,24,39,0.08)] hover:border-[#D1D5DB] transition-all duration-200">
      <div
        onClick={onOpen}
        className={`relative h-32 cursor-pointer bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        <span className="text-3xl opacity-60 transition-transform duration-300 group-hover:scale-110">🖊️</span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          title={isFavorite ? "Unfavorite" : "Favorite"}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-150 ${
            isFavorite
              ? "bg-white text-amber-500"
              : "bg-white/70 text-[#9CA3AF] opacity-0 group-hover:opacity-100 hover:text-amber-500"
          }`}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          {isRenaming ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onCommitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCommitRename();
                if (e.key === "Escape") onCancelRename();
              }}
              className="text-sm font-semibold border border-[#4F46E5]/50 rounded-lg px-2 py-1 outline-none flex-1 min-w-0"
            />
          ) : (
            <h3
              onDoubleClick={onRename}
              title={board.name}
              className="text-sm font-semibold text-[#111827] truncate cursor-text"
            >
              {board.name}
            </h3>
          )}
          <CardMenu open={menuOpen} onToggle={onToggleMenu} onRename={onRename} onDelete={onDelete} />
        </div>
        <p className="text-xs text-[#9CA3AF] mt-1">Updated {timeAgo(board.updatedAt)}</p>
        <div className="mt-2.5">
          <Avatar />
        </div>
      </div>
    </div>
  );
}

// ── List row (used in list view) ─────────────────────────────────────────
function BoardRow({
  board,
  isFavorite,
  isRenaming,
  renameValue,
  onOpen,
  onToggleFavorite,
  onStartRename,
  onRenameChange,
  onCommitRename,
  onCancelRename,
  onDelete,
  menuOpen,
  onToggleMenu,
}) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 hover:bg-[#FAFAFB] transition-colors">
      <div
        onClick={onOpen}
        className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-base shrink-0 cursor-pointer"
      >
        🖊️
      </div>

      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitRename();
              if (e.key === "Escape") onCancelRename();
            }}
            className="text-sm font-semibold border border-[#4F46E5]/50 rounded-lg px-2 py-1 outline-none w-full max-w-xs"
          />
        ) : (
          <p
            onDoubleClick={onStartRename}
            onClick={onOpen}
            title={board.name}
            className="text-sm font-semibold text-[#111827] truncate cursor-pointer"
          >
            {board.name}
          </p>
        )}
        <p className="text-xs text-[#9CA3AF]">Updated {timeAgo(board.updatedAt)}</p>
      </div>

      <span className="hidden sm:block text-xs text-[#9CA3AF] w-28 shrink-0">
        {formatDate(board.createdAt ?? board.updatedAt)}
      </span>

      <Avatar />

      <button
        onClick={onToggleFavorite}
        title={isFavorite ? "Unfavorite" : "Favorite"}
        className={`text-sm transition-colors ${isFavorite ? "text-amber-500" : "text-[#D1D5DB] hover:text-amber-500"}`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <CardMenu open={menuOpen} onToggle={onToggleMenu} onRename={onStartRename} onDelete={onDelete} />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────
function EmptyState({ onCreate }) {
  return (
    <div className="db-fade-up flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-white border border-dashed border-[#E5E7EB]">
      <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center text-3xl mb-5">
        🎨
      </div>
      <h3 className="text-base font-bold text-[#111827] mb-1.5">Create your first board</h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-xs">
        Your whiteboards will show up here. Start sketching your first idea.
      </p>
      <button
        onClick={onCreate}
        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
      >
        + New Board
      </button>
    </div>
  );
}

export default DashboardPage;


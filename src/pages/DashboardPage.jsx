import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "./components/dashboard/AnimatedBackground";
import {
  listBoards,
  createBoard,
  renameBoard,
  deleteBoard,
} from "../utils/boardStorage";

import {
  loadFavoriteIds,
  saveFavoriteIds,
  THUMB_GRADIENTS,
  THUMB_TINTS,
  DATE_FILTERS,
  SORTS,
  STAR_FILTERS,
  getInitialTheme,
  applyTheme,
} from "./components/dashboard/dashboardUtils";
import { SearchInput, FilterSelect, ViewToggle } from "./components/dashboard/DashboardControls";
import { RecentCard, BoardRow, EmptyState } from "./components/dashboard/BoardCards";
import ThemeToggle from "./components/dashboard/ThemeToggle";

function DashboardPage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(loadFavoriteIds);
  const [dateFilter, setDateFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [openMenuId, setOpenMenuId] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);

  function refresh() {
    setBoards(listBoards());
  }
  useEffect(refresh, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

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
    if (starFilter === "starred") {
      list = list.filter((b) => favoriteIds.has(b.id));
    }
    list = [...list].sort((a, b) =>
      sortBy === "name" ? a.name.localeCompare(b.name) : b.updatedAt - a.updatedAt
    );
    return list;
  }, [boards, search, dateFilter, starFilter, favoriteIds, sortBy]);

  const recentBoards = useMemo(
    () => [...boards].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 3),
    [boards]
  );

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen text-[#111827] dark:text-[#E0E0E0] font-sans transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .db-font { font-family: 'Inter', sans-serif; }
        @keyframes db-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .db-fade-up { animation: db-fade-up 0.4s ease both; }
      `}</style>

      <div className="db-font max-w-6xl mx-auto px-6 sm:px-8 py-10">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="db-fade-up flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-lg font-extrabold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] dark:hover:text-[#93C5FD] mb-4 -ml-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:bg-[#EEF2FF] dark:hover:bg-[#262C3D] group"
            >
              <span className="text-lg transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
              Home
            </button>
            <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">My Whiteboards</h1>
            <p className="text-[#6B7280] dark:text-[#64748B] text-base mt-1">
              Manage your boards, all in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-2.5 bg-white dark:bg-[#1E2432] border border-[#E5E7EB] dark:border-[#333B4D] rounded-2xl px-4 py-2.5 shadow-sm transition-colors duration-300">
              <span className="text-sm text-[#4B5563] dark:text-[#94A3B8]">
                All Changes Saved
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D1D5DB] dark:bg-[#334155]" />
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Synced
              </span>
            </div>

            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* ── TOOLBAR ────────────────────────────────────────────────── */}
        <div
          className="db-fade-up flex flex-wrap items-center gap-3 mb-9 bg-white dark:bg-[#1E2432] border border-[#E5E7EB] dark:border-[#333B4D] rounded-2xl p-2.5 transition-colors duration-300"
          style={{ animationDelay: "0.03s" }}
        >
          <SearchInput value={search} onChange={setSearch} />

          <div className="flex items-center gap-2 pl-1">
            <FilterSelect value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} icon="📅" />
            <FilterSelect value={sortBy} onChange={setSortBy} options={SORTS} icon="↕️" />
          </div>

          <ViewToggle view={view} onChange={setView} />

          <button
            onClick={handleNew}
            className="bg-[#0D9488] hover:bg-[#0F766E] dark:bg-[#0891B2] dark:hover:bg-[#0E7490] text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm shadow-teal-500/20 hover:shadow-md hover:shadow-teal-500/30 hover:-translate-y-0.5 active:scale-[0.97]"
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
              <section className="db-fade-up mb-14" style={{ animationDelay: "0.06s" }}>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-base font-extrabold text-[#0B1120] dark:text-[#E0E0E0]">Recent Boards</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentBoards.map((board, i) => (
                    <RecentCard
                      key={board.id}
                      board={board}
                      thumbIndex={i}
                      gradient={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}
                      tint={THUMB_TINTS[i % THUMB_TINTS.length]}
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
                <h2 className="text-base font-extrabold text-[#0B1120] dark:text-[#E0E0E0]">My Boards</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9CA3AF] dark:text-[#64748B]">{visibleBoards.length} board{visibleBoards.length !== 1 ? "s" : ""}</span>
                  <FilterSelect value={starFilter} onChange={setStarFilter} options={STAR_FILTERS} icon={starFilter === "starred" ? "⭐" : ""} />
                </div>
              </div>

              {visibleBoards.length === 0 ? (
                <p className="text-[#6B7280] dark:text-[#64748B] text-sm py-14 text-center">No boards match your filters.</p>
              ) : view === "list" ? (
                <div className="bg-white dark:bg-[#1E2432] border border-[#E5E7EB] dark:border-[#333B4D] rounded-2xl divide-y divide-[#F1F1F3] dark:divide-[#333B4D] [&>*:first-child]:rounded-t-2xl [&>*:last-child]:rounded-b-2xl transition-colors duration-300">
                  {visibleBoards.map((board, i) => (
                    <BoardRow
                      key={board.id}
                      board={board}
                      tint={THUMB_TINTS[i % THUMB_TINTS.length]}
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
                      thumbIndex={i}
                      gradient={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}
                      tint={THUMB_TINTS[i % THUMB_TINTS.length]}
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
    </>
  );
}

export default DashboardPage;
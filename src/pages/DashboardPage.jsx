
          import { useState, useEffect, useMemo } from "react";
          import { useNavigate } from "react-router-dom";
          import {
            listBoards,
            createBoard,
            renameBoard,
            deleteBoard,
          } from "../utils/boardStorage";
          
          import {
            loadFavoriteIds,
            saveFavoriteIds,
            timeAgo,
            THUMB_GRADIENTS,
            THUMB_TINTS,
            DATE_FILTERS,
            SORTS,
          } from "./components/dashboard/dashboardUtils";
          import { SearchInput, FilterSelect, ViewToggle } from "./components/dashboard/DashboardControls";
          import { RecentCard, BoardRow, EmptyState } from "./components/dashboard/BoardCards";
          
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
                  <div className="db-fade-up flex flex-wrap items-start justify-between gap-4 mb-8">
                    <div>
                      <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#4B5563] hover:text-[#4F46E5] mb-4 -ml-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 hover:bg-[#EEF2FF] group"
                      >
                        <span className="text-base transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
                        Home
                      </button>
                      <h1 className="text-[26px] font-extrabold tracking-tight leading-tight">My Whiteboards</h1>
                      <p className="text-[#6B7280] text-sm mt-0.5">
                        Manage your boards, all in one place.
                      </p>
                    </div>
          
                    <div className="flex items-center gap-2.5 bg-white border border-[#E5E7EB] rounded-2xl px-4 py-2.5 shadow-sm mt-1">
                      <span className="text-sm font-semibold text-[#111827]">
                        {boards.length} board{boards.length !== 1 ? "s" : ""}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                      <span className="text-sm text-[#4B5563]">
                        Last synced <span className="font-semibold text-[#111827]">{lastSyncedLabel}</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Synced
                      </span>
                    </div>
                  </div>
          
                  {/* ── TOOLBAR ────────────────────────────────────────────────── */}
                  <div
                    className="db-fade-up flex flex-wrap items-center gap-3 mb-9 bg-white border border-[#E5E7EB] rounded-2xl p-2.5"
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
                      className="bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-200 shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5"
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
                          <h2 className="text-[15px] font-bold">My Boards</h2>
                          <span className="text-xs text-[#9CA3AF]">{visibleBoards.length} board{visibleBoards.length !== 1 ? "s" : ""}</span>
                        </div>
          
                        {visibleBoards.length === 0 ? (
                          <p className="text-[#6B7280] text-sm py-14 text-center">No boards match your filters.</p>
                        ) : view === "list" ? (
                          <div className="bg-white border border-[#E5E7EB] rounded-2xl divide-y divide-[#F1F1F3] overflow-hidden">
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
            );
          }
          
          export default DashboardPage;
          
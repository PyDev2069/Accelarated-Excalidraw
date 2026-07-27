import { CardMenu } from "./DashboardControls";
import { timeAgo, formatDate } from "./dashboardUtils";

// ── Real board-canvas screenshots, used as full-bleed card backgrounds ────
// Auto-imports every image in this folder, sorted by filename (preview1,
// preview2, ...). Add or remove files here and this list updates itself.
// Used by both RecentCard (grid) and BoardRow (list) now, so grid and list
// view show the same real screenshots instead of a generic icon in list view.
const previewModules = import.meta.glob(
  "../../../assets/board-previews/*.png",
  { eager: true, import: "default" }
);
export const PREVIEW_IMAGES = Object.keys(previewModules)
  .sort()
  .map((key) => previewModules[key]);

// ── Small dashed-square glyph for the empty state only ───────────────────
// No board exists yet at that point, so there's no screenshot to show and
// no reason to pull in a whole icon-set component for one static graphic.
function EmptyGlyph() {
  return (
    <svg viewBox="0 0 40 40" width="36" height="36" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="7" stroke="#CBD5E1" strokeWidth="1.6" strokeDasharray="4 3" />
      <line x1="20" y1="13" x2="20" y2="27" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="20" x2="27" y2="20" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Card used for both Recent Boards and grid view ──────────────────────
export function RecentCard({
  board,
  thumbIndex = 0,
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
    <div className={`group relative bg-white dark:bg-[#1E2432] border border-[#E5E7EB] dark:border-[#333B4D] rounded-2xl shadow-sm dark:shadow-none hover:shadow-[0_8px_24px_rgba(79,70,229,0.12)] hover:border-[#C7D2FE] dark:hover:border-[#4F46E5]/50 hover:-translate-y-0.5 transition-all duration-300 ${menuOpen ? "z-30" : "z-0"}`}>
      <div
        onClick={onOpen}
        className={`relative h-32 cursor-pointer bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden rounded-t-2xl active:scale-[0.98] transition-transform duration-150`}
      >
        {PREVIEW_IMAGES.length > 0 && (
          <img
            src={PREVIEW_IMAGES[thumbIndex % PREVIEW_IMAGES.length]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {isFavorite && (
          <span className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white dark:bg-[#232838] text-amber-500 text-lg flex items-center justify-center shadow-sm">
            ★
          </span>
        )}
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
              className="text-sm font-semibold bg-white dark:bg-[#14171F] text-[#111827] dark:text-[#E0E0E0] border border-[#4F46E5]/50 rounded-lg px-2 py-1 outline-none flex-1 min-w-0"
            />
          ) : (
            <h3
              onDoubleClick={onRename}
              title={board.name}
              className="text-base font-bold text-[#111827] dark:text-[#E0E0E0] truncate cursor-text transition-colors duration-200 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8]"
            >
              {board.name}
            </h3>
          )}
          <CardMenu
            open={menuOpen}
            onToggle={onToggleMenu}
            onRename={onRename}
            onDelete={onDelete}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
        <p className="text-sm font-normal text-[#9CA3AF] dark:text-[#64748B] mt-1">Updated {timeAgo(board.updatedAt)}</p>
      </div>
    </div>
  );
}

// ── List row (used in list view) ─────────────────────────────────────────
// Now shows a small crop of the same real screenshot used in grid view
// (matched by thumbIndex), instead of a generic sticky-note icon.
export function BoardRow({
  board,
  thumbIndex = 0,
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
  const previewSrc =
    PREVIEW_IMAGES.length > 0
      ? PREVIEW_IMAGES[thumbIndex % PREVIEW_IMAGES.length]
      : null;

  return (
    <div className={`group relative flex items-center gap-3.5 px-4 py-3 hover:bg-[#F5F6FF] dark:hover:bg-[#232838] transition-colors duration-200 ${menuOpen ? "z-30" : "z-0"}`}>
      <div
        onClick={onOpen}
        className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 cursor-pointer overflow-hidden transition-transform duration-200 group-hover:scale-105"
      >
        {previewSrc && (
          <img src={previewSrc} alt="" className="w-full h-full object-cover" />
        )}
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
            className="text-sm font-semibold bg-white dark:bg-[#14171F] text-[#111827] dark:text-[#E0E0E0] border border-[#4F46E5]/50 rounded-lg px-2 py-1 outline-none w-full max-w-xs"
          />
        ) : (
          <p
            onDoubleClick={onStartRename}
            onClick={onOpen}
            title={board.name}
            className="text-base font-bold text-[#111827] dark:text-[#E0E0E0] truncate cursor-pointer transition-colors duration-200 group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8]"
          >
            {board.name}
          </p>
        )}
        <p className="text-sm font-normal text-[#9CA3AF] dark:text-[#64748B]">Updated {timeAgo(board.updatedAt)}</p>
      </div>

      {isFavorite && (
        <span className="text-amber-500 text-lg shrink-0" title="Starred">★</span>
      )}

      <span className="hidden sm:block text-sm text-[#9CA3AF] dark:text-[#64748B] w-28 shrink-0">
        {formatDate(board.createdAt ?? board.updatedAt)}
      </span>

      <CardMenu
        open={menuOpen}
        onToggle={onToggleMenu}
        onRename={onStartRename}
        onDelete={onDelete}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────
export function EmptyState({ onCreate }) {
  return (
    <div className="db-fade-up flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-white dark:bg-[#1E2432] border border-dashed border-[#E5E7EB] dark:border-[#333B4D]">
      <div className="w-20 h-20 rounded-full bg-[#F3F4F6] dark:bg-[#14171F] flex items-center justify-center mb-5">
        <EmptyGlyph />
      </div>
      <h3 className="text-base font-bold text-[#111827] dark:text-[#E0E0E0] mb-1.5">Create your first board</h3>
      <p className="text-sm text-[#6B7280] dark:text-[#64748B] mb-6 max-w-xs">
        Your whiteboards will show up here. Start sketching your first idea.
      </p>
      <button
        onClick={onCreate}
        className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-indigo-500/20 hover:shadow-md hover:shadow-indigo-500/30 hover:-translate-y-0.5"
      >
        + New Board
      </button>
    </div>
  );
}
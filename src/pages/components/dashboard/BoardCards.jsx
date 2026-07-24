import PlaceholderArt from "./PlaceholderArt";
import { Avatar, CardMenu } from "./DashboardControls";
import { timeAgo, formatDate } from "./dashboardUtils";

// ── Card used for both Recent Boards and grid view ──────────────────────
export function RecentCard({
  board,
  thumbIndex = 0,
  gradient,
  tint,
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
    <div className="group bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden hover:shadow-[0_8px_24px_rgba(79,70,229,0.12)] hover:border-[#C7D2FE] hover:-translate-y-0.5 transition-all duration-300">
      <div
        onClick={onOpen}
        className={`relative h-32 cursor-pointer bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}
      >
        <div className="transition-transform duration-300 group-hover:scale-110">
          <PlaceholderArt index={thumbIndex} tint={tint} size={64} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          title={isFavorite ? "Unfavorite" : "Favorite"}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-200 ${
            isFavorite
              ? "bg-white text-amber-500"
              : "bg-white/70 text-[#9CA3AF] opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:scale-110"
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
              className="text-sm font-semibold text-[#111827] truncate cursor-text transition-colors duration-200 group-hover:text-[#4F46E5]"
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
export function BoardRow({
  board,
  tint,
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
    <div className="group flex items-center gap-3.5 px-4 py-3 hover:bg-[#F5F6FF] transition-colors duration-200">
      <div
        onClick={onOpen}
        className="w-11 h-11 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden transition-transform duration-200 group-hover:scale-105"
      >
        <PlaceholderArt index={0} tint={tint} size={30} />
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
            className="text-sm font-semibold text-[#111827] truncate cursor-pointer transition-colors duration-200 group-hover:text-[#4F46E5]"
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
        className={`text-sm transition-all duration-200 ${isFavorite ? "text-amber-500" : "text-[#D1D5DB] hover:text-amber-500 hover:scale-110"}`}
      >
        {isFavorite ? "★" : "☆"}
      </button>

      <CardMenu open={menuOpen} onToggle={onToggleMenu} onRename={onStartRename} onDelete={onDelete} />
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────
export function EmptyState({ onCreate }) {
  return (
    <div className="db-fade-up flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-white border border-dashed border-[#E5E7EB]">
      <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-5">
        <PlaceholderArt index={2} tint={{ stroke: "#9CA3AF", fill: "#E5E7EB" }} size={40} />
      </div>
      <h3 className="text-base font-bold text-[#111827] mb-1.5">Create your first board</h3>
      <p className="text-sm text-[#6B7280] mb-6 max-w-xs">
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

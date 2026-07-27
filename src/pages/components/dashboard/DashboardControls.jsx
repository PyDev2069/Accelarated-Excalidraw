import { useEffect, useRef } from "react";

// ── Small "you" avatar badge ────────────────────────────────────────────
export function Avatar() {
  return (
    <span className="w-5 h-5 rounded-full bg-[#EEF2FF] dark:bg-[#262C3D] text-[#4F46E5] dark:text-[#93C5FD] text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#1E2432]">
      U
    </span>
  );
}

// ── Search input with inline SVG icon ────────────────────────────────────
export function SearchInput({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-[220px] group">
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] transition-colors duration-200 group-focus-within:text-[#4F46E5]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search whiteboards…"
        className="w-full bg-[#F7F8FA] dark:bg-[#14171F] border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#111827] dark:text-[#E0E0E0] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] outline-none transition-shadow focus:bg-white dark:focus:bg-[#14171F] focus:border-[#4F46E5]/50 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]"
      />
    </div>
  );
}

// ── Restyled filter dropdown (icon + label, pill shape, breathing room) ─
export function FilterSelect({ value, onChange, options, icon }) {
  return (
    <div className="relative group">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-70">
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#F7F8FA] dark:bg-[#14171F] border border-transparent rounded-xl pl-8 pr-10 py-2.5 text-sm font-medium text-[#374151] dark:text-[#CBD5E1] outline-none cursor-pointer hover:bg-[#EEF2FF] dark:hover:bg-[#262C3D] hover:text-[#4F46E5] dark:hover:text-[#818CF8] focus:bg-white dark:focus:bg-[#14171F] focus:border-[#4F46E5]/40 transition-colors duration-200 min-w-[128px]"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 group-focus-within:rotate-180"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ── Grid/List view toggle ─────────────────────────────────────────────────
export function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center bg-[#F7F8FA] dark:bg-[#14171F] rounded-xl p-1">
      <button
        onClick={() => onChange("grid")}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200 ${
          view === "grid"
            ? "bg-[#111827] dark:bg-[#0891B2] text-white"
            : "text-[#9CA3AF] dark:text-[#64748B] hover:bg-white dark:hover:bg-[#262C3D] hover:text-[#4F46E5] dark:hover:text-[#818CF8]"
        }`}
        title="Grid view"
      >
        ▦
      </button>
      <button
        onClick={() => onChange("list")}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200 ${
          view === "list"
            ? "bg-[#111827] dark:bg-[#0891B2] text-white"
            : "text-[#9CA3AF] dark:text-[#64748B] hover:bg-white dark:hover:bg-[#262C3D] hover:text-[#4F46E5] dark:hover:text-[#818CF8]"
        }`}
        title="List view"
      >
        ☰
      </button>
    </div>
  );
}

// ── "..." dropdown menu ──────────────────────────────────────────────────
export function CardMenu({ open, onToggle, onRename, onDelete, isFavorite, onToggleFavorite }) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onToggle();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onToggle]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] dark:text-[#64748B] hover:bg-[#EEF2FF] dark:hover:bg-[#262C3D] hover:text-[#4F46E5] dark:hover:text-[#818CF8] transition-colors duration-200"
      >
        ⋯
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-[#232838] border border-[#E5E7EB] dark:border-[#333B4D] rounded-xl shadow-lg py-1 text-sm"
        >
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className="w-full flex items-center gap-2 text-left px-3 py-2 text-[#111827] dark:text-[#E0E0E0] hover:bg-[#EEF2FF] dark:hover:bg-[#262C3D] hover:text-[#4F46E5] dark:hover:text-[#818CF8] transition-colors duration-200"
            >
              <span className={isFavorite ? "text-amber-500" : "text-[#9CA3AF] dark:text-[#64748B]"}>
                {isFavorite ? "★" : "☆"}
              </span>
              {isFavorite ? "Remove from starred" : "Add to starred"}
            </button>
          )}
          <button onClick={onRename} className="w-full text-left px-3 py-2 text-[#111827] dark:text-[#E0E0E0] hover:bg-[#EEF2FF] dark:hover:bg-[#262C3D] hover:text-[#4F46E5] dark:hover:text-[#818CF8] transition-colors duration-200">
            Rename
          </button>
          <button onClick={onDelete} className="w-full text-left px-3 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-200">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
// ── Small "you" avatar badge ────────────────────────────────────────────
export function Avatar() {
  return (
    <span className="w-5 h-5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
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
        className="w-full bg-[#F7F8FA] border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-shadow focus:bg-white focus:border-[#4F46E5]/50 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]"
      />
    </div>
  );
}

// ── Restyled filter dropdown (icon + label, pill shape, breathing room) ─
export function FilterSelect({ value, onChange, options, icon }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-70">
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#F7F8FA] border border-transparent rounded-xl pl-8 pr-8 py-2.5 text-sm font-medium text-[#374151] outline-none cursor-pointer hover:bg-[#EEF2FF] hover:text-[#4F46E5] focus:bg-white focus:border-[#4F46E5]/40 transition-colors duration-200 min-w-[128px]"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#9CA3AF]">▼</span>
    </div>
  );
}

// ── Grid/List view toggle ─────────────────────────────────────────────────
export function ViewToggle({ view, onChange }) {
  return (
    <div className="flex items-center bg-[#F7F8FA] rounded-xl p-1">
      <button
        onClick={() => onChange("grid")}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200 ${
          view === "grid" ? "bg-[#111827] text-white" : "text-[#9CA3AF] hover:bg-white hover:text-[#4F46E5]"
        }`}
        title="Grid view"
      >
        ▦
      </button>
      <button
        onClick={() => onChange("list")}
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-200 ${
          view === "list" ? "bg-[#111827] text-white" : "text-[#9CA3AF] hover:bg-white hover:text-[#4F46E5]"
        }`}
        title="List view"
      >
        ☰
      </button>
    </div>
  );
}

// ── "..." dropdown menu ──────────────────────────────────────────────────
export function CardMenu({ open, onToggle, onRename, onDelete }) {
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-colors duration-200"
      >
        ⋯
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-20 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1 text-sm"
        >
          <button onClick={onRename} className="w-full text-left px-3 py-2 hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-colors duration-200">
            Rename
          </button>
          <button onClick={onDelete} className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-50 transition-colors duration-200">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

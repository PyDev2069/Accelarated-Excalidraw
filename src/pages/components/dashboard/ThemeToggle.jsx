// ── Light/Dark mode toggle — pill switch with sun/moon icons ─────────────
function SunIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
function MoonIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggle}
      className={`relative w-14 h-8 shrink-0 rounded-full flex items-center px-1 transition-colors duration-300 ${
        isDark ? "bg-[#262C3D]" : "bg-[#EEF2FF]"
      }`}
    >
      {/* track icons */}
      <SunIcon
        className={`absolute left-1.5 w-4 h-4 transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-100 text-[#F59E0B]"
        }`}
      />
      <MoonIcon
        className={`absolute right-1.5 w-3.5 h-3.5 transition-opacity duration-300 ${
          isDark ? "opacity-100 text-[#93C5FD]" : "opacity-0"
        }`}
      />

      {/* sliding knob */}
      <span
        className={`relative z-10 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ease-out ${
          isDark ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <MoonIcon className="w-3.5 h-3.5 text-[#4F46E5]" />
        ) : (
          <SunIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
        )}
      </span>
    </button>
  );
}

export default ThemeToggle;

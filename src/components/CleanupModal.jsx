import { useEffect } from "react";
import { THEME } from "./themeAndIcons";

/**
 * CleanupModal
 * ─────────────
 * Warning / confirmation dialog shown before the AI cleanup runs.
 * Matches OrganizeModal's visual pattern but with richer info.
 *
 * Props:
 *   dark       – boolean
 *   scope      – "selection" | "board"
 *   count      – number of elements in scope
 *   onConfirm  – called when user confirms
 *   onCancel   – called when user cancels
 */
export function CleanupModal({ dark, scope, count, onConfirm, onCancel }) {
  const t = dark ? THEME.dark : THEME.light;

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const isSelection = scope === "selection";
  const scopeLabel  = isSelection ? "selected area" : "entire board";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 950,
      background: "rgba(10, 9, 15, 0.6)",
      backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: t.modalBg,
        border: `1px solid ${t.lavenderBorder}`,
        borderRadius: 18,
        padding: "28px 28px 24px",
        width: "100%", maxWidth: 440,
        boxShadow: dark
          ? "0 28px 64px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)"
          : "0 28px 64px rgba(105,101,219,0.20), 0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", gap: 20,
      }}>

        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: t.lavenderBg,
            border: `1px solid ${t.lavenderBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6965DB",
          }}>
            <BrushIcon />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.heading, marginBottom: 5 }}>
              {isSelection ? "Clean up selection" : "Clean up entire board"}
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.55 }}>
              Archie AI will analyse {count} element{count !== 1 ? "s" : ""} in
              your {scopeLabel}, group them by meaning, and arrange them into a
              tidy, readable layout.
            </div>
          </div>
        </div>

        {/* What happens */}
        <div style={{
          background: t.lavenderBg,
          border: `1px solid ${t.lavenderBorder}`,
          borderRadius: 12, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", color: t.textMuted, marginBottom: 2 }}>
            What Archie will do
          </div>
          {[
            ["🧠", "Read text & types to find logical groups"],
            ["🔗", "Keep arrow-connected shapes in the same group"],
            ["📐", "Align and space groups in a clean grid"],
            ["✅", "Preserve all content — nothing is deleted"],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: t.textMuted, lineHeight: 1.45 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Warning */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          background: dark ? "rgba(245,166,36,0.1)" : "#FFFBEB",
          border: `1px solid ${dark ? "rgba(245,166,36,0.3)" : "#FDE68A"}`,
          borderRadius: 10, padding: "10px 12px",
        }}>
          <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
          <span style={{ fontSize: 12, color: dark ? "#F5A524" : "#92400E", lineHeight: 1.5 }}>
            This will move elements on the canvas. You can undo with{" "}
            <strong>Ctrl+Z / ⌘Z</strong> immediately after.             
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 20px", fontSize: 13, fontWeight: 600,
              border: `1px solid ${t.lavenderBorder}`,
              borderRadius: 9, background: "transparent",
              color: t.textMuted, cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.lavenderBg; e.currentTarget.style.color = t.subheading; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: "9px 22px", fontSize: 13, fontWeight: 700,
              border: "none", borderRadius: 9,
              background: "linear-gradient(135deg, #6965DB 0%, #7C3AED 100%)",
              color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 14px rgba(105,101,219,0.40)",
              display: "flex", alignItems: "center", gap: 7,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(105,101,219,0.50)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(105,101,219,0.40)"; }}
          >
            <BrushIcon size={13} />
            Clean up
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Progress overlay — shown while Ollama works ───────────────────────────────
export function CleanupProgressOverlay({ dark, message, onCancel }) {
  const t = dark ? THEME.dark : THEME.light;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 950,
      background: "rgba(10, 9, 15, 0.55)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: t.modalBg,
        border: `1px solid ${t.lavenderBorder}`,
        borderRadius: 16,
        padding: "32px 36px",
        maxWidth: 360, width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
        boxShadow: dark
          ? "0 24px 56px rgba(0,0,0,0.6)"
          : "0 24px 56px rgba(105,101,219,0.18)",
      }}>
        {/* Spinner */}
        <div style={{ position: "relative", width: 52, height: 52 }}>
          <div style={{
            position: "absolute", inset: 0,
            border: `3px solid ${t.lavenderBg}`,
            borderTopColor: "#6965DB",
            borderRadius: "50%",
            animation: "cleanup-spin 0.75s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6965DB",
          }}>
            <BrushIcon size={18} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.heading, marginBottom: 6 }}>
            Cleaning up…
          </div>
          <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
            {message || "Archie is analysing your diagram"}
          </div>
        </div>

        {/* Pulsing dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#6965DB", opacity: 0.5,
              animation: `cleanup-blink 1.2s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>

        <button
          onClick={onCancel}
          style={{
            marginTop: 4, fontSize: 12, color: t.textMuted,
            background: "none", border: "none", cursor: "pointer",
            textDecoration: "underline", textUnderlineOffset: 2,
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes cleanup-spin  { to { transform: rotate(360deg); } }
        @keyframes cleanup-blink { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
      `}</style>
    </div>
  );
}

// ── Error toast ───────────────────────────────────────────────────────────────
export function CleanupErrorToast({ dark, message, onDismiss }) {
  const t = dark ? THEME.dark : THEME.light;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      zIndex: 1100,
      background: dark ? "#2A1A1A" : "#FEF2F2",
      border: `1px solid ${dark ? "#5A2A2A" : "#FCA5A5"}`,
      borderRadius: 12, padding: "12px 18px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      maxWidth: 420,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      animation: "cleanup-fadein 0.2s ease",
    }}>
      <span style={{ fontSize: 16 }}>❌</span>
      <span style={{ fontSize: 13, color: dark ? "#F87171" : "#991B1B", flex: 1, lineHeight: 1.45 }}>
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", color: dark ? "#F87171" : "#991B1B", fontWeight: 700, fontSize: 14, padding: "0 4px" }}
      >
        ✕
      </button>
      <style>{`@keyframes cleanup-fadein { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Success toast ─────────────────────────────────────────────────────────────
export function CleanupSuccessToast({ dark, count, onDismiss }) {
  const t = dark ? THEME.dark : THEME.light;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      zIndex: 1100,
      background: dark ? "#0D1F17" : "#F0FDF4",
      border: `1px solid ${dark ? "#166534" : "#86EFAC"}`,
      borderRadius: 12, padding: "12px 18px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      animation: "cleanup-fadein 0.2s ease",
    }}>
      <span style={{ fontSize: 16 }}>✨</span>
      <span style={{ fontSize: 13, color: dark ? "#4ADE80" : "#166534", lineHeight: 1.45 }}>
        Cleaned up {count} element{count !== 1 ? "s" : ""}. Press Ctrl+Z to undo.
      </span>
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", cursor: "pointer", color: dark ? "#4ADE80" : "#166534", fontWeight: 700, fontSize: 14, padding: "0 4px" }}
      >
        ✕
      </button>
      <style>{`@keyframes cleanup-fadein { from { opacity:0; transform: translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── Icon ──────────────────────────────────────────────────────────────────────
function BrushIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08" />
      <path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1 1 2.08 1.02 3.99 1.02 1.66 0 3-1.34 3-3.02 0-1.67-1.34-3.04-3-3.04z" />
    </svg>
  );
}
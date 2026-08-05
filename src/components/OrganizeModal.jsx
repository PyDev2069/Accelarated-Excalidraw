import { useEffect } from "react";
import { THEME } from "./themeAndIcons";

/**
 * OrganizeModal
 * ─────────────
 * Confirmation dialog shown before the clutter-free reorganise runs.
 * Matches the UploadFileModal overlay pattern (portal-less variant —
 * it's rendered inside the WhiteboardPage tree which already fills the viewport).
 *
 * Props:
 *   dark      – boolean, inherits board theme
 *   onConfirm – called when user clicks "Organise"
 *   onCancel  – called when user cancels
 *   count     – number of elements that will be moved
 */
export function OrganizeModal({ dark, onConfirm, onCancel, count }) {
  const t = dark ? THEME.dark : THEME.light;

  // Escape key to cancel
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(10, 9, 15, 0.55)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        background: t.modalBg,
        border: `1px solid ${t.lavenderBorder}`,
        borderRadius: 16,
        padding: "28px 28px 24px",
        width: "100%", maxWidth: 400,
        boxShadow: dark
          ? "0 24px 60px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)"
          : "0 24px 60px rgba(105,101,219,0.18), 0 2px 8px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", gap: 20,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: t.lavenderBg,
            border: `1px solid ${t.lavenderBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6965DB",
          }}>
            <OrganizeIcon />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.heading, marginBottom: 4 }}>
              Organise board
            </div>
            <div style={{ fontSize: 13, color: t.textMuted, lineHeight: 1.5 }}>
              {count > 0
                ? `${count} element${count === 1 ? "" : "s"} will be rearranged into a clean layout. Connected groups stay together.`
                : "Nothing on this board to organise yet."}
            </div>
          </div>
        </div>

        {/* What it does */}
        {count > 0 && (
          <div style={{
            background: t.lavenderBg,
            border: `1px solid ${t.lavenderBorder}`,
            borderRadius: 10, padding: "12px 14px",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            {[
              "Groups items connected by arrows",
              "Stacks loose text & shapes neatly",
              "Arranges clusters left-to-right in rows",
              "Preserves all content — nothing deleted",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: t.textMuted }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6965DB", flexShrink: 0 }} />
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Undo tip */}
        {count > 0 && (
          <div style={{ fontSize: 11.5, color: t.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
            <InfoIcon color={t.textMuted} />
            You can undo this with Ctrl+Z / ⌘Z immediately after.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 18px", fontSize: 13, fontWeight: 600,
              border: `1px solid ${t.lavenderBorder}`,
              borderRadius: 8, background: "transparent",
              color: t.textMuted, cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = t.lavenderBg; e.currentTarget.style.color = t.subheading; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}
          >
            Cancel
          </button>
          {count > 0 && (
            <button
              onClick={onConfirm}
              style={{
                padding: "8px 20px", fontSize: 13, fontWeight: 700,
                border: "none", borderRadius: 8,
                background: "#6965DB", color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(105,101,219,0.35)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#5552C0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#6965DB"; e.currentTarget.style.transform = "none"; }}
            >
              Organise
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Local icons ───────────────────────────────────────────────────────────────

function OrganizeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function InfoIcon({ color }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

// We also need t.subheading — patch THEME locally if it's missing
// (themeAndIcons doesn't export subheading, so alias from heading)
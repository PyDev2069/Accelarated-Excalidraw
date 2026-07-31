import { useState, useEffect, useRef, useCallback } from "react";
import { saveLink, deleteLink } from "../utils/boardStorage";

const SUPPORTED_TYPES = new Set([
  "rectangle", "ellipse", "diamond",
  "arrow", "line", "freedraw", "text",
]);

export function isSupportedElement(el) {
  return el && SUPPORTED_TYPES.has(el.type);
}

const MIN_WIDTH = 260;
const MAX_WIDTH = 640;
const DEFAULT_WIDTH = 320;

// ── Theme tokens (same palette as CodeSidebar.jsx) ───────────────────────
const THEME = {
  light: {
    lavender: "#6965DB",
    lavenderBg: "#F0F0FB",
    lavenderSoft: "#F8F7FD",
    lavenderBorder: "#DAD9F6",
    heading: "#4F4CA4",
    textMuted: "#6B67A0",
    unsaved: "#D97706",
    cardBg: "rgba(255, 255, 255, 0.98)",
    cardShadow: "0 8px 24px rgba(105,101,219,0.10), 0 1px 3px rgba(15,23,42,0.05)",
    surface: "#ffffff",
    inputBg: "#FAF9FC",
    inputText: "#4F4CA4",
    disabledBg: "#ECE9F5",
    disabledText: "#B7B0D1",
    btnBg: "#4F4CA4",
    btnHoverBg: "#44428E",
    errorRing: "#fee2e2",
  },
  dark: {
    lavender: "#6965DB",
    lavenderBg: "#26233A",
    lavenderSoft: "rgba(105,101,219,0.25)",
    lavenderBorder: "#3A3655",
    heading: "#C9C6F5",
    textMuted: "#8A85B8",
    unsaved: "#F5A524",
    cardBg: "rgba(24, 22, 36, 0.98)",
    cardShadow: "0 8px 24px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.3)",
    surface: "#211F30",
    inputBg: "#1B1926",
    inputText: "#D9D6F5",
    disabledBg: "#26233A",
    disabledText: "#55507A",
    btnBg: "#6965DB",
    btnHoverBg: "#7D79E5",
    errorRing: "rgba(225,29,72,0.25)",
  },
};

const SLOTS = ["link1", "link2"];
const SLOT_LABELS = { link1: "Reference Link 1", link2: "Reference Link 2" };

// ── SVG Icons ────────────────────────────────────────────────────────────────

function SaveIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function LinkIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ExternalLinkIcon(props) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function looksLikeUrl(value) {
  if (!value) return true;
  return /^https?:\/\/\S+\.\S+/i.test(value.trim());
}

function normalizeStoredLinks(stored) {
  if (!stored) return { link1: "", link2: "" };
  if (typeof stored === "string") return { link1: stored, link2: "" };
  return { link1: stored.link1 || "", link2: stored.link2 || "" };
}

function LinksSidebar({ boardId, selectedElement, links, onLinkChange, onClose, width = DEFAULT_WIDTH, onWidthChange = () => {}, dark = false }) {
  const t = dark ? THEME.dark : THEME.light;

  const [urls, setUrls] = useState({ link1: "", link2: "" });

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const savedLinks = selectedElement
    ? normalizeStoredLinks(links[selectedElement.id])
    : { link1: "", link2: "" };

  useEffect(() => {
    if (!selectedElement) return;
    setUrls(normalizeStoredLinks(links[selectedElement.id]));
  }, [selectedElement?.id]);

  if (!selectedElement || !isSupportedElement(selectedElement)) return null;

  function handleSave(slot) {
    const trimmed = (urls[slot] || "").trim();
    if (!trimmed || !looksLikeUrl(trimmed)) return;
    const next = { ...savedLinks, [slot]: trimmed };
    saveLink(boardId, selectedElement.id, next);
    onLinkChange();
  }

  function handleClear(slot) {
    setUrls((prev) => ({ ...prev, [slot]: "" }));
    const next = { ...savedLinks, [slot]: "" };
    if (!next.link1 && !next.link2) {
      deleteLink(boardId, selectedElement.id);
    } else {
      saveLink(boardId, selectedElement.id, next);
    }
    onLinkChange();
  }

  function handleOpen(slot) {
    const value = savedLinks[slot];
    if (!value) return;
    window.open(value, "_blank", "noopener,noreferrer");
  }

  // ── drag resize ───────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const delta = startX.current - e.clientX;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
    onWidthChange(newWidth);
  }, [onWidthChange]);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  function onDragHandleMouseDown(e) {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  // ── style objects (theme-dependent) ─────────────────────────────────────
  const inputStyle = {
    width: "100%",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: 14,
    padding: "10px 14px",
    border: `1px solid ${t.lavenderBorder}`,
    borderRadius: 10,
    outline: "none",
    background: t.inputBg,
    color: t.inputText,
  };

  const solidBtn = {
    flex: 1,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const ghostBtn = {
    flex: 1,
    background: t.surface,
    color: t.inputText,
    border: `1px solid ${t.lavenderBorder}`,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const savedPillStyle = {
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 8,
    display: "inline-block",
    width: "fit-content",
  };

  const openLinkBtn = {
    width: "100%",
    background: t.surface,
    color: t.inputText,
    border: `1px solid ${t.lavenderBorder}`,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 13.5,
    fontWeight: 500,
    textAlign: "left",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
  };

  return (
    <div className="ls-wrap" style={{ width }}>
      <div
        onMouseDown={onDragHandleMouseDown}
        className="ls-drag-handle"
        style={{ "--lavender": t.lavender }}
      />
      <div
        className="ls-card"
        style={{
          "--lavender": t.lavender,
          "--lavender-bg": t.lavenderBg,
          "--lavender-soft": t.lavenderSoft,
          "--lavender-border": t.lavenderBorder,
          "--heading": t.heading,
          "--card-bg": t.cardBg,
          "--card-shadow": t.cardShadow,
          "--surface": t.surface,
          "--btn-bg": t.btnBg,
          "--btn-hover-bg": t.btnHoverBg,
          "--disabled-bg": t.disabledBg,
          "--disabled-text": t.disabledText,
          "--unsaved": t.unsaved,
          "--error-ring": t.errorRing,
        }}
      >
        <style>{`
          .ls-card * { box-sizing: border-box; }

          .ls-wrap {
            flex-shrink: 0;
            height: 100%;
            display: flex;
            padding: 4px 10px 14px 10px;
            position: relative;
          }

          .ls-drag-handle {
            position: absolute;
            left: 0;
            top: 4px;
            bottom: 14px;
            width: 6px;
            cursor: ew-resize;
            z-index: 10;
            border-radius: 4px;
            transition: background 0.18s ease, box-shadow 0.18s ease;
          }
          .ls-drag-handle:hover {
            background: var(--lavender);
            box-shadow: 0 0 8px 1px rgba(105, 101, 219, 0.5);
          }

          .ls-card {
            flex: 1;
            min-width: 0;
            background: var(--card-bg);
            backdrop-filter: blur(6px);
            border-radius: 18px;
            box-shadow: var(--card-shadow);
            border: 1px solid var(--lavender-border);
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .ls-close {
            width: 28px; height: 28px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--lavender);
            cursor: pointer;
            font-size: 15px;
            transition: background 0.15s ease, color 0.15s ease;
          }
          .ls-close:hover { background: var(--lavender-bg); color: var(--heading); }

          .ls-input {
            transition: border-color 0.18s ease, box-shadow 0.18s ease;
          }
          .ls-input:hover { border-color: var(--lavender); }
          .ls-input:focus {
            border-color: var(--lavender);
            box-shadow: 0 0 0 3px var(--lavender-soft);
          }
          .ls-input.invalid:focus {
            border-color: #e11d48;
            box-shadow: 0 0 0 3px var(--error-ring);
          }

          .ls-btn-solid {
            background: var(--btn-bg);
            transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
          }
          .ls-btn-solid:hover:not(:disabled) {
            background: var(--btn-hover-bg);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(105, 101, 219, 0.32);
          }
          .ls-btn-solid:active:not(:disabled) { transform: translateY(0px); }
          .ls-btn-solid:disabled {
            background: var(--disabled-bg);
            color: var(--disabled-text);
            cursor: not-allowed;
          }

          .ls-btn-ghost {
            transition: border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, transform 0.12s ease;
          }
          .ls-btn-ghost:hover {
            border-color: var(--lavender);
            background: var(--lavender-bg);
            color: var(--heading);
            transform: translateY(-1px);
          }

          .ls-open-btn {
            transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, transform 0.12s ease;
          }
          .ls-open-btn:hover {
            border-color: var(--lavender);
            background: var(--lavender-bg);
            color: var(--heading);
            transform: translateY(-1px);
          }

          .ls-saved-pill { background: var(--lavender-bg); color: var(--heading); border: 1px solid var(--lavender-border); }
          .ls-unsaved-dot { background: var(--unsaved); }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <LinkIcon style={{ color: t.lavender }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: t.heading }}>Reference Links</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: t.lavender,
                background: t.lavenderBg, padding: "3px 10px", borderRadius: 999, marginLeft: 2,
              }}>
                {selectedElement.type}
              </span>
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textMuted }}>
              Attach up to two links to this shape
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="ls-close">✕</button>
          )}
        </div>

        {SLOTS.map((slot, i) => {
          const url = urls[slot] || "";
          const trimmed = url.trim();
          const isValid = looksLikeUrl(trimmed);
          const savedUrl = savedLinks[slot];
          const isUnsaved = trimmed && trimmed !== savedUrl;

          return (
            <div
              key={slot}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                paddingTop: i > 0 ? 20 : 0,
                borderTop: i > 0 ? "1px solid var(--lavender-border)" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.textMuted }}>
                  {SLOT_LABELS[slot]}
                </span>
                {isUnsaved && (
                  <span
                    className="ls-unsaved-dot"
                    title="Unsaved changes"
                    style={{ width: 7, height: 7, borderRadius: "50%" }}
                  />
                )}
              </div>

              <input
                value={url}
                onChange={(e) => setUrls((prev) => ({ ...prev, [slot]: e.target.value }))}
                placeholder="https://…"
                spellCheck={false}
                className={`ls-input${url && !isValid ? " invalid" : ""}`}
                style={{
                  ...inputStyle,
                  borderColor: url && !isValid ? "#e11d48" : t.lavenderBorder,
                }}
              />
              {url && !isValid && (
                <p style={{ margin: 0, fontSize: 12, color: "#e11d48" }}>
                  Doesn't look like a valid URL (expected something like https://…)
                </p>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleSave(slot)}
                  disabled={!trimmed || !isValid}
                  className="ls-btn-solid"
                  style={solidBtn}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <SaveIcon />
                    <span>Save</span>
                  </span>
                </button>
                <button onClick={() => handleClear(slot)} className="ls-btn-ghost" style={ghostBtn}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <TrashIcon />
                    <span>Clear</span>
                  </span>
                </button>
              </div>

              {savedUrl && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  <span className="ls-saved-pill" style={savedPillStyle}>✓ Link saved</span>
                  <button onClick={() => handleOpen(slot)} className="ls-open-btn" style={openLinkBtn} title={savedUrl}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <ExternalLinkIcon />
                      <span>Open {truncateUrl(savedUrl)}</span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function truncateUrl(url, max = 28) {
  return url.length > max ? url.slice(0, max) + "…" : url;
}

export default LinksSidebar;
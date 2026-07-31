import { useState, useEffect, useRef, useCallback } from "react";
import {
  saveSnippet,
  deleteSnippet,
  saveNote,
  deleteNote,
} from "../utils/boardStorage";

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

// ── Theme tokens ──────────────────────────────────────────────────────────
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
    inactiveDot: "#CFC9E3",
    tabActiveShadow: "0 1px 4px rgba(105,101,219,0.28)",
    arrow: "%236B67A0",
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
    inactiveDot: "#4A4568",
    tabActiveShadow: "0 1px 4px rgba(0,0,0,0.4)",
    arrow: "%238A85B8",
  },
};

const LANGUAGES = [
  "javascript", "typescript", "python", "html", "css",
  "json", "sql", "bash", "c", "cpp", "java", "go", "rust",
];

const MODES = ["code", "note"];
const MODE_LABELS = { code: "Code Snippet", note: "Note" };

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

function CodeIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function NoteIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function CodeSidebar({
  boardId,
  selectedElement,
  snippets,
  onSnippetChange,
  notes,
  onNoteChange,
  onClose,
  width = DEFAULT_WIDTH,
  onWidthChange = () => {},
  dark = false,
}) {
  const t = dark ? THEME.dark : THEME.light;

  const [mode, setMode] = useState("code"); // "code" | "note" — one view at a time

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [noteText, setNoteText] = useState("");

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const savedSnippet = selectedElement ? snippets[selectedElement.id] : null;
  const savedNote = selectedElement ? notes[selectedElement.id] : null;

  useEffect(() => {
    if (!selectedElement) return;
    setMode("code");
    const snip = snippets[selectedElement.id];
    setCode(snip?.code || "");
    setLanguage(snip?.language || "javascript");
    setNoteText(notes[selectedElement.id] || "");
  }, [selectedElement?.id]);

  if (!selectedElement || !isSupportedElement(selectedElement)) return null;

  const isCodeUnsaved =
    code !== (savedSnippet?.code || "") ||
    language !== (savedSnippet?.language || "javascript");
  const isNoteUnsaved = noteText !== (savedNote || "");

  function handleSaveCode() {
    if (!code.trim()) return;
    saveSnippet(boardId, selectedElement.id, code, language);
    onSnippetChange();
  }

  function handleClearCode() {
    setCode("");
    deleteSnippet(boardId, selectedElement.id);
    onSnippetChange();
  }

  function handleSaveNote() {
    if (!noteText.trim()) return;
    saveNote(boardId, selectedElement.id, noteText);
    onNoteChange();
  }

  function handleClearNote() {
    setNoteText("");
    deleteNote(boardId, selectedElement.id);
    onNoteChange();
  }

  // ── drag resize ───────────────────────────────────────────────────────────
  const onMouseMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      onWidthChange(newWidth);
    },
    [onWidthChange]
  );

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
  const selectStyle = {
    fontFamily: "inherit",
    fontSize: 14,
    width: "100%",
    padding: "9px 38px 9px 12px",
    border: `1px solid ${t.lavenderBorder}`,
    borderRadius: 10,
    outline: "none",
    background: `${t.inputBg} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='${t.arrow}' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center`,
    backgroundSize: "14px 14px",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    color: t.inputText,
    cursor: "pointer",
  };

  const codeTextareaStyle = {
    width: "100%",
    height: 220,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: 13.5,
    lineHeight: 1.5,
    padding: "10px 12px",
    border: `1px solid ${t.lavenderBorder}`,
    borderRadius: 10,
    outline: "none",
    background: t.inputBg,
    color: t.inputText,
    resize: "vertical",
  };

  const notesTextareaStyle = {
    width: "100%",
    height: 220,
    fontFamily: "inherit",
    fontSize: 13.5,
    lineHeight: 1.55,
    padding: "10px 12px",
    border: `1px solid ${t.lavenderBorder}`,
    borderRadius: 10,
    outline: "none",
    background: t.inputBg,
    color: t.inputText,
    resize: "vertical",
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
    padding: "3px 9px",
    borderRadius: 6,
  };

  return (
    <div className="cs-wrap" style={{ width }}>
      <div
        onMouseDown={onDragHandleMouseDown}
        className="cs-drag-handle"
        style={{ "--lavender": t.lavender }}
      />
      <div
        className="cs-card"
        style={{
          "--lavender": t.lavender,
          "--lavender-bg": t.lavenderBg,
          "--lavender-soft": t.lavenderSoft,
          "--lavender-border": t.lavenderBorder,
          "--heading": t.heading,
          "--card-bg": t.cardBg,
          "--card-shadow": t.cardShadow,
          "--surface": t.surface,
          "--tab-inactive": t.textMuted,
          "--tab-active-shadow": t.tabActiveShadow,
          "--btn-bg": t.btnBg,
          "--btn-hover-bg": t.btnHoverBg,
          "--disabled-bg": t.disabledBg,
          "--disabled-text": t.disabledText,
          "--unsaved": t.unsaved,
        }}
      >
        <style>{`
          .cs-card * { box-sizing: border-box; }

          .cs-wrap {
            flex-shrink: 0;
            height: 100%;
            display: flex;
            padding: 4px 10px 14px 10px;
            position: relative;
          }

          .cs-drag-handle {
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
          .cs-drag-handle:hover {
            background: var(--lavender);
            box-shadow: 0 0 8px 1px rgba(105, 101, 219, 0.5);
          }

          .cs-card {
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
            gap: 18px;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .cs-close {
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
          .cs-close:hover { background: var(--lavender-bg); color: var(--heading); }

          /* segmented Code Snippet / Note toggle */
          .cs-tab-group {
            display: flex;
            gap: 3px;
            padding: 4px;
            background: var(--lavender-bg);
            border-radius: 10px;
          }
          .cs-tab {
            flex: 1;
            padding: 9px 0;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--tab-inactive);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.1px;
            cursor: pointer;
            transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
          }
          .cs-tab:hover { color: var(--heading); }
          .cs-tab.active {
            background: var(--surface);
            color: var(--heading);
            box-shadow: var(--tab-active-shadow);
          }

          .cs-select {
            transition: border-color 0.18s ease, box-shadow 0.18s ease;
          }
          .cs-select:hover { border-color: var(--lavender); }
          .cs-select:focus {
            border-color: var(--lavender);
            box-shadow: 0 0 0 3px var(--lavender-soft);
          }

          .cs-textarea {
            transition: border-color 0.18s ease, box-shadow 0.18s ease;
          }
          .cs-textarea:hover { border-color: var(--lavender); }
          .cs-textarea:focus {
            border-color: var(--lavender);
            box-shadow: 0 0 0 3px var(--lavender-soft);
          }

          .cs-btn-solid {
            background: var(--btn-bg);
            transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease;
          }
          .cs-btn-solid:hover:not(:disabled) {
            background: var(--btn-hover-bg);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(105, 101, 219, 0.32);
          }
          .cs-btn-solid:active:not(:disabled) { transform: translateY(0px); }
          .cs-btn-solid:disabled {
            background: var(--disabled-bg);
            color: var(--disabled-text);
            cursor: not-allowed;
          }

          .cs-btn-ghost {
            transition: border-color 0.18s ease, box-shadow 0.18s ease, color 0.18s ease, transform 0.12s ease;
          }
          .cs-btn-ghost:hover {
            border-color: var(--lavender);
            background: var(--lavender-bg);
            color: var(--heading);
            transform: translateY(-1px);
          }

          .cs-saved-pill { background: var(--lavender-bg); color: var(--heading); border: 1px solid var(--lavender-border); }
          .cs-unsaved-dot { background: var(--unsaved); }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {mode === "code" ? <CodeIcon style={{ color: t.lavender }} /> : <NoteIcon style={{ color: t.lavender }} />}
              <span style={{ fontSize: 16, fontWeight: 700, color: t.heading }}>{MODE_LABELS[mode]}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: t.lavender,
                background: t.lavenderBg, padding: "3px 10px", borderRadius: 999, marginLeft: 2,
              }}>
                {selectedElement.type}
              </span>
            </div>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: t.textMuted }}>
              Attach code or notes to this shape
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="cs-close">✕</button>
          )}
        </div>

        {/* Toggle — only one of Code Snippet / Note is shown at a time */}
        <div className="cs-tab-group">
          {MODES.map((m) => {
            const hasContent = m === "code" ? !!savedSnippet : !!savedNote;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`cs-tab${mode === m ? " active" : ""}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                {MODE_LABELS[m]}
                {hasContent && (
                  <span
                    style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: mode === m ? t.lavender : t.inactiveDot,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {mode === "code" ? (
          <>
            {/* Language selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: t.textMuted }}>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="cs-select"
                style={selectStyle}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Code textarea */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: t.textMuted }}>Code</label>
                  {isCodeUnsaved && (
                    <span className="cs-unsaved-dot" title="Unsaved changes" style={{ width: 7, height: 7, borderRadius: "50%" }} />
                  )}
                </div>
                {savedSnippet && !isCodeUnsaved && (
                  <span className="cs-saved-pill" style={savedPillStyle}>✓ Saved</span>
                )}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste your code snippet here…"
                spellCheck={false}
                className="cs-textarea"
                style={codeTextareaStyle}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                <button
                  onClick={handleSaveCode}
                  disabled={!code.trim() || !isCodeUnsaved}
                  className="cs-btn-solid"
                  style={solidBtn}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <SaveIcon />
                    <span>Save</span>
                  </span>
                </button>
                <button onClick={handleClearCode} className="cs-btn-ghost" style={ghostBtn}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <TrashIcon />
                    <span>Clear</span>
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: t.textMuted }}>Notes</label>
                {isNoteUnsaved && (
                  <span className="cs-unsaved-dot" title="Unsaved changes" style={{ width: 7, height: 7, borderRadius: "50%" }} />
                )}
              </div>
              {savedNote && !isNoteUnsaved && (
                <span className="cs-saved-pill" style={savedPillStyle}>✓ Saved</span>
              )}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add quick notes or documentation context…"
              className="cs-textarea"
              style={notesTextareaStyle}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim() || !isNoteUnsaved}
                className="cs-btn-solid"
                style={solidBtn}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <SaveIcon />
                  <span>Save Note</span>
                </span>
              </button>
              <button onClick={handleClearNote} className="cs-btn-ghost" style={ghostBtn}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <TrashIcon />
                  <span>Clear</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CodeSidebar;
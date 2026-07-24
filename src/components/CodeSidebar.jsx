import { useState, useEffect, useRef, useCallback } from "react";
import { saveSnippet, deleteSnippet } from "../utils/boardStorage";

const LANGUAGES = ["python", "javascript", "java", "c++", "c", "sql"];

const SUPPORTED_TYPES = new Set([
  "rectangle", "ellipse", "diamond",
  "arrow", "line", "freedraw", "text",
]);

export function isSupportedElement(el) {
  return el && SUPPORTED_TYPES.has(el.type);
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 280;

function CodeSidebar({ boardId, selectedElement, snippets, onSnippetChange }) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  // All snippets for this element: { python: "...", javascript: "...", ... }
  // Falls back to empty object if element has no snippets yet
  const elementSnippets = selectedElement
    ? (snippets[selectedElement.id] || {})
    : {};

  // When selected element changes → reset to python, load its saved code
  useEffect(() => {
    if (!selectedElement) return;
    setLanguage("python");
    const saved = (snippets[selectedElement.id] || {});
    setCode(saved["python"] || "");
  }, [selectedElement?.id]);

  // When language tab switches → load that language's saved code for this element
  function handleLanguageChange(lang) {
    setLanguage(lang);
    setCode(elementSnippets[lang] || "");
  }

  if (!selectedElement || !isSupportedElement(selectedElement)) return null;

  function handleSave() {
    saveSnippet(boardId, selectedElement.id, language, code);
    onSnippetChange();
  }

  function handleClear() {
    setCode("");
    deleteSnippet(boardId, selectedElement.id, language);
    onSnippetChange();
  }

  // ── drag resize ───────────────────────────────────────────────────────────
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const delta = startX.current - e.clientX;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
    setWidth(newWidth);
  }, []);

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

  return (
    <div style={{ ...sidebarStyle, width }}>

      {/* Drag handle */}
      <div onMouseDown={onDragHandleMouseDown} style={dragHandleStyle} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#555" }}>
          Code Snippets
        </span>
        <span style={{ fontSize: 11, color: "#aaa" }}>{selectedElement.type}</span>
      </div>

      {/* Language tabs — one per language, dot indicator if code saved */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
        {LANGUAGES.map((lang) => {
          const isActive = lang === language;
          const hasSaved = !!(elementSnippets[lang]);
          return (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: isActive ? "1px solid #000" : "1px solid #ccc",
                background: isActive ? "#000" : "#fff",
                color: isActive ? "#fff" : "#333",
                fontSize: 11,
                cursor: "pointer",
                fontWeight: isActive ? 600 : 400,
                position: "relative",
              }}
            >
              {lang}
              {/* small dot if this language has saved code */}
              {hasSaved && (
                <span style={{
                  position: "absolute",
                  top: 3,
                  right: 3,
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: isActive ? "#fff" : "#000",
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Code textarea */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Write your ${language} snippet here…`}
        spellCheck={false}
        style={textareaStyle}
      />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} style={solidBtn}>Save</button>
        <button onClick={handleClear} style={ghostBtn}>Clear</button>
      </div>

      {elementSnippets[language] && (
        <p style={{ margin: "10px 0 0", fontSize: 11, color: "#aaa" }}>
          ✓ {language} snippet saved
        </p>
      )}
    </div>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const sidebarStyle = {
  flexShrink: 0,
  height: "100%",
  borderLeft: "1px solid #e0e0e0",
  background: "#fff",
  padding: 16,
  paddingLeft: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  overflowY: "auto",
  boxSizing: "border-box",
  fontFamily: "sans-serif",
  position: "relative",
};

const dragHandleStyle = {
  position: "absolute",
  left: 0,
  top: 0,
  width: 4,
  height: "100%",
  cursor: "ew-resize",
  background: "transparent",
  zIndex: 10,
};

const textareaStyle = {
  width: "100%",
  flex: 1,
  minHeight: 300,
  resize: "none",
  fontFamily: "monospace",
  fontSize: 12,
  lineHeight: 1.6,
  padding: 10,
  border: "1px solid #ccc",
  borderRadius: 4,
  boxSizing: "border-box",
  outline: "none",
  background: "#fafafa",
};

const solidBtn = {
  flex: 1, background: "#000", color: "#fff", border: "none",
  borderRadius: 4, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 500,
};

const ghostBtn = {
  flex: 1, background: "none", color: "#000", border: "1px solid #ccc",
  borderRadius: 4, padding: "7px 12px", cursor: "pointer", fontSize: 12,
};

export default CodeSidebar;
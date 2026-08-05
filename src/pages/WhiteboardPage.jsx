import { useEffect, useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import {
  loadBoard,
  saveBoard,
  renameBoard,
  listBoards,
  loadSnippets,
  loadLinks,
  loadNotes,
  loadFiles,
  loadChat,
} from "../utils/boardStorage";
import AIChatPanel from "../components/AIChatPanel";
import CodeSidebar, { isSupportedElement } from "../components/CodeSidebar";
import LinksSidebar from "../components/LinksSidebar";
import ShapeFileBox from "../components/ShapeFileBox";

const AUTOSAVE_DEBOUNCE = 1000;
const PANEL_DEFAULT_WIDTH = 320;

// ── Navbar theme tokens ──────────────────────────────────────────────────
const NAV_THEME = {
  light: {
    bar: "bg-[#F8F7FD] border-b border-[#DAD9F6] shadow-[0_1px_2px_rgba(105,101,219,0.08)]",
    boardsBtn:
      "text-[#4F4CA4] bg-[#F0F0FB] hover:bg-[#6965DB] hover:text-white hover:shadow-[0_6px_16px_rgba(105,101,219,0.35)]",
    divider: "bg-[#DAD9F6]",
    nameWrap: "hover:bg-[#F0F0FB]",
    nameText: "text-[#241F3D] group-hover/name:text-[#4F4CA4]",
    renameInput: "text-[#241F3D] border-[#6965DB] focus:shadow-[0_0_0_3px_rgba(105,101,219,0.18)]",
    pencilBtn: "text-[#8A85B8] hover:bg-white hover:text-[#6965DB] hover:shadow-[0_2px_6px_rgba(105,101,219,0.25)]",
    statusText: "text-[#7A7391]",
    statusWrap: "text-[#B7B0D1]",
  },
  dark: {
    bar: "bg-[#1B1A27] border-b border-[#2E2B40] shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
    boardsBtn:
      "text-[#B8B4F5] bg-[#26233A] hover:bg-[#6965DB] hover:text-white hover:shadow-[0_6px_16px_rgba(105,101,219,0.45)]",
    divider: "bg-[#332F4A]",
    nameWrap: "hover:bg-[#26233A]",
    nameText: "text-[#EDEBFB] group-hover/name:text-[#B8B4F5]",
    renameInput: "text-[#EDEBFB] bg-[#1B1A27] border-[#6965DB] focus:shadow-[0_0_0_3px_rgba(105,101,219,0.28)]",
    pencilBtn: "text-[#6C6790] hover:bg-[#332F4A] hover:text-[#B8B4F5] hover:shadow-[0_2px_6px_rgba(105,101,219,0.3)]",
    statusText: "text-[#8A85B8]",
    statusWrap: "text-[#5A5580]",
  },
};

// ── Sidebar tab-switcher theme tokens ────────────────────────────────────
const TAB_THEME = {
  light: { wrapBg: "#F0F0FB", wrapBorder: "#DAD9F6", activeBg: "#ffffff", activeColor: "#4F4CA4", inactiveColor: "#6B67A0", activeShadow: "0 1px 3px rgba(105,101,219,0.22)" },
  dark: { wrapBg: "#26233A", wrapBorder: "#332F4A", activeBg: "#1B1A27", activeColor: "#C9C6F5", inactiveColor: "#8A85B8", activeShadow: "0 1px 3px rgba(0,0,0,0.4)" },
};

const PANEL_COLUMN_BG = { light: "#ffffff", dark: "#14131C" };

function getPanelTabsStyle(t) {
  return { display: "flex", borderBottom: `1px solid ${t.wrapBorder}`, background: t.wrapBg, flexShrink: 0 };
}
const baseTabStyle = {
  flex: 1,
  padding: "10px 0",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  background: "none",
  letterSpacing: 0.2,
  transition: "all 0.18s ease",
};
function getActiveTabStyle(t) {
  return { ...baseTabStyle, color: t.activeColor, background: t.activeBg, boxShadow: t.activeShadow, borderRadius: "8px 8px 0 0" };
}
function getInactiveTabStyle(t) {
  return { ...baseTabStyle, color: t.inactiveColor, opacity: 0.85 };
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
function ArrowLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
function PencilIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function CodeIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function LinkIcon(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function WhiteboardPage() {
  document.title = "Excalidraw whiteboard";

  const { boardId } = useParams();
  const navigate = useNavigate();

  const excalidrawAPIRef = useRef(null);
  const saveTimerRef = useRef(null);
  const initialDataRef = useRef(null);

  const [boardName, setBoardName] = useState("Untitled board");
  const [isRenamingName, setIsRenamingName] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [selectedElement, setSelectedElement] = useState(null);
  const [snippets, setSnippets] = useState({});
  const [links, setLinks] = useState({});
  const [notes, setNotes] = useState({});
  const [files, setFiles] = useState({});
  const [activePanel, setActivePanel] = useState("code"); // "code" | "link"
  const [ready, setReady] = useState(false);
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT_WIDTH);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  // Live Excalidraw appState (scroll/zoom/offset) — needed to convert the
  // selected shape's scene coordinates into real screen pixels for
  // ShapeFileBox's floating position. Updated on every canvas change.
  const [liveAppState, setLiveAppState] = useState(null);

  // AI Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatElements, setChatElements] = useState(null); // snapshot sent to AI
  const [existingChat, setExistingChat] = useState(null); // null = new chat
  const [savedChatExists, setSavedChatExists] = useState(false);

  useEffect(() => {
    const data = loadBoard(boardId);
    if (!data) {
      navigate("/dashboard", { replace: true });
      return;
    }
    initialDataRef.current = {
      elements: data.elements,
      appState: { ...data.appState, collaborators: [] },
    };
    if (data.appState?.theme === "dark") setIsDarkTheme(true);
    const meta = listBoards().find((b) => b.id === boardId);
    if (meta) setBoardName(meta.name);
    setSnippets(loadSnippets(boardId));
    setLinks(loadLinks(boardId));
    setNotes(loadNotes(boardId));
    setFiles(loadFiles(boardId));
    setSavedChatExists(!!loadChat(boardId));
    setReady(true);
  }, [boardId, navigate]);

  function handleSnippetChange() {
    setSnippets(loadSnippets(boardId));
  }
  function refreshLinks() {
    setLinks(loadLinks(boardId));
  }
  function handleNoteChange() {
    setNotes(loadNotes(boardId));
  }
  function handleFilesChange() {
    setFiles(loadFiles(boardId));
  }

  const handleChange = useCallback(
    (elements, appState) => {
      setSaveStatus("saving");
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveBoard(boardId, elements, appState);
        setSaveStatus("saved");
      }, AUTOSAVE_DEBOUNCE);

      setIsDarkTheme(appState.theme === "dark");
      setLiveAppState(appState);

      const selectedIds = Object.keys(appState.selectedElementIds || {}).filter(
        (id) => appState.selectedElementIds[id]
      );
      if (selectedIds.length === 1) {
        const el = elements.find((e) => e.id === selectedIds[0]);
        setSelectedElement(isSupportedElement(el) ? el : null);
      } else {
        setSelectedElement(null);
      }
    },
    [boardId]
  );

  function startRename() {
    setRenameValue(boardName);
    setIsRenamingName(true);
  }
  function commitRename() {
    const trimmed = renameValue.trim() || "Untitled board";
    renameBoard(boardId, trimmed);
    setBoardName(trimmed);
    setIsRenamingName(false);
  }

  const nav = isDarkTheme ? NAV_THEME.dark : NAV_THEME.light;
  const tabTheme = isDarkTheme ? TAB_THEME.dark : TAB_THEME.light;
  const panelColumnBg = isDarkTheme ? PANEL_COLUMN_BG.dark : PANEL_COLUMN_BG.light;

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>

      {/* Top accent strip */}
      <div className="h-[3px] shrink-0 bg-[#6965DB]" />

      {/* Top bar */}
      <div className={`h-14 shrink-0 flex items-center gap-3 px-4 ${nav.bar} z-10 font-sans`}>
        <button
          onClick={() => navigate("/dashboard")}
          className={`inline-flex items-center gap-1.5 text-[14px] font-semibold ${nav.boardsBtn} rounded-lg pl-2.5 pr-3 py-1.5 transition-all duration-200 ease-out group hover:-translate-y-0.5 active:translate-y-0 active:shadow-none`}
        >
          <ArrowLeftIcon className="transition-transform duration-200 group-hover:-translate-x-1" />
          Boards
        </button>

        <div className={`w-px h-5 ${nav.divider}`} />

        <div className={`flex items-center gap-1.5 group/name min-w-0 -ml-1 pl-2.5 pr-1.5 py-1.5 rounded-lg ${nav.nameWrap} transition-all duration-200`}>
          {isRenamingName ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setIsRenamingName(false);
              }}
              className={`text-[14px] font-medium ${nav.renameInput} border rounded-lg px-2.5 py-1 outline-none min-w-[180px]`}
            />
          ) : (
            <span
              onDoubleClick={startRename}
              title="Double-click to rename"
              className={`text-[15px] font-semibold ${nav.nameText} cursor-text select-none truncate max-w-[280px] transition-colors duration-200`}
            >
              {boardName}
            </span>
          )}
          {!isRenamingName && (
            <button
              onClick={startRename}
              title="Rename board"
              className={`w-6 h-6 rounded-md flex items-center justify-center ${nav.pencilBtn} opacity-0 group-hover/name:opacity-100 transition-all duration-200 shrink-0`}
            >
              <PencilIcon />
            </button>
          )}
        </div>

        {/* Ask AI button */}
        <button
          onClick={() => {
            const api = excalidrawAPIRef.current;
            const elements = api ? api.getSceneElements() : [];
            setChatElements(elements);
            setExistingChat(null);
            setChatOpen(true);
          }}
          title="Analyse this diagram with AI"
          className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${nav.boardsBtn} rounded-lg px-3 py-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:shadow-none`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          Ask AI
        </button>

        {/* View Chat — only when a saved chat exists */}
        {savedChatExists && (
          <button
            onClick={() => {
              const saved = loadChat(boardId);
              setExistingChat(saved);
              setChatElements(null);
              setChatOpen(true);
            }}
            title="Open saved AI chat for this board"
            className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${nav.boardsBtn} rounded-lg px-3 py-1.5 transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:shadow-none`}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Chat
          </button>
        )}

        <div className={`ml-auto flex items-center gap-1.5 text-[13px] ${nav.statusWrap} shrink-0`}>
          <span className="relative flex h-1.5 w-1.5">
            {saveStatus === "saved" && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            )}
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                saveStatus === "saving" ? "bg-amber-400" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className={`font-medium ${nav.statusText}`}>
            {saveStatus === "saving" ? "Saving…" : "Saved"}
          </span>
        </div>
      </div>

      {/* Canvas + sidebar */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {ready && (
            <Excalidraw
              excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
              initialData={initialDataRef.current}
              onChange={handleChange}
            />
          )}
        </div>

        {selectedElement && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: panelWidth,
              flexShrink: 0,
              background: panelColumnBg,
            }}
          >
            {/* Tab-switcher bar */}
            <div style={{ ...getPanelTabsStyle(tabTheme), margin: "4px 10px 0 10px", padding: "0 12px", borderRadius: "12px 12px 0 0" }}>
              <button
                onClick={() => setActivePanel("code")}
                style={activePanel === "code" ? getActiveTabStyle(tabTheme) : getInactiveTabStyle(tabTheme)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <CodeIcon />
                  <span>Code</span>
                </span>
              </button>
              <button
                onClick={() => setActivePanel("link")}
                style={activePanel === "link" ? getActiveTabStyle(tabTheme) : getInactiveTabStyle(tabTheme)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <LinkIcon />
                  <span>Link</span>
                </span>
              </button>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
              {activePanel === "code" ? (
                <CodeSidebar
                  boardId={boardId}
                  selectedElement={selectedElement}
                  snippets={snippets}
                  onSnippetChange={handleSnippetChange}
                  notes={notes}
                  onNoteChange={handleNoteChange}
                  width={panelWidth}
                  onWidthChange={setPanelWidth}
                  dark={isDarkTheme}
                />
              ) : (
                <LinksSidebar
                  boardId={boardId}
                  selectedElement={selectedElement}
                  links={links}
                  onLinkChange={refreshLinks}
                  width={panelWidth}
                  onWidthChange={setPanelWidth}
                  dark={isDarkTheme}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Panel — full-screen overlay */}
      {chatOpen && (
        <AIChatPanel
          boardId={boardId}
          initialElements={chatElements}
          existingMessages={existingChat}
          dark={isDarkTheme}
          onClose={() => {
            setChatOpen(false);
            // Refresh "View Chat" button visibility
            setSavedChatExists(!!loadChat(boardId));
          }}
        />
      )}

      {/* Floating file-attachment box — tracks the selected shape's
          on-screen position; lives outside the sidebar column since it
          needs to sit directly over the canvas, above the shape itself. */}
      <ShapeFileBox
        boardId={boardId}
        selectedElement={selectedElement}
        appState={liveAppState}
        files={files}
        onFilesChange={handleFilesChange}
        dark={isDarkTheme}
      />
    </div>
  );
}

export default WhiteboardPage;
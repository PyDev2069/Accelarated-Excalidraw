import { useState, useRef, useEffect } from "react";
import { saveChat } from "../utils/boardStorage";

// Models
const ANALYSIS_MODEL = "qwen2.5:3b";
const FOLLOWUP_MODEL = "qwen2.5:0.5b";
const OLLAMA_URL = "http://localhost:11434/api/chat";

// ── Design tokens (mirrors themeAndIcons.jsx + CodeSidebar.jsx) ──────────────
const THEME = {
  light: {
    overlay:      "#F8F7FD",
    header:       "rgba(255,255,255,0.96)",
    headerBorder: "#DAD9F6",
    surface:      "#ffffff",
    inputBg:      "#FAF9FC",
    inputBorder:  "#DAD9F6",
    inputFocus:   "#6965DB",
    lavender:     "#6965DB",
    lavenderBg:   "#F0F0FB",
    lavenderBorder:"#DAD9F6",
    lavenderSoft: "#F8F7FD",
    heading:      "#241F3D",
    subheading:   "#4F4CA4",
    textMuted:    "#6B67A0",
    textBody:     "#3A375C",
    userBubbleBg: "#F0F0FB",
    userBubbleBorder:"#C9C6F5",
    aiBubbleBg:   "#ffffff",
    aiBubbleBorder:"#DAD9F6",
    aiBubbleShadow:"0 2px 8px rgba(105,101,219,0.08)",
    divider:      "#E8E6F6",
    toggleTrack:  "#DAD9F6",
    toggleActive: "#6965DB",
    toggleThumb:  "#ffffff",
    sendBtnBg:    "#6965DB",
    sendBtnHover: "#5552C0",
    sendBtnDisabled:"#C9C6F5",
    saveBtnBg:    "#F0F0FB",
    saveBtnColor: "#4F4CA4",
    closeBtnBg:   "#F0F0FB",
    closeBtnColor:"#4F4CA4",
    closeBtnHover:"#6965DB",
    shadow:       "0 8px 32px rgba(105,101,219,0.12), 0 1px 4px rgba(15,23,42,0.06)",
    scrollbarTrack:"#F0F0FB",
    scrollbarThumb:"#C9C6F5",
  },
  dark: {
    overlay:      "#14131C",
    header:       "rgba(27,26,39,0.97)",
    headerBorder: "#2E2B40",
    surface:      "#1B1A27",
    inputBg:      "#1B1926",
    inputBorder:  "#3A3655",
    inputFocus:   "#6965DB",
    lavender:     "#6965DB",
    lavenderBg:   "#26233A",
    lavenderBorder:"#3A3655",
    lavenderSoft: "rgba(105,101,219,0.12)",
    heading:      "#EDEBFB",
    subheading:   "#C9C6F5",
    textMuted:    "#8A85B8",
    textBody:     "#D0CCEE",
    userBubbleBg: "#26233A",
    userBubbleBorder:"#3A3655",
    aiBubbleBg:   "#1E1C2C",
    aiBubbleBorder:"#2E2B40",
    aiBubbleShadow:"0 2px 8px rgba(0,0,0,0.3)",
    divider:      "#2E2B40",
    toggleTrack:  "#3A3655",
    toggleActive: "#6965DB",
    toggleThumb:  "#ffffff",
    sendBtnBg:    "#6965DB",
    sendBtnHover: "#7D79E5",
    sendBtnDisabled:"#3A3655",
    saveBtnBg:    "#26233A",
    saveBtnColor: "#C9C6F5",
    closeBtnBg:   "#26233A",
    closeBtnColor:"#C9C6F5",
    closeBtnHover:"#6965DB",
    shadow:       "0 8px 32px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
    scrollbarTrack:"#1B1A27",
    scrollbarThumb:"#3A3655",
  },
};

// ── Output formatter ──────────────────────────────────────────────────────────
function cleanMarkdown(text) {
  const lines = text.split("\n");
  let insideCodeBlock = false;
  const out = [];
  for (let line of lines) {
    if (line.trimStart().startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      out.push(line);
      continue;
    }
    if (insideCodeBlock) { out.push(line); continue; }
    line = line.replace(/^#{1,6}\s+/, "");
    line = line.replace(/\*\*(.+?)\*\*/g, "$1");
    line = line.replace(/__(.+?)__/g, "$1");
    line = line.replace(/\*(.+?)\*/g, "$1");
    line = line.replace(/_(.+?)_/g, "$1");
    line = line.replace(/~~(.+?)~~/g, "$1");
    line = line.replace(/`([^`]+)`/g, "$1");
    line = line.replace(/^(\s*)[*\-•]\s+/, "$1– ");
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ── Prompt builders ───────────────────────────────────────────────────────────
function buildAnalysisPrompt(elements) {
  const json = JSON.stringify(elements, null, 2);
  return (
    `You are a software architect reviewing an Excalidraw diagram. ` +
    `Here is the full diagram JSON:\n\n${json}\n\n` +
    `Please:\n` +
    `1. Describe what this diagram represents.\n` +
    `2. Suggest concrete improvements to the design.\n` +
    `3. Recommend specific APIs, libraries, or patterns where relevant.\n` +
    `4. Point out any missing components or potential issues.\n` +
    `Be concise and actionable. Do not use markdown formatting like ** or ## in your response.`
  );
}

const CROSS_QUESTION_SYSTEM = {
  role: "system",
  content:
    "You are a concise software architect assistant. Answer follow-up questions " +
    "in plain text with no markdown formatting (no **, no ##, no bullet lists unless " +
    "absolutely necessary). Keep answers short — 3 to 6 sentences max. " +
    "Include at most ONE concrete example per answer. Do not pad with alternatives.",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}
function SaveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );
}
function ZapIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function AIChatPanel({ boardId, initialElements, onClose, existingMessages = null, dark = false }) {
  const t = dark ? THEME.dark : THEME.light;
  const [messages, setMessages] = useState(existingMessages || []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [crossQuestionMode, setCrossQuestionMode] = useState(false);
  const [saveDone, setSaveDone] = useState(!!existingMessages);
  const [streamingText, setStreamingText] = useState("");
  const [sendHover, setSendHover] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const analysisStarted = useRef(false);

  useEffect(() => {
    if (!existingMessages && initialElements && !analysisStarted.current) {
      analysisStarted.current = true;
      runInitialAnalysis(initialElements);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  async function runInitialAnalysis(elements) {
    await streamFromOllama([{ role: "user", content: buildAnalysisPrompt(elements) }], ANALYSIS_MODEL);
  }

  async function streamFromOllama(msgs, model) {
    setLoading(true);
    setStreamingText("");
    let rawReply = "";
    try {
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: msgs, stream: true }),
      });
      if (!res.ok) throw new Error(`Ollama returned ${res.status}: ${res.statusText}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(Boolean)) {
          try {
            const chunk = JSON.parse(line)?.message?.content || "";
            rawReply += chunk;
            setStreamingText(rawReply);
          } catch { /* non-JSON chunk */ }
        }
      }
    } catch (err) {
      rawReply = `Could not reach Ollama: ${err.message}\n\nMake sure Ollama is running and the model "${model}" is pulled.`;
    }
    setMessages((prev) => [...prev, { role: "assistant", content: cleanMarkdown(rawReply), model }]);
    setStreamingText("");
    setLoading(false);
    setSaveDone(false);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setSaveDone(false);
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const model = crossQuestionMode ? FOLLOWUP_MODEL : ANALYSIS_MODEL;
    let history = newMessages.map(({ role, content }) => ({ role, content }));
    if (crossQuestionMode) history = [CROSS_QUESTION_SYSTEM, ...history];
    await streamFromOllama(history, model);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleSaveChat() {
    saveChat(boardId, messages);
    setSaveDone(true);
  }

  const canSend = !loading && input.trim().length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: t.overlay,
      display: "flex", flexDirection: "column",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Top accent strip — matches the board's 3px lavender bar */}
      <div style={{ height: 3, background: "#6965DB", flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56, flexShrink: 0,
        background: t.header,
        borderBottom: `1px solid ${t.headerBorder}`,
        backdropFilter: "blur(12px)",
        gap: 12,
      }}>
        {/* Left — back button + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onClose}
            title="Go back to board"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px 6px 10px",
              background: t.lavenderBg, color: t.subheading,
              border: `1px solid ${t.lavenderBorder}`,
              borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
              transition: "all 0.18s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#6965DB"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#6965DB"; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.lavenderBg; e.currentTarget.style.color = t.subheading; e.currentTarget.style.borderColor = t.lavenderBorder; }}
          >
            <ArrowLeftIcon /> Board
          </button>

          <div style={{ width: 1, height: 20, background: t.divider }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: t.lavenderBg,
              border: `1px solid ${t.lavenderBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.lavender,
            }}>
              <SparkleIcon />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: t.heading, lineHeight: 1.2 }}>
                AI Analysis
              </div>
              <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1 }}>
                {crossQuestionMode ? "Cross-question · fast mode" : "Diagram review"}
              </div>
            </div>
          </div>
        </div>

        {/* Right — save */}
        <button
          onClick={handleSaveChat}
          disabled={messages.length === 0}
          title="Save this chat"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px",
            background: saveDone ? t.lavenderBg : t.saveBtnBg,
            color: saveDone ? t.lavender : t.saveBtnColor,
            border: `1px solid ${saveDone ? t.lavender : t.lavenderBorder}`,
            borderRadius: 8, cursor: messages.length === 0 ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 600, opacity: messages.length === 0 ? 0.4 : 1,
            transition: "all 0.18s ease",
          }}
        >
          <SaveIcon />
          {saveDone ? "Saved" : "Save chat"}
        </button>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "28px 0",
        display: "flex", flexDirection: "column", gap: 0,
      }}
        className="ai-scroll-area"
      >
        <style>{`
          .ai-scroll-area::-webkit-scrollbar { width: 6px; }
          .ai-scroll-area::-webkit-scrollbar-track { background: ${t.scrollbarTrack}; }
          .ai-scroll-area::-webkit-scrollbar-thumb { background: ${t.scrollbarThumb}; border-radius: 999px; }
          @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
          @keyframes fadeSlide { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* Empty / loading state */}
        {messages.length === 0 && !streamingText && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: "60px 24px",
            gap: 14, color: t.textMuted,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: t.lavenderBg, border: `1px solid ${t.lavenderBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.lavender,
            }}>
              <SparkleIcon />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: t.heading, marginBottom: 4 }}>
                {loading ? "Analysing your diagram…" : "Starting analysis"}
              </div>
              <div style={{ fontSize: 13, color: t.textMuted }}>
                {loading ? "This may take a few seconds" : ""}
              </div>
            </div>
            {loading && (
              <div style={{ display: "flex", gap: 5 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: t.lavender, opacity: 0.6,
                    animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 24px", maxWidth: 860, width: "100%", margin: "0 auto" }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} t={t} />
          ))}

          {/* Streaming bubble */}
          {streamingText && (
            <MessageBubble
              msg={{ role: "assistant", content: cleanMarkdown(streamingText) }}
              t={t}
              streaming
            />
          )}
        </div>

        <div ref={bottomRef} style={{ height: 8 }} />
      </div>

      {/* Input area */}
      <div style={{
        flexShrink: 0,
        background: t.header,
        borderTop: `1px solid ${t.headerBorder}`,
        padding: "12px 24px 16px",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* Textarea + send row */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 10,
            background: t.inputBg,
            border: `1.5px solid ${t.inputBorder}`,
            borderRadius: 12,
            padding: "10px 10px 10px 14px",
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
          }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = t.inputFocus; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(105,101,219,0.14)`; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = t.inputBorder; e.currentTarget.style.boxShadow = "none"; }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={crossQuestionMode ? "Quick follow-up…" : "Ask a follow-up question…"}
              disabled={loading}
              rows={1}
              style={{
                flex: 1, resize: "none", border: "none", outline: "none",
                background: "transparent", fontSize: 14, lineHeight: 1.55,
                color: t.textBody, fontFamily: "inherit",
                minHeight: 22, maxHeight: 120, overflow: "auto",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              onMouseEnter={() => setSendHover(true)}
              onMouseLeave={() => setSendHover(false)}
              style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                border: "none", cursor: canSend ? "pointer" : "not-allowed",
                background: canSend ? (sendHover ? t.sendBtnHover : t.sendBtnBg) : t.sendBtnDisabled,
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.18s ease, transform 0.12s ease",
                transform: canSend && sendHover ? "translateY(-1px)" : "none",
              }}
            >
              {loading ? (
                <div style={{
                  width: 14, height: 14, border: `2px solid rgba(255,255,255,0.4)`,
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
              ) : <SendIcon />}
            </button>
          </div>

          {/* Cross-question toggle row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 9, padding: "0 2px",
          }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer", userSelect: "none",
            }}>
              {/* Custom pill toggle */}
              <div
                onClick={() => setCrossQuestionMode(v => !v)}
                style={{
                  width: 36, height: 20, borderRadius: 999,
                  background: crossQuestionMode ? t.toggleActive : t.toggleTrack,
                  position: "relative", cursor: "pointer",
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: "absolute", top: 2,
                  left: crossQuestionMode ? 18 : 2,
                  width: 16, height: 16, borderRadius: "50%",
                  background: t.toggleThumb,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.2s ease",
                }} />
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.textMuted, fontWeight: 500 }}>
                <ZapIcon style={{ color: crossQuestionMode ? t.lavender : t.textMuted }} />
                <span style={{ color: crossQuestionMode ? t.subheading : t.textMuted }}>
                  Cross-question mode
                </span>
                {crossQuestionMode && (
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 999,
                    background: t.lavenderBg, color: t.lavender,
                    border: `1px solid ${t.lavenderBorder}`, fontWeight: 600,
                  }}>fast</span>
                )}
              </span>
            </label>
            <span style={{ fontSize: 11, color: t.textMuted }}>
              Enter to send · Shift+Enter for new line
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, t, streaming = false }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: isUser ? "flex-end" : "flex-start",
      padding: "6px 0",
      animation: "fadeSlide 0.18s ease",
    }}>
      <div style={{
        maxWidth: isUser ? "72%" : "88%",
        background: isUser ? t.userBubbleBg : t.aiBubbleBg,
        border: `1px solid ${isUser ? t.userBubbleBorder : t.aiBubbleBorder}`,
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        padding: "11px 15px",
        boxShadow: isUser ? "none" : t.aiBubbleShadow,
        opacity: streaming ? 0.85 : 1,
      }}>
        {/* Role chip */}
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.7,
          textTransform: "uppercase", marginBottom: 6,
          color: isUser ? t.subheading : t.textMuted,
        }}>
          {isUser ? "You" : "AI"}
        </div>
        <pre style={{
          margin: 0, fontSize: 14, lineHeight: 1.65,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: "inherit",
          color: t.textBody,
        }}>
          {msg.content}
          {streaming && (
            <span style={{
              display: "inline-block", width: 2, height: "1em",
              background: t.lavender, marginLeft: 2,
              verticalAlign: "text-bottom",
              animation: "blink 0.9s step-end infinite",
            }} />
          )}
        </pre>
      </div>
    </div>
  );
}

export default AIChatPanel;
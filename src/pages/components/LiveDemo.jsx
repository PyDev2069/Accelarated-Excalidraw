import { useState } from "react";

const demoTabs = [
  { key: "draw", label: "🖊️ Freeform Drawing" },
  { key: "upload", label: "📁 File Upload" },
  { key: "ai", label: "🤖 AI-Based Diagram" },
  { key: "code", label: "💻 Sample Code Upload" },
  { key: "links", label: "🔗 Links" },
  { key: "clutter", label: "✨ Clutter-Free" },
];

function LiveDemo() {
  const [activeDemo, setActiveDemo] = useState("draw");

  return (
    <section id="demo" className="py-14 px-6 max-w-5xl mx-auto bg-indigo/[0.04] border-t border-b border-dotgrid">
      <p className="reveal uppercase tracking-[0.12em] text-xs font-semibold text-orange text-center mb-2">
        see it live
      </p>
      <h2 className="reveal font-caveat font-bold text-3xl text-center mb-10">
        Six features, right on this page
      </h2>
      <div className="reveal flex justify-center gap-3 flex-wrap mb-8 max-w-3xl mx-auto">
        {demoTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveDemo(tab.key)}
            className={`rounded-full py-3 px-6 text-base font-semibold cursor-pointer transition-all duration-200 ease-in-out ${
              activeDemo === tab.key
                ? "bg-indigo text-paper border-2 border-ink shadow-[3px_3px_0_#1b1b1f] rotate-0 hover:-translate-y-0.5"
                : "bg-white text-muted border-2 border-ink hover:-translate-y-0.5 hover:-rotate-1 hover:shadow-[2px_3px_0_rgba(27,27,31,0.15)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="reveal relative bg-white border-2 border-ink rounded-2xl shadow-[6px_6px_0_rgba(27,27,31,0.1)] max-w-2xl mx-auto px-6 py-8 min-h-[260px] flex items-center justify-center overflow-hidden transition-shadow duration-300 hover:shadow-[8px_8px_0_rgba(232,115,74,0.15)]">
        {activeDemo === "draw" && (
          <div className="w-full text-center">
            <svg viewBox="0 0 300 160" className="w-full max-w-[420px] h-auto mx-auto" aria-hidden="true">
              <rect
                x="20" y="20" width="90" height="60" rx="6" fill="none" stroke="#6965db" strokeWidth="3"
                className="[stroke-dasharray:300] [stroke-dashoffset:0] animate-[draw-path_1.3s_ease_forwards]"
              />
              <circle
                cx="220" cy="50" r="35" fill="none" stroke="#e8734a" strokeWidth="3"
                style={{ strokeDasharray: 220, strokeDashoffset: 220 }}
                className="animate-[draw-path_1.3s_ease_forwards]"
              />
              <path
                d="M60 110 Q 150 150 240 110" fill="none" stroke="#1b1b1f" strokeWidth="2.5" strokeLinecap="round"
                className="[stroke-dasharray:300] [stroke-dashoffset:0] animate-[draw-path_1.3s_ease_forwards]"
              />
            </svg>
            <p className="mt-4 text-sm text-mutedlight">Hand-drawn shapes render smoothly as you sketch on the canvas.</p>
          </div>
        )}
        {activeDemo === "upload" && (
          <div className="w-full text-center">
            <svg viewBox="0 0 300 160" className="w-full max-w-[420px] h-auto mx-auto" aria-hidden="true">
              <rect x="40" y="70" width="220" height="70" rx="6" fill="none" stroke="#1b1b1f" strokeWidth="2" strokeDasharray="6 6" />
              <g className="animate-[drop-in_0.7s_ease_forwards]">
                <rect x="120" y="20" width="60" height="46" rx="4" fill="#fffdf7" stroke="#6965db" strokeWidth="2.5" />
                <path d="M132 32 h36 M132 42 h36 M132 52 h24" stroke="#6965db" strokeWidth="2" strokeLinecap="round" />
              </g>
              <text
                x="150" y="115" textAnchor="middle" fontFamily="Caveat" fontSize="22" fill="#4a9f5c"
                className="opacity-0 animate-[pulse-check_0.5s_ease_0.9s_forwards]"
              >
                added ✓
              </text>
            </svg>
            <p className="mt-4 text-sm text-mutedlight">Drop an image or file and it lands right where you release it.</p>
          </div>
        )}
        {activeDemo === "ai" && (
          <div className="w-full text-center">
            <svg viewBox="0 0 300 160" className="w-full max-w-[420px] h-auto mx-auto" aria-hidden="true">
              <rect x="15" y="20" width="70" height="45" rx="5" fill="none" stroke="#6965db" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_0.1s_forwards]" />
              <rect x="115" y="70" width="70" height="45" rx="5" fill="none" stroke="#e8734a" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_0.35s_forwards]" />
              <rect x="215" y="20" width="70" height="45" rx="5" fill="none" stroke="#1b1b1f" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_0.6s_forwards]" />
              <path d="M85 42 L115 85" stroke="#1b1b1f" strokeWidth="2" fill="none"
                className="[stroke-dasharray:6_6] opacity-0 animate-[pop-in_0.3s_ease_0.9s_forwards,marching-ants_1.2s_linear_1.1s_infinite]" />
              <path d="M185 92 L215 48" stroke="#1b1b1f" strokeWidth="2" fill="none"
                className="[stroke-dasharray:6_6] opacity-0 animate-[pop-in_0.3s_ease_0.9s_forwards,marching-ants_1.2s_linear_1.1s_infinite]" />
            </svg>
            <p className="mt-4 text-sm text-mutedlight">Make your software architecture diagram and our AI tells you what to improve</p>
          </div>
        )}
        {activeDemo === "code" && (
          <div className="w-full text-center">
            <svg viewBox="0 0 300 160" className="w-full max-w-[420px] h-auto mx-auto" aria-hidden="true">
              <rect x="20" y="25" width="100" height="110" rx="6" fill="#fffdf7" stroke="#1b1b1f" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_0.1s_forwards]" />
              <text x="34" y="50" fontFamily="monospace" fontSize="10" fill="#6965db"
                className="opacity-0 animate-[pop-in_0.3s_ease_0.4s_forwards]">function App() {"{"}</text>
              <text x="42" y="66" fontFamily="monospace" fontSize="10" fill="#4a4a55"
                className="opacity-0 animate-[pop-in_0.3s_ease_0.5s_forwards]">return (</text>
              <text x="50" y="82" fontFamily="monospace" fontSize="10" fill="#e8734a"
                className="opacity-0 animate-[pop-in_0.3s_ease_0.6s_forwards]">{"<div />"}</text>
              <text x="42" y="98" fontFamily="monospace" fontSize="10" fill="#4a4a55"
                className="opacity-0 animate-[pop-in_0.3s_ease_0.7s_forwards]">)</text>
              <text x="34" y="114" fontFamily="monospace" fontSize="10" fill="#6965db"
                className="opacity-0 animate-[pop-in_0.3s_ease_0.8s_forwards]">{"}"}</text>
              <path d="M130 80 L175 80" stroke="#1b1b1f" strokeWidth="2" fill="none" markerEnd="url(#codeArrow)"
                className="[stroke-dasharray:6_6] opacity-0 animate-[pop-in_0.3s_ease_1s_forwards,marching-ants_1.2s_linear_1.2s_infinite]" />
              <rect x="185" y="40" width="90" height="35" rx="5" fill="none" stroke="#6965db" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_1.2s_forwards]" />
              <rect x="185" y="90" width="90" height="35" rx="5" fill="none" stroke="#e8734a" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_1.4s_forwards]" />
              <defs>
                <marker id="codeArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#1b1b1f" />
                </marker>
              </defs>
            </svg>
            <p className="mt-4 text-sm text-mutedlight">Upload a code snippet or file and let AI turn its structure into a visual diagram.</p>
          </div>
        )}
        {activeDemo === "links" && (
          <div className="w-full text-center">
            <svg viewBox="0 0 300 160" className="w-full max-w-[420px] h-auto mx-auto" aria-hidden="true">
              <rect x="30" y="60" width="80" height="45" rx="6" fill="none" stroke="#6965db" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_0.1s_forwards]" />
              <rect x="190" y="60" width="80" height="45" rx="6" fill="none" stroke="#e8734a" strokeWidth="2.5"
                className="opacity-0 translate-y-2.5 animate-[pop-in_0.45s_ease_0.35s_forwards]" />
              <path d="M110 82 L190 82" stroke="#1b1b1f" strokeWidth="2.5" fill="none"
                className="[stroke-dasharray:200] [stroke-dashoffset:0] animate-[draw-path_0.8s_ease_0.6s_forwards]" />
              <g className="opacity-0 animate-[pop-in_0.4s_ease_1s_forwards]">
                <circle cx="150" cy="82" r="14" fill="#fffdf7" stroke="#1b1b1f" strokeWidth="2" />
                <path d="M145 82 a5 5 0 1 1 10 0 M150 77 v10" stroke="#1b1b1f" strokeWidth="1.6" fill="none" />
              </g>
              <text x="55" y="55" fontFamily="Caveat" fontSize="16" fill="#6965db"
                className="opacity-0 animate-[pop-in_0.3s_ease_1.3s_forwards]">shape A</text>
              <text x="205" y="55" fontFamily="Caveat" fontSize="16" fill="#e8734a"
                className="opacity-0 animate-[pop-in_0.3s_ease_1.3s_forwards]">shape B</text>
            </svg>
            <p className="mt-4 text-sm text-mutedlight">Keep urls of youtube videos, sample git repos or docs for future reference for each shape.</p>
          </div>
        )}
        {activeDemo === "clutter" && (
          <div className="w-full text-center">
            <svg viewBox="0 0 300 160" className="w-full max-w-[420px] h-auto mx-auto" aria-hidden="true">
              <rect x="20" y="15" width="260" height="20" rx="4" fill="none" stroke="#d9d6c6" strokeWidth="1.5" strokeDasharray="4 4"
                className="opacity-30" />
              <rect x="90" y="60" width="120" height="60" rx="8" fill="none" stroke="#1b1b1f" strokeWidth="3"
                className="opacity-0 animate-[pop-in_0.5s_ease_0.2s_forwards]" />
              <text x="115" y="95" fontFamily="Caveat" fontSize="20" fill="#6965db"
                className="opacity-0 animate-[pop-in_0.4s_ease_0.7s_forwards]">just your idea</text>
            </svg>
            <p className="mt-4 text-sm text-mutedlight">A distraction-free workspace that keeps tools out of the way so your sketch stays front and center.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default LiveDemo;

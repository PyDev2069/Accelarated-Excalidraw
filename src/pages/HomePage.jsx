import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const features = [
  { icon: "🖊️", title: "Freeform Whiteboard", desc: "The full Excalidraw drawing experience — shapes, arrows, freehand, text — right in your browser.", rotate: "-1.5deg" },
  { icon: "📁", title: "File & Image Uploads", desc: "Drop files and images straight onto the canvas and arrange them alongside your sketches.", rotate: "1deg" },
  { icon: "📤", title: "Export Anywhere", desc: "Export your board as PNG, SVG, or a portable .excalidraw file to share or reuse.", rotate: "0.75deg" },
  { icon: "🧠", title: "AI-Based Diagram Generation", desc: "Paste a description or a rough idea and AI turns it into a fully laid-out diagram in seconds.", rotate: "1.25deg" },
  { icon: "✨", title: "Clutter-Free Canvas", desc: "A distraction-free workspace that keeps tools out of the way so your sketch stays front and center.", rotate: "-0.5deg" },
  { icon: "💻", title: "Sample Code Upload", desc: "Upload a code snippet or file and let AI turn its structure into a visual diagram automatically.", rotate: "0.9deg" },
];

const techStack = ["React", "Vite", "Excalidraw", "React Router"];

const demoTabs = [
  { key: "draw", label: "🖊️ Freeform Drawing" },
  { key: "upload", label: "📁 File Upload" },
  { key: "ai", label: "🤖 AI-Based Diagram" },
  { key: "code", label: "💻 Sample Code Upload" },
  { key: "links", label: "🔗 Links" },
  { key: "clutter", label: "✨ Clutter-Free" },
];

// Tailwind hover tints for tech badges, cycled by index (nth-child equivalent)
const badgeHover = [
  "hover:bg-indigo hover:border-indigo",
  "hover:bg-orange hover:border-orange",
  "hover:bg-green hover:border-green",
];

function HomePage() {
  const [activeDemo, setActiveDemo] = useState("draw");
  const [isScrolled, setIsScrolled] = useState(false);
  const pageRef = useRef(null);
  const progressRef = useRef(null);

  // Scroll-reveal animation
  useEffect(() => {
    const els = pageRef.current.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Pencil-stroke scroll progress bar
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(Math.max(scrolled, 0), 1)})`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Subtle dot-grid parallax on mouse move
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      if (pageRef.current) {
        pageRef.current.style.backgroundPosition = `${x}px ${y}px`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Shrink the navbar once the page is scrolled
  useEffect(() => {
    const onNavScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onNavScroll);
    onNavScroll();
    return () => window.removeEventListener("scroll", onNavScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div
      ref={pageRef}
      className="overflow-x-hidden bg-paper text-ink font-sans bg-[radial-gradient(#e5e1d8_1.4px,transparent_1.4px)] bg-[length:22px_22px] transition-[background-position] duration-300 ease-out"
    >
      {/* SCROLL PROGRESS */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-30">
        <div
          ref={progressRef}
          className="h-full w-full origin-left scale-x-0 transition-transform duration-75 ease-linear shadow-[0_0_6px_rgba(105,101,219,0.5)]"
          style={{
            background:
              "repeating-linear-gradient(90deg, #6965db 0 14px, #e8734a 14px 20px)",
          }}
        />
      </div>

      {/* NAVBAR */}
      <nav
        className={`flex justify-between items-center sticky top-0 z-20 backdrop-blur-md bg-paper/85 border-b border-dotgrid animate-[float-up-fade_0.5s_ease_both] transition-[padding,box-shadow,background] duration-300 ease-in-out ${
          isScrolled
            ? "py-2.5 px-8 shadow-[0_2px_10px_rgba(27,27,31,0.08)] bg-paper/95"
            : "py-4.5 px-8"
        }`}
      >
        <span
          className={`font-caveat font-bold text-ink inline-block transition-all duration-300 ease-in-out hover:-rotate-2 hover:scale-105 ${
            isScrolled ? "text-xl" : "text-2xl"
          }`}
        >
          &#9998; Accelarated Excalidraw
        </span>
        <div className="flex items-center gap-7">
          <a href="#features" className="group relative inline-block text-sm font-medium text-muted transition-colors hover:text-ink hover:-translate-y-0.5">
            Features
            <span
              className="absolute left-0 -bottom-1.5 h-1.5 w-0 group-hover:w-full transition-[width] duration-300 ease-in-out bg-repeat-x"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='6' viewBox='0 0 24 6'%3E%3Cpath d='M0 3 Q 3 0 6 3 T 12 3 T 18 3 T 24 3' fill='none' stroke='%236965db' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundSize: "24px 6px",
              }}
            />
          </a>
          <a href="#demo" className="group relative inline-block text-sm font-medium text-muted transition-colors hover:text-ink hover:-translate-y-0.5">
            Live Demo
            <span
              className="absolute left-0 -bottom-1.5 h-1.5 w-0 group-hover:w-full transition-[width] duration-300 ease-in-out bg-repeat-x"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='6' viewBox='0 0 24 6'%3E%3Cpath d='M0 3 Q 3 0 6 3 T 12 3 T 18 3 T 24 3' fill='none' stroke='%236965db' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundSize: "24px 6px",
              }}
            />
          </a>
          <a
            href="https://github.com/PyDev2069/Accelarated-Excalidraw"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-block text-sm font-medium text-muted transition-colors hover:text-ink hover:-translate-y-0.5"
          >
            GitHub
            <span
              className="absolute left-0 -bottom-1.5 h-1.5 w-0 group-hover:w-full transition-[width] duration-300 ease-in-out bg-repeat-x"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='6' viewBox='0 0 24 6'%3E%3Cpath d='M0 3 Q 3 0 6 3 T 12 3 T 18 3 T 24 3' fill='none' stroke='%236965db' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\")",
                backgroundSize: "24px 6px",
              }}
            />
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 pt-20 pb-12 max-w-3xl mx-auto">
        <p className="reveal uppercase tracking-[0.12em] text-xs font-semibold text-indigo mb-3">
          an excalidraw-powered whiteboard
        </p>
        <h1 className="reveal font-caveat font-bold text-4xl sm:text-6xl leading-tight mb-5">
          Sketch ideas.
          <br />
          Let AI{" "}
          <span
            className="bg-no-repeat bg-[length:0%_100%] animate-[highlight-sweep_0.5s_ease_0.9s_forwards]"
            style={{ backgroundImage: "linear-gradient(180deg, transparent 62%, #ffd93d 62%)" }}
          >
            organize
          </span>{" "}
          them.
        </h1>
        <p className="reveal text-muted text-xl font-medium leading-snug tracking-tight max-w-lg mx-auto mb-8">
          Sketch freely, drop in code or files, and let AI turn it into a clean, clutter-free diagram — instantly.
        </p>
        <div className="reveal flex gap-4 justify-center flex-wrap mb-12">
          <Link
            to="/board"
            className="inline-block py-3 px-6 rounded-lg font-semibold bg-indigo text-paper border-2 border-ink shadow-[3px_3px_0_#1b1b1f] transition-all duration-150 ease-in-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1b1b1f] hover:bg-indigo-light hover:animate-[btn-wobble_0.5s_ease_1] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#1b1b1f]"
          >
            Open Whiteboard &rarr;
          </Link>
          <a
            href="https://github.com/PyDev2069/Accelarated-Excalidraw"
            target="_blank"
            rel="noreferrer"
            className="inline-block py-3 px-6 rounded-lg font-semibold bg-transparent text-ink border-2 border-ink transition-all duration-150 ease-in-out hover:bg-indigo/10 hover:-translate-y-0.5 hover:-rotate-1 hover:shadow-[3px_3px_0_rgba(27,27,31,0.15)] hover:border-indigo"
          >
            View on GitHub
          </a>
        </div>

        <div className="reveal relative bg-white border-2 border-ink rounded-xl shadow-[6px_6px_0_rgba(27,27,31,0.12)] max-w-2xl mx-auto px-4 pt-3.5 pb-6 animate-[bob-idle_5s_ease-in-out_1.4s_infinite] transition-shadow duration-300 hover:shadow-[9px_9px_0_rgba(105,101,219,0.18)] hover:[animation-play-state:paused]">
          <div className="flex gap-1.5 mb-2.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ff6b6b]" />
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#ffd93d]" />
            <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#6bcf7f]" />
          </div>
          <svg viewBox="0 0 600 220" className="w-full h-auto" aria-hidden="true">
            <rect
              x="30" y="30" width="130" height="70" rx="4" fill="none" stroke="#6965db" strokeWidth="2.5"
              className="[stroke-dasharray:420] [stroke-dashoffset:420] animate-[draw-path_1.4s_ease_0.9s_forwards]"
            />
            <text x="60" y="70" fontFamily="Inter" fontSize="13" fill="#4a4a55">Frontend</text>
            <rect
              x="240" y="30" width="130" height="70" rx="4" fill="none" stroke="#e8734a" strokeWidth="2.5"
              className="[stroke-dasharray:420] [stroke-dashoffset:420] animate-[draw-path_1.4s_ease_1.15s_forwards]"
            />
            <text x="270" y="70" fontFamily="Inter" fontSize="13" fill="#4a4a55">API</text>
            <rect
              x="450" y="30" width="120" height="70" rx="4" fill="none" stroke="#1b1b1f" strokeWidth="2.5"
              className="[stroke-dasharray:420] [stroke-dashoffset:420] animate-[draw-path_1.4s_ease_1.4s_forwards]"
            />
            <text x="475" y="70" fontFamily="Inter" fontSize="13" fill="#4a4a55">Database</text>
            <path
              d="M160 65 L240 65" stroke="#1b1b1f" strokeWidth="2" fill="none" markerEnd="url(#arrow)" strokeLinecap="round"
              className="[stroke-dasharray:80] [stroke-dashoffset:400] animate-[draw-path_1.6s_ease_1s_forwards]"
            />
            <path
              d="M370 65 L450 65" stroke="#1b1b1f" strokeWidth="2" fill="none" markerEnd="url(#arrow)" strokeLinecap="round"
              className="[stroke-dasharray:80] [stroke-dashoffset:400] animate-[draw-path_1.6s_ease_1s_forwards]"
            />
            <path
              d="M60 130 Q 300 190 540 130" stroke="#6965db" strokeWidth="2" fill="none" strokeLinecap="round"
              className="[stroke-dasharray:400] [stroke-dashoffset:400] animate-[draw-path_1.6s_ease_1s_forwards]"
            />
            <text
              x="250" y="205" fontFamily="Caveat" fontSize="18" fill="#6965db"
              className="opacity-0 animate-[pop-in_0.4s_ease_2.4s_forwards]"
            >
              "AI, arrange this."
            </text>
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#1b1b1f" />
              </marker>
            </defs>
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="reveal reveal-stagger flex justify-center items-center gap-10 py-9 px-6 flex-wrap">
        <div className="group flex flex-col items-center gap-0.5 cursor-default">
          <span className="font-caveat font-bold text-3xl text-indigo inline-block transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110 group-hover:-rotate-3 group-hover:text-orange">
            0 setup
          </span>
          <span className="text-sm text-mutedlight">clone &amp; npm run dev</span>
        </div>
        <div className="w-px h-8 bg-dotgrid" />
        <div className="group flex flex-col items-center gap-0.5 cursor-default">
          <span className="font-caveat font-bold text-3xl text-indigo inline-block transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110 group-hover:-rotate-3 group-hover:text-orange">
            &infin;
          </span>
          <span className="text-sm text-mutedlight">canvas, no page limits</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-14 px-6 max-w-5xl mx-auto">
        <p className="reveal uppercase tracking-[0.12em] text-xs font-semibold text-orange text-center mb-2">
          what's inside
        </p>
        <h2 className="reveal font-caveat font-bold text-3xl text-center mb-10">
          Everything a whiteboard needs — and one it didn't have
        </h2>
        <div className="reveal reveal-stagger grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-7">
          {features.map((f) => (
            <div
              key={f.title}
              style={{ "--r": f.rotate }}
              className="group relative bg-white border-2 border-ink rounded-xl p-6 shadow-[3px_4px_0_rgba(27,27,31,0.1)] rotate-[var(--r)] transition-all duration-200 ease-[cubic-bezier(.34,1.4,.64,1)] hover:rotate-0 hover:-translate-y-1.5 hover:scale-[1.025] hover:shadow-[6px_8px_0_rgba(105,101,219,0.18)] hover:border-indigo before:content-[''] before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:w-11 before:h-[18px] before:bg-yellow/85 before:shadow-sm before:opacity-0 before:-rotate-[10deg] before:scale-[0.4] group-hover:before:opacity-100 group-hover:before:animate-[tape-in_0.35s_ease_forwards]"
            >
              <div className="text-2xl mb-2.5 inline-block group-hover:animate-[wiggle_0.4s_ease]">
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-bold">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE DEMO */}
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
              <p className="mt-4 text-sm text-mutedlight">Describe a system and AI lays the pieces out for you automatically.</p>
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
              <p className="mt-4 text-sm text-mutedlight">Connect shapes with links so relationships stay clear as your board grows.</p>
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

      {/* TECH STACK */}
      <section className="text-center py-10 px-6">
        <p className="reveal text-xs uppercase tracking-[0.12em] text-mutedlight mb-4">built with</p>
        <div className="reveal reveal-stagger flex justify-center flex-wrap gap-2.5">
          {techStack.map((t, i) => (
            <span
              key={t}
              className={`rounded-full border-[1.5px] border-ink py-1.5 px-3.5 text-sm font-semibold bg-white transition-all duration-200 ease-[cubic-bezier(.34,1.4,.64,1)] hover:-translate-y-0.5 hover:-rotate-2 hover:scale-105 hover:text-paper ${badgeHover[i % 3]}`}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="reveal text-center py-16 px-6 pb-18">
        <h2 className="font-caveat font-bold text-3xl mb-5">Your canvas is waiting.</h2>
        <Link
          to="/board"
          className="inline-block py-3 px-6 rounded-lg font-semibold bg-indigo text-paper border-2 border-ink shadow-[3px_3px_0_#1b1b1f] transition-all duration-150 ease-in-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1b1b1f] hover:bg-indigo-light hover:animate-[btn-wobble_0.5s_ease_1] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#1b1b1f]"
        >
          Open Whiteboard &rarr;
        </Link>
      </section>

      {/* BIG FOOTER */}
      <footer className="bg-ink text-[#d8d6e8] bg-[radial-gradient(rgba(255,255,255,0.05)_1.2px,transparent_1.2px)] bg-[length:20px_20px]">
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-10">
          <div>
            <span className="font-caveat font-bold text-2xl text-paper">&#9998; Accelarated Excalidraw</span>
            <p className="text-[#a8a6bd] text-sm leading-relaxed my-3.5 max-w-[300px]">
              An Excalidraw-powered whiteboard with AI-organized diagrams. Open source, self-hostable, built for sketching systems fast.
            </p>
            <div className="flex gap-2.5">
              <a
                href="https://github.com/PyDev2069/Accelarated-Excalidraw"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-full border-[1.5px] border-[#3a3a44] flex items-center justify-center text-base transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-indigo"
              >
                🐙
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full border-[1.5px] border-[#3a3a44] flex items-center justify-center text-base transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-indigo">
                🐦
              </a>
              <a href="mailto:hello@example.com" aria-label="Email" className="w-9 h-9 rounded-full border-[1.5px] border-[#3a3a44] flex items-center justify-center text-base transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-indigo">
                ✉️
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-paper text-sm mb-4 tracking-wide">Product</h4>
            <a href="#features" className="block text-[#a8a6bd] text-sm mb-2.5 transition-all duration-150 ease-in-out hover:text-paper hover:translate-x-1">Features</a>
            <a href="#demo" className="block text-[#a8a6bd] text-sm mb-2.5 transition-all duration-150 ease-in-out hover:text-paper hover:translate-x-1">Live Demo</a>
          </div>
          <div>
            <h4 className="text-paper text-sm mb-4 tracking-wide">Resources</h4>
            <a href="https://github.com/PyDev2069/Accelarated-Excalidraw" target="_blank" rel="noreferrer" className="block text-[#a8a6bd] text-sm mb-2.5 transition-all duration-150 ease-in-out hover:text-paper hover:translate-x-1">GitHub Repo</a>
            <a href="https://github.com/PyDev2069/Accelarated-Excalidraw/issues" target="_blank" rel="noreferrer" className="block text-[#a8a6bd] text-sm mb-2.5 transition-all duration-150 ease-in-out hover:text-paper hover:translate-x-1">Report an Issue</a>
            <a href="https://github.com/PyDev2069/Accelarated-Excalidraw/releases" target="_blank" rel="noreferrer" className="block text-[#a8a6bd] text-sm mb-2.5 transition-all duration-150 ease-in-out hover:text-paper hover:translate-x-1">Releases</a>
          </div>
        </div>
        <div className="border-t border-[#33333c] max-w-5xl mx-auto py-5 px-6 flex justify-between items-center flex-wrap gap-3 text-sm text-[#7d7b90]">
          <span>&copy; 2026 abc — built with React, Vite &amp; Excalidraw.</span>
          <button
            onClick={scrollToTop}
            className="bg-transparent border-[1.5px] border-[#3a3a44] text-[#d8d6e8] rounded-full py-1.5 px-3.5 text-sm cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-indigo"
          >
            &uarr; Back to top
          </button>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

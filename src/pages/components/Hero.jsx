import { Link } from "react-router-dom";

function Hero() {
  return (
    <>
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
            to="/dashboard"
            className="inline-block py-3 px-6 rounded-lg font-semibold bg-indigo text-paper border-2 border-ink shadow-[3px_3px_0_#1b1b1f] transition-all duration-150 ease-in-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1b1b1f] hover:bg-indigo-light hover:animate-[btn-wobble_0.5s_ease_1] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_#1b1b1f]"
          >
            Open Dashboard &rarr;
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
    </>
  );
}

export default Hero;

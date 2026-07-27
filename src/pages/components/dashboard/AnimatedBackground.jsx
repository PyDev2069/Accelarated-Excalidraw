// ── Premium animated whiteboard-dashboard background ──────────────────────
// Pure CSS transforms/opacity only (no canvas, no Framer Motion dependency)
// so it stays smooth at 60fps. Mount ONE instance near the root of the app
// (e.g. in App.jsx, above your routed pages) — it's `fixed`, full-viewport,
// `pointer-events-none`, and sits at `z-index: -1`, so it never blocks
// clicks or interferes with readability.
//
//   import AnimatedBackground from "./components/AnimatedBackground";
//   ...
//   <AnimatedBackground />
//   <YourRoutes />

// Small deterministic PRNG (mulberry32) so the "random" layout is stable
// across re-renders/hot-reloads instead of reshuffling every render.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(7321);
const between = (min, max) => min + rand() * (max - min);

// Excalidraw-style multi-color palette (light-mode tint / dark-mode tint)
const PALETTE = [
  { light: "#8b7cf6", dark: "#a78bfa" }, // indigo
  { light: "#34d399", dark: "#6ee7b7" }, // green
  { light: "#fb923c", dark: "#fdba74" }, // orange
  { light: "#f472b6", dark: "#f9a8d4" }, // pink
  { light: "#60a5fa", dark: "#93c5fd" }, // blue
  { light: "#fbbf24", dark: "#fde047" }, // yellow
];

// ── Drifting particles ────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 32 }).map((_, i) => ({
  id: i,
  top: between(2, 96),
  left: between(2, 96),
  size: between(1.5, 3.2),
  dx: between(-40, 40),
  dy: between(-30, 30),
  dur: between(22, 46),
  delay: between(-30, 0),
  opacityLight: between(0.26, 0.4),
  opacityDark: between(0.14, 0.22),
  color: PALETTE[i % PALETTE.length],
}));

// ── Floating hand-drawn doodle elements ───────────────────────────────────
const SHAPE_TYPES = [
  "sketchRect",
  "sketchCircle",
  "triangle",
  "diamond",
  "arrow",
  "connector",
  "stickyNote",
  "textBox",
  "flowchartDecision",
  "wireframeBox",
  "doodleLine",
  "connectorCurved",
  "star",
  "cursor",
  "exclamation",
  "spiral",
];

const SHAPES = SHAPE_TYPES.map((type, i) => ({
  id: i,
  type,
  top: between(4, 88),
  left: between(3, 90),
  size: between(40, 82),
  rotate: between(-14, 14),
  rotateDrift: between(4, 10),
  floatY: between(14, 26),
  dur: between(11, 19),
  fadeDur: between(9, 16),
  delay: between(-12, 0),
  opacityLight: between(0.4, 0.58),
  opacityDark: between(0.22, 0.34),
  color: PALETTE[i % PALETTE.length],
}));

// ── Sketchy SVG line art, kept intentionally imperfect (hand-drawn feel) ─
function ShapeSvg({ type }) {
  const common = {
    viewBox: "0 0 100 100",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (type) {
    case "sketchRect":
      return (
        <svg {...common}>
          <path d="M12,14 L86,10 L90,82 L8,88 Z" />
        </svg>
      );
    case "sketchCircle":
      return (
        <svg {...common}>
          <path d="M50,10 C74,10 90,28 88,52 C86,76 66,90 42,88 C20,86 8,68 10,44 C12,22 28,10 50,10 Z" />
        </svg>
      );
    case "triangle":
      return (
        <svg {...common}>
          <path d="M50,10 L90,86 L10,84 Z" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common}>
          <path d="M50,8 L92,50 L50,92 L8,50 Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common}>
          <path d="M8,50 L82,48" />
          <path d="M62,28 L86,48 L62,70" />
        </svg>
      );
    case "connector":
      return (
        <svg {...common}>
          <path d="M8,80 C30,20 70,90 92,20" strokeDasharray="5 9" />
        </svg>
      );
    case "connectorCurved":
      return (
        <svg {...common}>
          <path d="M10,22 C40,10 58,82 90,68" />
          <path d="M76,56 L90,68 L74,76" />
        </svg>
      );
    case "stickyNote":
      return (
        <svg {...common}>
          <path d="M14,14 L64,14 L78,28 L78,86 L14,86 Z" />
          <path d="M64,14 L64,28 L78,28" />
          <line x1="24" y1="40" x2="68" y2="40" />
          <line x1="24" y1="54" x2="68" y2="54" />
          <line x1="24" y1="68" x2="52" y2="68" />
        </svg>
      );
    case "textBox":
      return (
        <svg {...common}>
          <rect x="10" y="20" width="80" height="60" rx="3" />
          <line x1="20" y1="36" x2="80" y2="36" />
          <line x1="20" y1="50" x2="70" y2="50" />
          <line x1="20" y1="64" x2="58" y2="64" />
        </svg>
      );
    case "flowchartDecision":
      return (
        <svg {...common}>
          <path d="M50,10 L90,50 L50,90 L10,50 Z" />
          <line x1="50" y1="0" x2="50" y2="10" />
          <line x1="50" y1="90" x2="50" y2="100" />
          <line x1="0" y1="50" x2="10" y2="50" />
          <line x1="90" y1="50" x2="100" y2="50" />
        </svg>
      );
    case "wireframeBox":
      return (
        <svg {...common}>
          <rect x="10" y="10" width="80" height="80" rx="2" />
          <line x1="10" y1="10" x2="90" y2="90" />
          <line x1="90" y1="10" x2="10" y2="90" />
        </svg>
      );
    case "doodleLine":
      return (
        <svg {...common}>
          <path d="M4,52 Q19,22 34,52 T64,52 T96,48" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M50,6 L61,38 L95,38 L67,58 L78,90 L50,70 L22,90 L33,58 L5,38 L39,38 Z" />
        </svg>
      );
    case "cursor":
      return (
        <svg {...common}>
          <path d="M20,10 L20,80 L38,64 L50,90 L62,84 L50,58 L74,58 Z" />
        </svg>
      );
    case "exclamation":
      return (
        <svg {...common}>
          <line x1="50" y1="10" x2="46" y2="62" />
          <circle cx="47" cy="82" r="3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "spiral":
      return (
        <svg {...common}>
          <path d="M50,50 m0,-6 a6,6 0 1,1 -6,6 a14,14 0 1,0 14,-14 a24,24 0 1,1 -24,24 a34,34 0 1,0 34,-34" />
        </svg>
      );
    default:
      return null;
  }
}

function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden bg-white dark:bg-[#14171F] pointer-events-none select-none transition-colors duration-300"
    >
      {/* Ultra-light blueprint grid */}
      <div className="absolute inset-0 bg-grid" />

      {/* Soft gray/blue gradient wash */}
      <div className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full blob blob-a" />
      <div className="absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full blob blob-b" />
      <div className="absolute top-1/3 left-1/2 w-[50vw] h-[50vw] rounded-full blob blob-c" />

      {/* Drifting particles */}
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="particle absolute rounded-full"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: "var(--op)",
            "--op": p.opacityLight,
            "--op-dark": p.opacityDark,
            backgroundColor: "var(--pc)",
            "--pc": p.color.light,
            "--pc-dark": p.color.dark,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Floating hand-drawn whiteboard doodles */}
      {SHAPES.map((s) => (
        <div
          key={s.id}
          className="shape-float absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            color: "var(--sc)",
            opacity: "var(--op)",
            "--op": s.opacityLight,
            "--op-dark": s.opacityDark,
            "--sc": s.color.light,
            "--sc-dark": s.color.dark,
            "--rot-a": `${s.rotate}deg`,
            "--rot-b": `${s.rotate + s.rotateDrift}deg`,
            "--float-y": `${s.floatY}px`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <div
            className="shape-fade w-full h-full"
            style={{ animationDuration: `${s.fadeDur}s`, animationDelay: `${s.delay}s` }}
          >
            <ShapeSvg type={s.type} />
          </div>
        </div>
      ))}

      <style>{`
        .bg-grid {
          background-image:
            linear-gradient(to right, rgba(15, 23, 42, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.025) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .dark .bg-grid {
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        }

        .dark .particle {
          background-color: var(--pc-dark) !important;
          opacity: var(--op-dark) !important;
        }
        .dark .shape-float {
          color: var(--sc-dark) !important;
          opacity: var(--op-dark) !important;
        }

        .blob {
          filter: blur(70px);
          will-change: transform;
        }
        .blob-a {
          background: radial-gradient(circle at 30% 30%, rgba(147, 197, 253, 0.10), rgba(147, 197, 253, 0) 70%);
          animation: blobDriftA 70s ease-in-out infinite alternate;
        }
        .blob-b {
          background: radial-gradient(circle at 70% 70%, rgba(148, 163, 184, 0.10), rgba(148, 163, 184, 0) 70%);
          animation: blobDriftB 85s ease-in-out infinite alternate;
        }
        .blob-c {
          background: radial-gradient(circle at 50% 50%, rgba(199, 210, 254, 0.08), rgba(199, 210, 254, 0) 70%);
          animation: blobDriftC 95s ease-in-out infinite alternate;
        }
        @keyframes blobDriftA {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(4%, 6%) scale(1.08); }
        }
        @keyframes blobDriftB {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-5%, -4%) scale(1.06); }
        }
        @keyframes blobDriftC {
          0%   { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-46%, -54%) scale(1.1); }
        }

        .particle {
          animation-name: particleDrift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
        @keyframes particleDrift {
          0%   { transform: translate(0, 0); }
          50%  { transform: translate(var(--dx), var(--dy)); }
          100% { transform: translate(0, 0); }
        }

        .shape-float {
          animation-name: shapeFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        @keyframes shapeFloat {
          0%, 100% { transform: translateY(0) rotate(var(--rot-a)); }
          50%      { transform: translateY(calc(-1 * var(--float-y))) rotate(var(--rot-b)); }
        }

        .shape-fade {
          animation-name: shapeFade;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: opacity;
        }
        @keyframes shapeFade {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .blob-a, .blob-b, .blob-c, .particle, .shape-float, .shape-fade {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AnimatedBackground;

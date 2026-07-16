const features = [
  { icon: "🖊️", title: "Freeform Whiteboard", desc: "The full Excalidraw drawing experience — shapes, arrows, freehand, text — right in your browser.", rotate: "-1.5deg" },
  { icon: "📁", title: "File & Image Uploads", desc: "Drop files and images straight onto the canvas and arrange them alongside your sketches.", rotate: "1deg" },
  { icon: "📤", title: "Export Anywhere", desc: "Export your board as PNG, SVG, or a portable .excalidraw file to share or reuse.", rotate: "0.75deg" },
  { icon: "🧠", title: "AI-Based Diagram Generation", desc: "Make your software architecture diagram and our AI tells you what to improve", rotate: "1.25deg" },
  { icon: "✨", title: "Clutter-Free Canvas", desc: "A distraction-free workspace that keeps tools out of the way so your sketch stays front and center.", rotate: "-0.5deg" },
  { icon: "💻", title: "Sample Code Upload", desc: "Upload a code snippet or file and let AI turn its structure into a visual diagram automatically.", rotate: "0.9deg" },
];

function Features() {
  return (
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
  );
}

export default Features;

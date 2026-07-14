import { Link } from "react-router-dom";

const techStack = ["React", "Vite", "Excalidraw", "React Router"];

// Tailwind hover tints for tech badges, cycled by index (nth-child equivalent)
const badgeHover = [
  "hover:bg-indigo hover:border-indigo",
  "hover:bg-orange hover:border-orange",
  "hover:bg-green hover:border-green",
];

function TechStack() {
  return (
    <>
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
    </>
  );
}

export default TechStack;

import { useEffect, useState } from "react";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Shrink the navbar once the page is scrolled
  useEffect(() => {
    const onNavScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onNavScroll);
    onNavScroll();
    return () => window.removeEventListener("scroll", onNavScroll);
  }, []);

  return (
    <nav
      className={`flex justify-between items-center sticky top-0 z-20 backdrop-blur-md border-b border-dotgrid animate-[float-up-fade_0.5s_ease_both] transition-[padding,box-shadow,background] duration-300 ease-in-out w-full bg-paper/85 ${
        isScrolled
          ? "py-3 px-10 lg:px-16 shadow-[0_2px_10px_rgba(27,27,31,0.08)] bg-paper/95"
          : "py-5 px-10 lg:px-16"
      }`}
    >
      <span
        className={`font-caveat font-bold text-ink inline-block transition-all duration-300 ease-in-out hover:-rotate-2 hover:scale-105 ${
          isScrolled ? "text-2xl" : "text-3xl"
        }`}
      >
        &#9998; Accelerated Excalidraw
      </span>
      <div className="flex items-center gap-9">
        <a href="#features" className="group relative inline-block text-[15px] font-medium text-muted transition-colors hover:text-ink hover:-translate-y-0.5">
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
        <a href="#demo" className="group relative inline-block text-[15px] font-medium text-muted transition-colors hover:text-ink hover:-translate-y-0.5">
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
          className="group relative inline-block text-[15px] font-medium text-muted transition-colors hover:text-ink hover:-translate-y-0.5"
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
  );
}

export default Navbar;

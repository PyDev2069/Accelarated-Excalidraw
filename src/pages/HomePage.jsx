import { useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import LiveDemo from "./components/LiveDemo";
import TechStack from "./components/TechStack";
import Footer from "./components/Footer";

function HomePage() {
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

      <Navbar />
      <Hero />
      <Features />
      <LiveDemo />
      <TechStack />
      <Footer />
    </div>
  );
}

export default HomePage;



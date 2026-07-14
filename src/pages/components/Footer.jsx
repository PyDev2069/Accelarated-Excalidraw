function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-ink text-[#d8d6e8] bg-[radial-gradient(rgba(255,255,255,0.05)_1.2px,transparent_1.2px)] bg-[length:20px_20px]">
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] gap-10">
        <div>
          <span className="font-caveat font-bold text-2xl text-paper">&#9998; Accelerated Excalidraw</span>
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
        </div>
      </div>
      <div className="border-t border-[#33333c] max-w-5xl mx-auto py-5 px-6 flex justify-between items-center flex-wrap gap-3 text-sm text-[#7d7b90]">
        <span>@ 2026 Made by Rounak Chakraborti and Shreya Adhikary</span>
        <button
          onClick={scrollToTop}
          className="bg-transparent border-[1.5px] border-[#3a3a44] text-[#d8d6e8] rounded-full py-1.5 px-3.5 text-sm cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-0.5 hover:border-indigo"
        >
          &uarr; Back to top
        </button>
      </div>
    </footer>
  );
}

export default Footer;

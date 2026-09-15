import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

export function Sidebar({ activeKey, onSelect, algorithms, isOpen, onToggle }) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const activeAlgorithm = algorithms[activeKey];
  const activeCategory = activeAlgorithm.category;

  const categories = ['Sorting', 'Pathfinding', 'Graph', 'Backtracking'];
  
  // Get all algorithms that belong to the currently active category
  const filteredAlgoKeys = Object.keys(algorithms).filter(
    key => algorithms[key].category === activeCategory
  );

  return (
    <div className="sidebar" style={{ 
      width: isOpen ? '280px' : '60px', 
      padding: isOpen ? '2rem 1rem 2rem 2rem' : '1rem 0.5rem', 
      transition: 'width 0.2s ease', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* FIXED HEADER: Logo and Toggle side-by-side */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: isOpen ? 'space-between' : 'center', 
        marginBottom: '1rem',
        paddingRight: isOpen ? '1rem' : '0'
      }}>
        {isOpen && (
          <div className="logo-container" style={{ margin: 0 }}>
            <div className="logo-icon"></div>
            <div>
              <h1 style={{ margin: 0, lineHeight: 1 }}>specimen</h1>
              <span className="mono-text" style={{ color: '#aaa' }}>A LIL ALGORITHM LAB</span>
            </div>
          </div>
        )}
        <button 
          onClick={onToggle}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer', 
            padding: '4px', display: 'flex', alignItems: 'center'
          }}
        >
          {isOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        paddingRight: isOpen ? '1rem' : '0'
      }}>
        {isOpen && (
          <>
            <div className="sidebar-separator" style={{ margin: '0 0 2rem 0' }}></div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 className="sidebar-title">what are we looking at?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {categories.map((cat) => (
                  <div 
                    key={cat} 
                    className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      const firstInCat = Object.keys(algorithms).find(k => algorithms[k].category === cat);
                      if (firstInCat) onSelect(firstInCat);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="sidebar-title">pick a specimen</h3>
              <div className="specimen-list">
                 {filteredAlgoKeys.map(key => {
                   const algo = algorithms[key];
                   const isActive = activeKey === key;
                   
                   let color = 'var(--accent-yellow)';
                   if (isActive) color = 'var(--accent-pink)';
                   else if (key === 'mergeSort' || key === 'bfs') color = 'var(--accent-blue)';

                   return (
                     <div 
                       key={key} 
                       className={`specimen-item ${isActive ? 'active' : ''}`}
                       onClick={() => onSelect(key)}
                     >
                       <div className="specimen-dot" style={{ backgroundColor: color }}></div>
                       <span style={{ color: isActive ? 'black' : '#555' }}>{algo.name}</span>
                     </div>
                   );
                 })}
              </div>
            </div>

            <div className="sidebar-separator" style={{ marginTop: '2rem' }}></div>
            
            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <span className="sidebar-link pink" onClick={() => setIsAboutOpen(true)} style={{ cursor: 'pointer' }}>why I built this ?</span>
              <p>made over one very caffeinated week. click around, break stuff - it resets on refresh :)</p>
            </div>
          </>
        )}

        {/* When collapsed, just show category initials or icons vertically */}
        {!isOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            {categories.map(cat => (
              <div 
                key={cat}
                title={cat}
                style={{
                  width: '40px', height: '40px', 
                  backgroundColor: activeCategory === cat ? 'black' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'black',
                  border: activeCategory === cat ? 'none' : '2px solid black',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontWeight: 'bold', cursor: 'pointer', fontFamily: 'monospace'
                }}
                onClick={() => {
                  const firstInCat = Object.keys(algorithms).find(k => algorithms[k].category === cat);
                  if (firstInCat) onSelect(firstInCat);
                }}
              >
                {cat.substring(0, 1)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ABOUT MODAL */}
      {isAboutOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <main className="w-full max-w-2xl relative p-4">
            <article className="bg-[#FBF9F6] border-[2.5px] border-black rounded-none shadow-[8px_8px_0px_#18181B] overflow-hidden relative">
              
              {/* Header */}
              <header className="bg-[#F3F1EC] border-b-[2.5px] border-black px-4 py-2.5 flex items-center justify-between select-none">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
                  <span className="font-mono text-[11px] sm:text-xs font-bold tracking-tight text-zinc-800">
                    SYS // ORIGIN_STORY <span className="text-zinc-400">/</span> SPECIMEN_NOTE_01
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => setIsAboutOpen(false)}
                    className="w-8 h-8 flex items-center justify-center bg-pink-200 hover:bg-pink-300 border-2 border-black shadow-[2px_2px_0px_#18181B] text-zinc-900 cursor-pointer transition-transform active:translate-y-[2px] active:translate-x-[2px] active:shadow-[0px_0px_0px_#18181B]"
                    type="button"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>
                </div>
              </header>

              {/* Body */}
              <section className="p-6 sm:p-10 font-sans">
                <div className="mb-7">
                  <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-[42px] tracking-tight leading-none text-zinc-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    why I built this
                  </h1>
                  <div className="w-full h-[2.5px] bg-black"></div>
                </div>

                <div className="space-y-5 text-base sm:text-lg text-zinc-700 leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <p>
                    I’ve always found algorithms easier to understand when I can <mark className="bg-amber-200 px-1.5 py-0.5 rounded-none font-semibold text-zinc-900 border-b-2 border-amber-400">see what’s actually happening</mark>, not just read the theory.
                  </p>
                  <p>
                    <strong className="font-bold text-zinc-900">Specimen</strong> started from that idea: a small space to slow algorithms down, step through every decision, and make the logic feel a little less intimidating.
                  </p>
                  <p>
                    I built this to make <abbr className="no-underline border-b-2 border-dashed border-zinc-900 font-bold text-zinc-900" title="Data Structures & Algorithms">DSA</abbr> more visual, interactive, and fun to explore — whether you’re learning from scratch, preparing for interviews, or just curious about how an algorithm works.
                  </p>
                  
                  <blockquote className="my-6 border-l-4 border-black bg-[#F3F1EC] p-4 sm:p-5 text-zinc-900 shadow-sm flex items-start gap-3">
                    <span className="font-mono text-xl font-bold text-zinc-500 leading-none select-none">“</span>
                    <p className="font-medium text-base sm:text-lg italic text-zinc-900">
                      Hopefully, it helps you <strong className="font-bold text-zinc-900 underline decoration-2 underline-offset-4 decoration-amber-400 not-italic">understand algorithms</strong> instead of just memorizing them.
                    </p>
                  </blockquote>
                </div>
              </section>

              {/* Footer */}
              <footer className="bg-[#F3F1EC] border-t-[2px] border-dashed border-zinc-400 px-6 sm:px-10 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-white border border-black">
                      [SPECIMEN LAB]
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600 text-sm">
                    <span className="text-xl text-zinc-900 leading-none" style={{ fontFamily: 'Kalam, cursive' }}>Built by a fellow engineer</span>
                    <span className="text-zinc-400 font-mono text-xs">•</span>
                  </div>
                </div>
              </footer>

            </article>
          </main>
        </div>
      )}
    </div>
  );
}

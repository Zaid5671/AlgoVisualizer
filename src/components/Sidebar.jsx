import { useState } from "react";
import { Menu, X } from "lucide-react";
import spitLogo from '../assets/spit_logo.png';
import { useNavigate } from 'react-router-dom';

export function Sidebar({ activeKey, onSelect, algorithms, isOpen, onToggle, onOpenQuiz }) {
  const navigate = useNavigate();
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
          <div 
            className="logo-container" 
            style={{ margin: 0, gap: '20px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
            title="Go to Homepage"
          >
            <div className="sidebar__mark" style={{ width: 48, height: 48, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={spitLogo} alt="SPIT Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 className="sidebar__title" style={{ margin: 0, lineHeight: 1.2, fontSize: '1.2rem', fontFamily: 'Inter, system-ui, sans-serif' }}>SPIT Algo<br/>Visualizer</h1>
              <span className="sidebar__subtitle mono-text" style={{ color: 'var(--text-muted)' }}>INTERACTIVE ALGORITHM<br/>LABORATORY</span>
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
          <Menu size={24} />
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

              <div className="sidebar-separator" style={{ marginTop: '2rem', borderTop: '1px solid #efefef' }}></div>
              
              <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={onOpenQuiz}
                  style={{
                    background: '#fffaf0', border: '1px solid #ebdcb8',
                    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                    color: 'var(--text-color)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ebdcb8'; e.currentTarget.style.background = '#fffaf0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span>Take a Quiz</span>
                  <span>&rarr;</span>
                </button>

                <button 
                  onClick={() => setIsAboutOpen(true)}
                  style={{
                    background: '#ffffff', border: '1px solid #efefef',
                    padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                    color: 'var(--text-muted)', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-color)'; e.currentTarget.style.borderColor = '#d0d0d0'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = '#efefef'; }}
                >
                  <span>Why I Built This</span>
                  <span>?</span>
                </button>
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
                  backgroundColor: activeCategory === cat ? 'var(--accent-yellow)' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'var(--text-color)',
                  border: activeCategory === cat ? 'none' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  fontWeight: 'bold', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif'
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
          backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%', maxWidth: '600px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            position: 'relative',
            padding: '3rem',
            fontFamily: 'Inter, sans-serif'
          }}>
            <button 
              onClick={() => setIsAboutOpen(false)}
              style={{
                position: 'absolute', top: '1.5rem', right: '1.5rem',
                background: 'white', border: '1px solid #efefef', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <span className="mono-text" style={{ color: 'var(--text-muted)' }}>SYS // ORIGIN_STORY</span>
              <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem' }}>why I built this</h2>
              <div style={{ width: '40px', height: '3px', background: 'var(--accent-yellow)', margin: '0 auto' }}></div>
            </div>

            <div style={{ color: 'var(--text-color)', lineHeight: 1.6, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <p>
                I've always found algorithms easier to understand when I can <span style={{ background: '#fffaf0', borderBottom: '2px solid var(--accent-yellow)', padding: '0 4px', fontWeight: 600 }}>see what's actually happening</span>, not just read the theory.
              </p>
              <p>
                <strong>Specimen</strong> started from that idea: a small space to slow algorithms down, step through every decision, and make the logic feel a little less intimidating.
              </p>
              <p>
                I built this to make DSA more visual, interactive, and fun to explore — whether you're learning from scratch, preparing for interviews, or just curious about how an algorithm works.
              </p>
              
              <blockquote style={{ 
                margin: '1rem 0 0 0', padding: '1.5rem', 
                background: '#fafafa', borderLeft: '4px solid var(--accent-yellow)',
                borderRadius: '0 8px 8px 0', fontStyle: 'italic'
              }}>
                <p style={{ margin: 0 }}>
                  Hopefully, it helps you <strong>understand algorithms</strong> instead of just memorizing them.
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  — Built by a fellow engineer
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

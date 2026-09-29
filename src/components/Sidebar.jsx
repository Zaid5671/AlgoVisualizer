import { useState } from "react";
import { Menu, X } from "lucide-react";
import spitLogo from '../assets/spit_logo.png';
import { useNavigate } from 'react-router-dom';

const DOT_COLORS = ['var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--blue)', 'var(--purple)', '#008a8a', 'var(--red)', '#a87a00'];

// The category is already shown above the list, so "(Graph)" suffixes are redundant here.
const shortName = (name) => name.replace(/\s*\(Graph\)$/, '');

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

  const selectCategory = (cat) => {
    const firstInCat = Object.keys(algorithms).find(k => algorithms[k].category === cat);
    if (firstInCat) onSelect(firstInCat);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        {isOpen && (
          <button className="brand" onClick={() => navigate('/')} title="Go to homepage">
            <img src={spitLogo} alt="SPIT logo" />
            <span>
              <span className="brand__title">SPIT Algo Visualizer</span>
              <span className="brand__subtitle">INTERACTIVE ALGORITHM LAB</span>
            </span>
          </button>
        )}
        <button onClick={onToggle} className="btn-icon" aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <Menu size={18} />
        </button>
      </div>

      {isOpen ? (
        <>
          <div className="sidebar-body">
            <div className="sidebar-section">
              <h3 className="sidebar-label">What are we looking at?</h3>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => selectCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-label">Pick a specimen</h3>
              <div className="specimen-list">
                {filteredAlgoKeys.map((key, idx) => {
                  const isActive = activeKey === key;
                  return (
                    <button
                      key={key}
                      className={`specimen-item ${isActive ? 'active' : ''}`}
                      onClick={() => onSelect(key)}
                    >
                      <span className="specimen-dot" style={{ backgroundColor: DOT_COLORS[idx % DOT_COLORS.length] }} />
                      {shortName(algorithms[key].name)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="sidebar-link sidebar-link--warm" onClick={onOpenQuiz}>
              <span>Take a quiz</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
            <button className="sidebar-link" onClick={() => setIsAboutOpen(true)}>
              <span>Why I built this</span>
              <span aria-hidden="true">?</span>
            </button>
          </div>
        </>
      ) : (
        <div className="sidebar-rail">
          {categories.map(cat => (
            <button
              key={cat}
              title={cat}
              className={activeCategory === cat ? 'active' : ''}
              onClick={() => selectCategory(cat)}
            >
              {cat.substring(0, 1)}
            </button>
          ))}
        </div>
      )}

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

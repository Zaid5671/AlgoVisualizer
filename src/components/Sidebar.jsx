import { useState } from "react";
import { Menu } from "lucide-react";
import { Modal } from './ui/Modal';
import { TEAM } from '../data/site';
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
              <h3 className="sidebar-label">Pick an algorithm</h3>
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
              <span>About this project</span>
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

      {isAboutOpen && (
        <Modal title="About this project" onClose={() => setIsAboutOpen(false)} width={560}>
          <div className="about">
            <p>
              Algorithms are easier to understand when you can <strong>see what is happening</strong>, not just read the theory.
              This app slows each algorithm down so you can follow every decision it makes.
            </p>
            <p>
              Watch mode shows the algorithm step by step. Practice mode lets you make those decisions yourself and explains any mistakes,
              so you <strong>understand</strong> an algorithm instead of memorising it.
            </p>
            <div className="about__team">
              <span className="eyebrow">Built by</span>
              <ul>
                {TEAM.map(member => (
                  <li key={member.name}><img src={member.photo} alt="" width="32" height="32" />{member.name}</li>
                ))}
              </ul>
              <p className="about__note">A mini-project by students of SPIT.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

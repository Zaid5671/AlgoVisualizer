import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export function Sidebar({ activeKey, onSelect, algorithms, isOpen, onToggle }) {
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
              <span className="sidebar-link">take a quiz ?</span>
              <span className="sidebar-link pink">why I built this ?</span>
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
    </div>
  );
}

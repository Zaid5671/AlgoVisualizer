export function Sidebar({ activeKey, onSelect, algorithms }) {
  const activeAlgorithm = algorithms[activeKey];
  const activeCategory = activeAlgorithm.category;

  const categories = ['Sorting', 'Pathfinding', 'Graph', 'Backtracking'];
  
  // Get all algorithms that belong to the currently active category
  const filteredAlgoKeys = Object.keys(algorithms).filter(
    key => algorithms[key].category === activeCategory
  );

  return (
    <div className="sidebar">
      <div className="logo-container">
        <div className="logo-icon"></div>
        <div>
          <h1>specimen</h1>
          <span className="mono-text" style={{ color: '#aaa' }}>A LIL ALGORITHM LAB</span>
        </div>
      </div>

      <div className="sidebar-separator"></div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 className="sidebar-title">what are we looking at?</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {categories.map((cat) => (
            <div 
              key={cat} 
              className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                // Find the first algorithm in this category and select it
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
             
             // Pick a color
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
      
      <div className="sidebar-footer">
        <span className="sidebar-link">take a quiz ➝</span>
        <span className="sidebar-link pink">why I built this ➝</span>
        <p>made over one very caffeinated week. click around, break stuff — it resets on refresh :)</p>
      </div>
    </div>
  );
}

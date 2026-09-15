import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { SortingView } from './views/SortingView';
import { PathfindingView } from './views/PathfindingView';
import { GraphView } from './views/GraphView';
import { BacktrackingView } from './views/BacktrackingView';
import { LandingPage } from './views/LandingPage';
import { ALGORITHMS } from './data/algorithms';
import { CodeTracer } from './components/CodeTracer';
import { ResizeHandle } from './components/ResizeHandle';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import './index.css';

function AlgorithmLayout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  
  const initialAlgo = categoryParam === 'sorting' ? 'bubbleSort' :
                      categoryParam === 'pathfinding' ? 'bfs' :
                      categoryParam === 'graph' ? 'bfsGraph' :
                      categoryParam === 'backtracking' ? 'nQueens' :
                      'bubbleSort';

  const [activeAlgorithmKey, setActiveAlgorithmKey] = useState(initialAlgo);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Right Sidebar State
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);
  
  const activeAlgorithm = ALGORITHMS[activeAlgorithmKey];

  return (
    <div className="app-container">
      <Sidebar 
        activeKey={activeAlgorithmKey} 
        onSelect={setActiveAlgorithmKey} 
        algorithms={ALGORITHMS} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className="main-content">
        <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="mono-text breadcrumbs">SPECIMEN / {activeAlgorithm.category.toUpperCase()}</span>
            <h1>{activeAlgorithm.name}</h1>
            <p className="description">{activeAlgorithm.description}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="complexity-box">
              <div className="comp-col">
                <span className="label">BEST</span>
                <span className="value">{activeAlgorithm.complexity.best}</span>
              </div>
              <div className="comp-col">
                <span className="label">AVG</span>
                <span className="value">{activeAlgorithm.complexity.avg}</span>
              </div>
              <div className="comp-col">
                <span className="label">WORST</span>
                <span className="value">{activeAlgorithm.complexity.worst}</span>
              </div>
              <div className="comp-col">
                <span className="label">SPACE</span>
                <span className="value">{activeAlgorithm.complexity.space}</span>
              </div>
            </div>

            {/* Toggle for right sidebar */}
            <button 
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              style={{ 
                background: 'none', border: '2px solid var(--border-color)', 
                cursor: 'pointer', padding: '0.5rem', display: 'flex', 
                alignItems: 'center', backgroundColor: 'white'
              }}
              title="Toggle Code Tracer"
            >
              {isRightSidebarOpen ? <PanelRightClose size={24} /> : <PanelRightOpen size={24} />}
            </button>
          </div>
        </div>

        <div className="tabs">
          <div className="tab active">watch</div>
          <div className="tab">practice it yourself</div>
        </div>

        {activeAlgorithm.category === 'Pathfinding' ? (
          <PathfindingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        ) : activeAlgorithm.category === 'Graph' ? (
          <GraphView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        ) : activeAlgorithm.category === 'Backtracking' ? (
          <BacktrackingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        ) : (
          <SortingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        )}
      </main>

      {/* RIGHT SIDEBAR */}
      {isRightSidebarOpen && (
         <>
           <ResizeHandle onResize={setRightPanelWidth} />
           <div style={{ 
             width: `${rightPanelWidth}px`, 
             flexShrink: 0, 
             backgroundColor: 'black', 
             overflowY: 'auto',
             display: 'flex',
             flexDirection: 'column'
           }}>
             <CodeTracer activeAlgorithm={activeAlgorithm} snapshot={currentSnapshot} />
           </div>
         </>
      )}

    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/algorithm" element={<AlgorithmLayout />} />
    </Routes>
  );
}

export default App;

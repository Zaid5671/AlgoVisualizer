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
import { PanelRightClose, PanelRightOpen, Code2, Menu } from 'lucide-react';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { ComplexityModal } from './components/ComplexityModal';
import { QuizModal } from './components/QuizModal';
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
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [currentSnapshot, setCurrentSnapshot] = useState(null);

  // Complexity Modal State
  const [modalState, setModalState] = useState({ isOpen: false, type: '', complexity: '', description: '' });

  const openModal = (type, complexityKey) => {
    const desc = activeAlgorithm.complexityDetails?.[complexityKey] || '';
    setModalState({ isOpen: true, type, complexity: activeAlgorithm.complexity[complexityKey], description: desc });
  };

  const activeAlgorithm = ALGORITHMS[activeAlgorithmKey];

  return (
    <div className="app-container">
      {/* Mobile Header overlay toggle */}
      <div className="mobile-header">
        <button onClick={() => setIsSidebarOpen(true)} className="mobile-menu-btn">
          <Menu size={24} />
        </button>
        <span className="mono-text bold">SPIT ALGO VISUALIZER</span>
      </div>

      <Sidebar
        activeKey={activeAlgorithmKey}
        onSelect={(key) => {
          setActiveAlgorithmKey(key);
          if (window.innerWidth <= 768) setIsSidebarOpen(false); // auto close on mobile
        }}
        algorithms={ALGORITHMS}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenQuiz={() => setIsQuizOpen(true)}
      />

      {/* Mobile Backdrop for Sidebar */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="main-content">
        <div className="header-row">
          <div className="header-left card-box">
            <span className="mono-text breadcrumbs">SPECIMEN / {activeAlgorithm.category.toUpperCase()}</span>
            <h1>{activeAlgorithm.name}</h1>
            <p className="description">{activeAlgorithm.description}</p>
          </div>
          <div className="header-right-col">
            <div className="complexity-box card-box" style={{ padding: '1rem 1.25rem', gap: '0.75rem' }}>
              <div className="comp-col" onClick={() => openModal('Best Case', 'best')} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e0d4bc', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#ffffff', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0d4bc'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span className="label">BEST</span>
                <span className="value">{activeAlgorithm.complexity.best}</span>
              </div>
              <div className="comp-col" onClick={() => openModal('Average Case', 'avg')} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e0d4bc', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#ffffff', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0d4bc'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span className="label">AVG</span>
                <span className="value">{activeAlgorithm.complexity.avg}</span>
              </div>
              <div className="comp-col" onClick={() => openModal('Worst Case', 'worst')} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e0d4bc', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#ffffff', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0d4bc'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span className="label">WORST</span>
                <span className="value">{activeAlgorithm.complexity.worst}</span>
              </div>
              <div className="comp-col" onClick={() => openModal('Space Complexity', 'space')} style={{ padding: '0.4rem 0.8rem', border: '1px solid #e0d4bc', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#ffffff', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-yellow)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0d4bc'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span className="label">SPACE</span>
                <span className="value">{activeAlgorithm.complexity.space}</span>
              </div>
            </div>

            {/* Toggle for right sidebar */}
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className="card-box code-toggle-btn"
              title="Toggle Code Tracer"
            >
              <Code2 size={20} />
              <span className="code-toggle-text">Code</span>
            </button>
          </div>
        </div>

        <div className="card-box" style={{ marginBottom: '1rem' }}><AlgorithmInfo activeAlgorithm={activeAlgorithm} /></div>

        {activeAlgorithm.category === 'Pathfinding' ? (
          <PathfindingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        ) : activeAlgorithm.category === 'Graph' ? (
          <GraphView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        ) : activeAlgorithm.category === 'Backtracking' ? (
          <BacktrackingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        ) : (
          <SortingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} />
        )}

        <div style={{ minHeight: '1.7rem', flexShrink: 0 }}></div>
      </main>

      {isQuizOpen && <QuizModal onClose={() => setIsQuizOpen(false)} />}

      {/* RIGHT SIDEBAR */}
      {isRightSidebarOpen && (
        <>
          {/* Mobile Backdrop for Right Sidebar */}
          <div className="right-sidebar-backdrop" onClick={() => setIsRightSidebarOpen(false)}></div>
          <ResizeHandle onResize={setRightPanelWidth} />
          <div className="right-sidebar" style={{ width: `${rightPanelWidth}px` }}>
            <CodeTracer activeAlgorithm={activeAlgorithm} snapshot={currentSnapshot} />
          </div>
        </>
      )}

      <ComplexityModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        complexity={modalState.complexity}
        description={modalState.description}
      />
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

// Trigger HMR

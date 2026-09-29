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
import { Code2, Menu } from 'lucide-react';
import { AlgorithmInfo } from './components/AlgorithmInfo';
import { ComplexityModal } from './components/ComplexityModal';
import { QuizModal } from './components/QuizModal';
import './index.css';

const COMPLEXITY_FIELDS = [
  { key: 'best', label: 'BEST', title: 'Best Case' },
  { key: 'avg', label: 'AVG', title: 'Average Case' },
  { key: 'worst', label: 'WORST', title: 'Worst Case' },
  { key: 'space', label: 'SPACE', title: 'Space Complexity' },
];

function AlgorithmLayout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const algoParam = searchParams.get('algo');
  const initialMode = searchParams.get('mode') === 'practice' ? 'practice' : 'watch';

  // ?algo=<key> opens one algorithm directly; ?category= opens the first one in a topic.
  const initialAlgo = ALGORITHMS[algoParam] ? algoParam :
    categoryParam === 'sorting' ? 'bubbleSort' :
    categoryParam === 'pathfinding' ? 'bfs' :
      categoryParam === 'graph' ? 'bfsGraph' :
        categoryParam === 'backtracking' ? 'nQueens' :
          'bubbleSort';

  const [activeAlgorithmKey, setActiveAlgorithmKey] = useState(initialAlgo);
  // On phones the sidebar is an overlay drawer, so start with it closed.
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);

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
        <button onClick={() => setIsSidebarOpen(true)} className="mobile-menu-btn" aria-label="Open menu">
          <Menu size={24} />
        </button>
        <span className="mono-text bold">SPIT Algo Visualizer</span>
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
        <div className="page">
          <header className="algo-header">
            <div className="algo-header__text">
              <span className="eyebrow breadcrumbs">algorithms / {activeAlgorithm.category}</span>
              <h1>{activeAlgorithm.name}</h1>
              <p className="algo-header__desc">{activeAlgorithm.description}</p>
            </div>
            <div className="algo-header__side">
              <div className="complexity-strip" aria-label="Complexity (click for details)">
                {COMPLEXITY_FIELDS.map(({ key, label, title }) => (
                  <button key={key} className="complexity-item" onClick={() => openModal(title, key)} title={`${title}: click for details`}>
                    <span className="complexity-item__label">{label}</span>
                    <span className="complexity-item__value">{activeAlgorithm.complexity[key]}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className={`btn code-toggle-btn ${isRightSidebarOpen ? 'active' : ''}`}
                title="Toggle code tracer"
              >
                <Code2 size={16} />
                <span className="code-toggle-text">Code</span>
              </button>
            </div>
          </header>

          {activeAlgorithm.category === 'Pathfinding' ? (
            <PathfindingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} initialMode={initialMode} />
          ) : activeAlgorithm.category === 'Graph' ? (
            <GraphView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} initialMode={initialMode} />
          ) : activeAlgorithm.category === 'Backtracking' ? (
            <BacktrackingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} initialMode={initialMode} />
          ) : (
            <SortingView activeAlgorithm={activeAlgorithm} onStep={setCurrentSnapshot} initialMode={initialMode} />
          )}

          <AlgorithmInfo activeAlgorithm={activeAlgorithm} />
        </div>
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


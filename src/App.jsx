import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SortingView } from './views/SortingView';
import { PathfindingView } from './views/PathfindingView';
import { GraphView } from './views/GraphView';
import { BacktrackingView } from './views/BacktrackingView';
import { ALGORITHMS } from './data/algorithms';
import './index.css';

function App() {
  const [activeAlgorithmKey, setActiveAlgorithmKey] = useState('bubbleSort');
  
  const activeAlgorithm = ALGORITHMS[activeAlgorithmKey];

  return (
    <div className="app-container">
      <Sidebar activeKey={activeAlgorithmKey} onSelect={setActiveAlgorithmKey} algorithms={ALGORITHMS} />
      
      <main className="main-content">
        <div className="header-row">
          <div>
            <span className="mono-text breadcrumbs">SPECIMEN / {activeAlgorithm.category.toUpperCase()}</span>
            <h1>{activeAlgorithm.name}</h1>
            <p className="description">{activeAlgorithm.description}</p>
          </div>
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
        </div>

        <div className="tabs">
          <div className="tab active">watch</div>
          <div className="tab">practice it yourself</div>
        </div>

        {activeAlgorithm.category === 'Pathfinding' ? (
          <PathfindingView activeAlgorithm={activeAlgorithm} />
        ) : activeAlgorithm.category === 'Graph' ? (
          <GraphView activeAlgorithm={activeAlgorithm} />
        ) : activeAlgorithm.category === 'Backtracking' ? (
          <BacktrackingView activeAlgorithm={activeAlgorithm} />
        ) : (
          <SortingView activeAlgorithm={activeAlgorithm} />
        )}
      </main>
    </div>
  );
}

export default App;

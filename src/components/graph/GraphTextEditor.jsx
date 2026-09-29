import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { MAX_NODES, parseEdgeList, serializeEdges } from '../../graph/graphModel';

export function GraphTextEditor({ graph, weighted, directed, onApply, onClose }) {
  const [nodeCount, setNodeCount] = useState(Math.max(1, graph.nodes.length));
  const [text, setText] = useState(() => serializeEdges(graph, weighted));
  const [errors, setErrors] = useState([]);

  const apply = () => {
    const result = parseEdgeList(text, nodeCount, graph, directed);
    if (result.errors.length > 0) {
      setErrors(result.errors);
      return;
    }
    onApply(result.graph);
  };

  return (
    <Modal
      title="Configure Graph Manually"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={apply}>Render Graph</button>
        </>
      }
    >
      <label className="field">
        <span className="field__label">Number of nodes (max {MAX_NODES})</span>
        <input
          type="number"
          min="1"
          max={MAX_NODES}
          value={nodeCount}
          onChange={e => setNodeCount(parseInt(e.target.value) || 1)}
          className="text-input"
        />
      </label>

      <label className="field">
        <span className="field__label">
          Edges, one per line {weighted ? '(Source-Target-Weight)' : '(Source-Target)'}
        </span>
        <span className="field__hint">
          {weighted ? 'e.g. A-B-5, A B -3 (negative weights are allowed)' : 'e.g. A-B or A, B'}
          {directed ? ' · edges are directed from source to target' : ''}
        </span>
        <textarea
          rows={8}
          value={text}
          onChange={e => { setText(e.target.value); setErrors([]); }}
          className="text-input text-input--area"
          spellCheck={false}
        />
      </label>

      {errors.length > 0 && (
        <ul className="field__errors" role="alert">
          {errors.slice(0, 6).map(err => <li key={err}>{err}</li>)}
          {errors.length > 6 && <li>…and {errors.length - 6} more</li>}
        </ul>
      )}
    </Modal>
  );
}

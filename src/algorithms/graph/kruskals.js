import { StepTypes } from '../../engine/stepTypes';

// Simple Disjoint Set (Union-Find) for Kruskal's
class UnionFind {
  constructor(elements) {
    this.parent = {};
    elements.forEach(e => (this.parent[e] = e));
  }
  find(i) {
    if (this.parent[i] === i) return i;
    return this.find(this.parent[i]);
  }
  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
    }
  }
}

export function generateKruskalsSnapshots({ nodes, edges }) {
  const snapshots = [];
  const visitedNodes = new Set();
  const visitedEdges = [];
  
  const record = (type, activeNodes = [], activeEdges = [], message) => {
    snapshots.push({
      type,
      visitedNodes: Array.from(visitedNodes),
      visitedEdges: [...visitedEdges],
      activeNodes,
      activeEdges,
      message
    });
  };

  record(StepTypes.START, [], [], "Starting Kruskal's Minimum Spanning Tree (MST)");

  // 1. Sort all edges by weight
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const uf = new UnionFind(nodes);
  
  let totalCost = 0;

  for (const edge of sortedEdges) {
    record(StepTypes.COMPARE, [edge.source, edge.target], [edge.id], `Examining cheapest available edge (Weight: ${edge.weight})`);

    const root1 = uf.find(edge.source);
    const root2 = uf.find(edge.target);

    if (root1 !== root2) {
      uf.union(edge.source, edge.target);
      visitedNodes.add(edge.source);
      visitedNodes.add(edge.target);
      visitedEdges.push(edge.id);
      totalCost += edge.weight;
      
      record(StepTypes.SWAP, [edge.source, edge.target], [edge.id], `No cycle detected! Adding edge to MST.`);
    } else {
      record(StepTypes.COMPARE, [edge.source, edge.target], [edge.id], `Cycle detected! Ignoring this edge.`);
    }
  }

  record(StepTypes.END, [], [], `Kruskal's MST Complete! Total cost: ${totalCost}`);

  return snapshots;
}

export const PRESET_GRAPHS = {
  5: {
    nodes: [
      { id: 0, x: 400, y: 80 },
      { id: 1, x: 600, y: 180 },
      { id: 2, x: 500, y: 320 },
      { id: 3, x: 300, y: 320 },
      { id: 4, x: 200, y: 180 }
    ],
    edges: [
      { id: 'e-0-1', source: 0, target: 1, weight: 4 },
      { id: 'e-1-2', source: 1, target: 2, weight: 2 },
      { id: 'e-2-3', source: 2, target: 3, weight: 7 },
      { id: 'e-3-4', source: 3, target: 4, weight: 3 },
      { id: 'e-4-0', source: 4, target: 0, weight: 5 },
      { id: 'e-0-2', source: 0, target: 2, weight: 8 },
      { id: 'e-1-4', source: 1, target: 4, weight: 6 }
    ]
  },
  8: {
    nodes: [
      { id: 0, x: 200, y: 100 },
      { id: 1, x: 400, y: 100 },
      { id: 2, x: 600, y: 100 },
      { id: 3, x: 200, y: 300 },
      { id: 4, x: 400, y: 300 },
      { id: 5, x: 600, y: 300 },
      { id: 6, x: 300, y: 200 },
      { id: 7, x: 500, y: 200 }
    ],
    edges: [
      { id: 'e-0-1', source: 0, target: 1, weight: 2 },
      { id: 'e-1-2', source: 1, target: 2, weight: 3 },
      { id: 'e-0-3', source: 0, target: 3, weight: 5 },
      { id: 'e-1-4', source: 1, target: 4, weight: 1 },
      { id: 'e-2-5', source: 2, target: 5, weight: 4 },
      { id: 'e-3-4', source: 3, target: 4, weight: 6 },
      { id: 'e-4-5', source: 4, target: 5, weight: 2 },
      { id: 'e-0-6', source: 0, target: 6, weight: 7 },
      { id: 'e-6-4', source: 6, target: 4, weight: 3 },
      { id: 'e-1-7', source: 1, target: 7, weight: 8 },
      { id: 'e-7-5', source: 7, target: 5, weight: 5 }
    ]
  },
  12: {
    nodes: [
      { id: 0, x: 150, y: 200 },
      { id: 1, x: 250, y: 100 },
      { id: 2, x: 250, y: 300 },
      { id: 3, x: 400, y: 80 },
      { id: 4, x: 400, y: 200 },
      { id: 5, x: 400, y: 320 },
      { id: 6, x: 550, y: 100 },
      { id: 7, x: 550, y: 300 },
      { id: 8, x: 650, y: 200 },
      { id: 9, x: 325, y: 140 },
      { id: 10, x: 325, y: 260 },
      { id: 11, x: 475, y: 200 }
    ],
    edges: [
      { id: 'e-0-1', source: 0, target: 1, weight: 3 },
      { id: 'e-0-2', source: 0, target: 2, weight: 4 },
      { id: 'e-1-3', source: 1, target: 3, weight: 2 },
      { id: 'e-2-5', source: 2, target: 5, weight: 5 },
      { id: 'e-1-9', source: 1, target: 9, weight: 1 },
      { id: 'e-9-4', source: 9, target: 4, weight: 6 },
      { id: 'e-2-10', source: 2, target: 10, weight: 2 },
      { id: 'e-10-4', source: 10, target: 4, weight: 3 },
      { id: 'e-3-6', source: 3, target: 6, weight: 4 },
      { id: 'e-5-7', source: 5, target: 7, weight: 7 },
      { id: 'e-4-11', source: 4, target: 11, weight: 2 },
      { id: 'e-11-6', source: 11, target: 6, weight: 1 },
      { id: 'e-11-7', source: 11, target: 7, weight: 3 },
      { id: 'e-6-8', source: 6, target: 8, weight: 5 },
      { id: 'e-7-8', source: 7, target: 8, weight: 4 },
      { id: 'e-3-4', source: 3, target: 4, weight: 8 },
      { id: 'e-4-5', source: 4, target: 5, weight: 9 }
    ]
  }
};

export function generateGraph(n) {
  if (PRESET_GRAPHS[n]) return PRESET_GRAPHS[n];
  
  const nodes = [];
  const edges = [];
  const cx = 400;
  const cy = 200;
  const radius = 160;

  for (let i = 0; i < n; i++) {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // Start at top
    nodes.push({
      id: i,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    });
  }

  // Create a ring to ensure connectedness
  for (let i = 0; i < n; i++) {
    edges.push({
      id: `e-${i}-${(i + 1) % n}`,
      source: i,
      target: (i + 1) % n,
      weight: Math.floor(Math.random() * 9) + 1
    });
  }

  // Add some random chords for complexity
  const numChords = Math.max(0, n - 4);
  for (let i = 0; i < numChords; i++) {
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u !== v && Math.abs(u - v) !== 1 && Math.abs(u - v) !== n - 1) {
      // Avoid duplicate edges
      if (!edges.some(e => (e.source === u && e.target === v) || (e.source === v && e.target === u))) {
        edges.push({
          id: `e-${u}-${v}`,
          source: u,
          target: v,
          weight: Math.floor(Math.random() * 9) + 1
        });
      }
    }
  }

  return { nodes, edges };
}

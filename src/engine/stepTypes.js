export const StepTypes = {
  // Sorting
  COMPARE: 'compare',
  SWAP: 'swap',
  WRITE: 'write', // a single position is overwritten (insertion/shell insert, merge, radix)
  SETTLED: 'settled',
  PIVOT: 'pivot',
  
  // Pathfinding / Graph
  VISIT: 'visit',
  FRONTIER: 'frontier',
  PATH: 'path',
  
  // Backtracking
  PLACE: 'place',
  REMOVE: 'remove',

  // General
  START: 'start',
  END: 'end'
};

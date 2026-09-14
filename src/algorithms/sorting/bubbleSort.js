import { StepTypes } from '../../engine/stepTypes';

export function generateBubbleSortSnapshots(initialArray) {
  const snapshots = [];
  // Make a copy so we don't mutate the original input
  let arr = [...initialArray];
  const n = arr.length;
  
  // Helper to push a snapshot
  const record = (type, indices, message) => {
    snapshots.push({
      type,
      array: [...arr],
      activeIndices: indices, // e.g. [0, 1] for compare/swap
      settledIndices: [], // We will populate this below
      message
    });
  };

  record(StepTypes.START, [], "Starting Bubble Sort");

  let settledCount = 0;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      // COMPARE
      record(StepTypes.COMPARE, [j, j + 1], `Comparing ${arr[j]} and ${arr[j + 1]}`);

      if (arr[j] > arr[j + 1]) {
        // SWAP
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
        record(StepTypes.SWAP, [j, j + 1], `Swapped ${arr[j+1]} and ${arr[j]}`);
      }
    }
    settledCount++;
    // Mark the last element of this pass as settled
    // The settled elements are the last `settledCount` elements
    const settledIndices = Array.from({length: settledCount}, (_, idx) => n - 1 - idx);
    
    // Update the last snapshot to include settled indices, or push a new one
    snapshots.push({
      type: StepTypes.SETTLED,
      array: [...arr],
      activeIndices: [],
      settledIndices,
      message: `${arr[n - i - 1]} is in its final position`
    });

    if (!swapped) {
      snapshots.push({
        type: StepTypes.END,
        array: [...arr],
        activeIndices: [],
        settledIndices: Array.from({length: n}, (_, idx) => idx), // all settled
        message: "Array is fully sorted!"
      });
      break;
    }
  }

  // Ensure all are marked settled if loop finishes normally
  const lastSnapshot = snapshots[snapshots.length - 1];
  if (lastSnapshot.type !== StepTypes.END) {
     snapshots.push({
        type: StepTypes.END,
        array: [...arr],
        activeIndices: [],
        settledIndices: Array.from({length: n}, (_, idx) => idx), // all settled
        message: "Array is fully sorted!"
      });
  }

  // Backfill settled indices for previous steps so they stay rendered
  let currentSettled = [];
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].settledIndices && snapshots[i].settledIndices.length > currentSettled.length) {
      currentSettled = snapshots[i].settledIndices;
    } else {
      snapshots[i].settledIndices = currentSettled;
    }
  }
  // Actually, bubbling backfill: we want the settled ones from the PAST, not the future.
  // Let's rewrite the backfill:
  currentSettled = [];
  for (let i = 0; i < snapshots.length; i++) {
    if (snapshots[i].type === StepTypes.SETTLED) {
      // It grew
      currentSettled = [...snapshots[i].settledIndices];
    } else if (snapshots[i].type === StepTypes.END) {
       currentSettled = [...snapshots[i].settledIndices];
    } else {
      snapshots[i].settledIndices = [...currentSettled];
    }
  }

  return snapshots;
}

import { StepTypes } from '../../engine/stepTypes';

export function generateHeapSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  let settled = [];
  
  const record = (type, activeIndices, message) => {
    snapshots.push({ type, array: [...arr], activeIndices, settledIndices: [...settled], message });
  };

  record(StepTypes.START, [], "Starting Heap Sort (Phase 1: Build Max Heap)");

  function heapify(N, i) {
    let largest = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;

    if (left < N) {
      record(StepTypes.COMPARE, [largest, left], `Comparing root ${arr[largest]} with left child ${arr[left]}`);
      if (arr[left] > arr[largest]) largest = left;
    }

    if (right < N) {
      record(StepTypes.COMPARE, [largest, right], `Comparing current max ${arr[largest]} with right child ${arr[right]}`);
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest !== i) {
      let temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;
      record(StepTypes.SWAP, [i, largest], `Swapping ${arr[i]} and ${arr[largest]} to maintain max-heap property`);
      heapify(N, largest);
    }
  }

  // Phase 1: Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  record(StepTypes.PIVOT, [], "Max Heap built. Starting Phase 2: Extraction.");

  // Phase 2: Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    let temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    record(StepTypes.SWAP, [0, i], `Moving largest element ${arr[i]} to the end of the array`);
    
    settled.push(i);
    record(StepTypes.SETTLED, [], `${arr[i]} is in its final sorted position`);
    
    heapify(i, 0); // Re-heapify the reduced heap
  }

  settled.push(0);
  record(StepTypes.END, [], "Array is fully sorted!");

  return snapshots;
}

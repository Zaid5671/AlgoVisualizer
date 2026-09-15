import { StepTypes } from '../../engine/stepTypes';

export function generateSelectionSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  
  const record = (type, activeIndices, settledIndices, message, activeLine) => {
    snapshots.push({
      type,
      array: [...arr],
      activeIndices,
      settledIndices: [...settledIndices],
      message,
      activeLine
    });
  };

  let settled = [];
  record(StepTypes.START, [], settled, "Starting Selection Sort", -1);

  for (let i = 0; i < n; i++) { // Note: pseudocode says N - 1, but running to n is safe, last step is trivial
    let minIdx = i;
    
    // Highlight the starting pivot/minimum
    record(StepTypes.PIVOT, [minIdx], settled, `Assuming ${arr[minIdx]} is the minimum`, 1);

    for (let j = i + 1; j < n; j++) {
      record(StepTypes.COMPARE, [minIdx, j], settled, `Comparing current min ${arr[minIdx]} with ${arr[j]}`, 3);
      
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        record(StepTypes.PIVOT, [minIdx], settled, `Found new minimum: ${arr[minIdx]}`, 4);
      }
    }

    if (minIdx !== i) {
      record(StepTypes.SWAP, [i, minIdx], settled, `Swapping ${arr[i]} and ${arr[minIdx]}`, 8);
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }

    settled.push(i);
    record(StepTypes.SETTLED, [], settled, `${arr[i]} is in its final position`, 9);
  }

  record(StepTypes.END, [], settled, "Array is fully sorted!", -1);

  return snapshots;
}

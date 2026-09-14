import { StepTypes } from '../../engine/stepTypes';

export function generateSelectionSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  
  const record = (type, activeIndices, settledIndices, message) => {
    snapshots.push({
      type,
      array: [...arr],
      activeIndices,
      settledIndices: [...settledIndices],
      message
    });
  };

  let settled = [];
  record(StepTypes.START, [], settled, "Starting Selection Sort");

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    
    // Highlight the starting pivot/minimum
    record(StepTypes.PIVOT, [minIdx], settled, `Assuming ${arr[minIdx]} is the minimum`);

    for (let j = i + 1; j < n; j++) {
      record(StepTypes.COMPARE, [minIdx, j], settled, `Comparing current min ${arr[minIdx]} with ${arr[j]}`);
      
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        record(StepTypes.PIVOT, [minIdx], settled, `Found new minimum: ${arr[minIdx]}`);
      }
    }

    if (minIdx !== i) {
      record(StepTypes.SWAP, [i, minIdx], settled, `Swapping ${arr[i]} and ${arr[minIdx]}`);
      let temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }

    settled.push(i);
    record(StepTypes.SETTLED, [], settled, `${arr[i]} is in its final position`);
  }

  record(StepTypes.END, [], settled, "Array is fully sorted!");

  return snapshots;
}

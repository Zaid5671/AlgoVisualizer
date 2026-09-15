import { StepTypes } from '../../engine/stepTypes';

export function generateInsertionSortSnapshots(initialArray) {
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

  let settled = [0]; // The first element is trivially "sorted" initially
  record(StepTypes.START, [], [], "Starting Insertion Sort", -1);

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;

    // Highlight the card we are pulling out to insert
    record(StepTypes.PIVOT, [i], settled, `Selecting ${key} to insert into the sorted portion`, 1);

    while (j >= 0) {
      record(StepTypes.COMPARE, [j, j + 1], settled, `Comparing ${key} with ${arr[j]}`, 3);
      
      if (arr[j] > key) {
        // Shift right
        arr[j + 1] = arr[j];
        record(StepTypes.SWAP, [j, j + 1], settled, `Shifting ${arr[j]} to the right`, 4);
        j--;
      } else {
        break;
      }
    }
    
    arr[j + 1] = key;
    if (j + 1 !== i) {
      record(StepTypes.SWAP, [j + 1], settled, `Inserting ${key} into its correct position`, 7);
    }

    // Expand the settled (sorted) boundary
    if (!settled.includes(i)) {
      settled.push(i);
    }
    record(StepTypes.SETTLED, [], settled, `The first ${i + 1} elements are sorted`, 8);
  }

  // Ensure all are marked settled at the end
  settled = Array.from({length: n}, (_, idx) => idx);
  record(StepTypes.END, [], settled, "Array is fully sorted!", -1);

  return snapshots;
}

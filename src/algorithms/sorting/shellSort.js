import { StepTypes } from '../../engine/stepTypes';

export function generateShellSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  
  const record = (type, activeIndices, settledIndices, message, activeLine) => {
    snapshots.push({ type, array: [...arr], activeIndices, settledIndices: [...settledIndices], message, activeLine });
  };

  record(StepTypes.START, [], [], "Starting Shell Sort", -1);
  let settled = [];

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    record(StepTypes.PIVOT, [], settled, `Current gap size: ${gap}`, 0);
    
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j = i;
      
      // We do the condition check in the while loop
      while (true) {
        record(StepTypes.COMPARE, [j, Math.max(0, j - gap)], settled, `Comparing elements separated by gap ${gap}`, 4);
        if (j >= gap && arr[j - gap] > temp) {
          arr[j] = arr[j - gap];
          record(StepTypes.SWAP, [j, j - gap], settled, `Shifting ${arr[j-gap]} to the right`, 5);
          j -= gap;
        } else {
          break;
        }
      }
      
      arr[j] = temp;
      if (j !== i) {
         record(StepTypes.SWAP, [j], settled, `Inserting ${temp} into its gap position`, 8);
      }
    }
  }

  settled = Array.from({length: n}, (_, idx) => idx);
  record(StepTypes.END, [], settled, "Array is fully sorted!", -1);

  return snapshots;
}

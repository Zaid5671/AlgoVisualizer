import { StepTypes } from '../../engine/stepTypes';

export function generateShellSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  
  const record = (type, activeIndices, settledIndices, message) => {
    snapshots.push({ type, array: [...arr], activeIndices, settledIndices: [...settledIndices], message });
  };

  record(StepTypes.START, [], [], "Starting Shell Sort");
  let settled = [];

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    record(StepTypes.PIVOT, [], settled, `Current gap size: ${gap}`);
    
    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j;
      
      record(StepTypes.COMPARE, [i, i - gap], settled, `Comparing elements separated by gap ${gap}`);
      
      for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {
        record(StepTypes.SWAP, [j, j - gap], settled, `Shifting ${arr[j-gap]} to the right`);
        arr[j] = arr[j - gap];
      }
      
      arr[j] = temp;
      if (j !== i) {
         record(StepTypes.SWAP, [j], settled, `Inserting ${temp} into its gap position`);
      }
    }
  }

  settled = Array.from({length: n}, (_, idx) => idx);
  record(StepTypes.END, [], settled, "Array is fully sorted!");

  return snapshots;
}

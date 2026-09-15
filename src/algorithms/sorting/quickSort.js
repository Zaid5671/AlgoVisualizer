import { StepTypes } from '../../engine/stepTypes';

export function generateQuickSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  let settled = [];
  
  const record = (type, activeIndices, message, activeLine) => {
    snapshots.push({ type, array: [...arr], activeIndices, settledIndices: [...settled], message, activeLine });
  };

  record(StepTypes.START, [], "Starting Quick Sort", -1);

  function partition(low, high) {
    let pivot = arr[high];
    record(StepTypes.PIVOT, [high], `Chosen pivot: ${pivot}`, 8);
    let i = low - 1;

    for (let j = low; j < high; j++) {
      record(StepTypes.COMPARE, [j, high], `Comparing ${arr[j]} with pivot ${pivot}`, 11);
      if (arr[j] < pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        if (i !== j) {
          record(StepTypes.SWAP, [i, j], `Swapping ${arr[j]} and ${arr[i]} (smaller than pivot)`, 13);
        }
      }
    }

    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    record(StepTypes.SWAP, [i + 1, high], `Moving pivot ${pivot} to its correct sorted position`, 16);
    
    settled.push(i + 1);
    record(StepTypes.SETTLED, [], `Pivot ${pivot} is settled in its final place`, 17);
    
    return i + 1;
  }

  function quickSort(low, high) {
    record(StepTypes.PIVOT, [low, high], `Partitioning array from index ${low} to ${high}`, 0);
    if (low < high) {
      let pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      if (!settled.includes(low)) {
         settled.push(low);
         record(StepTypes.SETTLED, [], `Element ${arr[low]} is settled`, 1);
      }
    }
  }

  quickSort(0, n - 1);

  // Ensure all elements are marked settled
  settled = Array.from({length: n}, (_, idx) => idx);
  record(StepTypes.END, [], "Array is fully sorted!", -1);

  return snapshots;
}

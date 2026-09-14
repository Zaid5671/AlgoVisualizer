import { StepTypes } from '../../engine/stepTypes';

export function generateQuickSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  let settled = [];
  
  const record = (type, activeIndices, message) => {
    snapshots.push({ type, array: [...arr], activeIndices, settledIndices: [...settled], message });
  };

  record(StepTypes.START, [], "Starting Quick Sort");

  function partition(low, high) {
    let pivot = arr[high];
    record(StepTypes.PIVOT, [high], `Chosen pivot: ${pivot}`);
    let i = low - 1;

    for (let j = low; j < high; j++) {
      record(StepTypes.COMPARE, [j, high], `Comparing ${arr[j]} with pivot ${pivot}`);
      if (arr[j] < pivot) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        if (i !== j) {
          record(StepTypes.SWAP, [i, j], `Swapping ${arr[j]} and ${arr[i]} (smaller than pivot)`);
        }
      }
    }

    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    record(StepTypes.SWAP, [i + 1, high], `Moving pivot ${pivot} to its correct sorted position`);
    
    settled.push(i + 1);
    record(StepTypes.SETTLED, [], `Pivot ${pivot} is settled in its final place`);
    
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      let pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      if (!settled.includes(low)) {
         settled.push(low);
         record(StepTypes.SETTLED, [], `Element ${arr[low]} is settled`);
      }
    }
  }

  quickSort(0, n - 1);

  // Ensure all elements are marked settled (e.g. elements that were never explicitly partitioned)
  settled = Array.from({length: n}, (_, idx) => idx);
  record(StepTypes.END, [], "Array is fully sorted!");

  return snapshots;
}

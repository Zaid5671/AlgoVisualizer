import { StepTypes } from '../../engine/stepTypes';

export function generateMergeSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  
  const record = (type, indices, message) => {
    snapshots.push({
      type,
      array: [...arr],
      activeIndices: indices,
      settledIndices: [],
      message
    });
  };

  record(StepTypes.START, [], "Starting Merge Sort");

  function merge(left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;
    
    let L = new Array(n1);
    let R = new Array(n2);
    
    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
    
    let i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
      record(StepTypes.COMPARE, [left + i, mid + 1 + j], `Comparing ${L[i]} and ${R[j]}`);
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        record(StepTypes.SWAP, [k], `Placing ${L[i]} into sorted position`);
        i++;
      } else {
        arr[k] = R[j];
        record(StepTypes.SWAP, [k], `Placing ${R[j]} into sorted position`);
        j++;
      }
      k++;
    }
    
    while (i < n1) {
      arr[k] = L[i];
      record(StepTypes.SWAP, [k], `Copying remaining element ${L[i]}`);
      i++;
      k++;
    }
    
    while (j < n2) {
      arr[k] = R[j];
      record(StepTypes.SWAP, [k], `Copying remaining element ${R[j]}`);
      j++;
      k++;
    }
  }

  function mergeSort(left, right) {
    if (left >= right) return;
    let mid = left + Math.floor((right - left) / 2);
    mergeSort(left, mid);
    mergeSort(mid + 1, right);
    merge(left, mid, right);
  }

  mergeSort(0, n - 1);
  
  snapshots.push({
    type: StepTypes.END,
    array: [...arr],
    activeIndices: [],
    settledIndices: Array.from({length: n}, (_, idx) => idx),
    message: "Array is fully sorted!"
  });

  return snapshots;
}

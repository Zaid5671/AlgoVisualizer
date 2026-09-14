import { StepTypes } from '../../engine/stepTypes';

export function generateRadixSortSnapshots(initialArray) {
  const snapshots = [];
  let arr = [...initialArray];
  const n = arr.length;
  
  const record = (type, activeIndices, message) => {
    // Radix sort settles everything at the very end
    snapshots.push({ type, array: [...arr], activeIndices, settledIndices: [], message });
  };

  record(StepTypes.START, [], "Starting Radix Sort");

  let max = Math.max(...arr, 0); // Handle empty array case safely
  
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    record(StepTypes.PIVOT, [], `Sorting based on digit: ${exp}'s place`);
    
    let output = new Array(n).fill(0);
    let count = new Array(10).fill(0);

    // Count occurrences
    for (let i = 0; i < n; i++) {
      let digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;
      record(StepTypes.COMPARE, [i], `Looking at element ${arr[i]}, digit is ${digit}`);
    }

    // Cumulative sum
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    // Build output array (iterate backwards for stability)
    for (let i = n - 1; i >= 0; i--) {
      let digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1] = arr[i];
      count[digit]--;
    }

    // Copy back to original array
    for (let i = 0; i < n; i++) {
      arr[i] = output[i];
      record(StepTypes.SWAP, [i], `Placing ${arr[i]} into its bucket-sorted position for this digit`);
    }
  }

  // Entire array is settled
  const settled = Array.from({length: n}, (_, idx) => idx);
  snapshots.push({ 
    type: StepTypes.END, 
    array: [...arr], 
    activeIndices: [], 
    settledIndices: settled, 
    message: "Array is fully sorted!" 
  });

  return snapshots;
}

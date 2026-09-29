// Builds "practice it yourself" sessions for the sorting algorithms.
//
// A session is a list of rounds. Each round is either:
//   - 'arrange': the learner rearranges bars (by swapping) until they match `target`,
//     e.g. the array after one pass of bubble sort.
//   - a choice ('merge' | 'pivot' | 'heap' | 'bucket'): the learner picks one answer,
//     checked with `accepts(answer)`; `answer` is one correct choice used for "show me".
//
// Every round carries a `nudge` (text hint that doesn't give the answer away) and a
// `mistake` message shown after a wrong attempt. The simulations here mirror the
// implementations in src/algorithms/sorting so practice and watch mode agree.

const range = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
const swap = (arr, i, j) => { const t = arr[i]; arr[i] = arr[j]; arr[j] = t; };
const sameValues = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

export const differingIndices = (a, b) => a.map((v, i) => (v !== b[i] ? i : -1)).filter(i => i >= 0);

// One useful swap towards `target`: the first wrong position and a bar that belongs there
// (preferring a bar that is itself out of place). Returns [] when already matching.
export const nextHelpfulSwap = (work, target) => {
  const i = work.findIndex((v, idx) => v !== target[idx]);
  if (i < 0) return [];
  const candidates = work.map((v, k) => (k > i && v === target[i] ? k : -1)).filter(k => k >= 0);
  const j = candidates.find(k => work[k] !== target[k]) ?? candidates[0];
  return j === undefined ? [i] : [i, j];
};

// ---------------------------------------------------------------------------
// Pass-by-pass algorithms ('arrange' rounds)
// ---------------------------------------------------------------------------
const arrangeRound = (title, start, target, extra) => ({
  kind: 'arrange',
  title,
  start: [...start],
  target: [...target],
  isNoop: sameValues(start, target),
  mistake: 'Not quite. Some bars are not where this pass would leave them.',
  ...extra,
});

function bubbleRounds(input) {
  const arr = [...input];
  const n = arr.length;
  const rounds = [];
  for (let i = 0; i < n - 1; i++) {
    const start = [...arr];
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) { swap(arr, j, j + 1); swapped = true; }
    }
    rounds.push(arrangeRound(`Pass ${i + 1}`, start, arr, {
      prompt: swapped
        ? `Do pass ${i + 1} of bubble sort: walk left to right over the unsorted part, swapping neighbours that are out of order.`
        : `Pass ${i + 1}: if no neighbours are out of order, bubble sort makes no swaps and stops early. Press Check without moving anything.`,
      nudge: `Only positions 0–${n - i - 1} are unsorted. By the end of this pass, the largest of them has bubbled to position ${n - i - 1}.`,
      settledAfter: range(n - i - 1, n - 1),
    }));
    if (!swapped) break;
  }
  return rounds;
}

function selectionRounds(input) {
  const arr = [...input];
  const n = arr.length;
  const rounds = [];
  for (let i = 0; i < n - 1; i++) {
    const start = [...arr];
    let minIdx = i;
    for (let j = i + 1; j < n; j++) if (arr[j] < arr[minIdx]) minIdx = j;
    if (minIdx !== i) swap(arr, i, minIdx);
    rounds.push(arrangeRound(`Pass ${i + 1}`, start, arr, {
      prompt: `Pass ${i + 1}: find the smallest value in the unsorted part and swap it into position ${i}.`,
      nudge: `Look only at positions ${i}–${n - 1}. Which value there is smallest? It belongs at position ${i}${minIdx === i ? ', and it may already be there' : ''}.`,
      settledAfter: range(0, i),
    }));
  }
  return rounds;
}

function insertionRounds(input) {
  const arr = [...input];
  const n = arr.length;
  const rounds = [];
  for (let i = 1; i < n; i++) {
    const start = [...arr];
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) { arr[j + 1] = arr[j]; j--; }
    arr[j + 1] = key;
    rounds.push(arrangeRound(`Insert #${i}`, start, arr, {
      prompt: `Insert ${key} (position ${i}) into the sorted part on its left.`,
      nudge: `Slide ${key} left past every value in positions 0–${i - 1} that is bigger than it. Swapping it with its left neighbour one step at a time works.`,
      focus: [i],
      settledAfter: range(0, i),
    }));
  }
  return rounds;
}

function shellRounds(input) {
  const arr = [...input];
  const n = arr.length;
  const rounds = [];
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    const start = [...arr];
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) { arr[j] = arr[j - gap]; j -= gap; }
      arr[j] = temp;
    }
    rounds.push(arrangeRound(`Gap ${gap}`, start, arr, {
      prompt: gap === 1
        ? 'Final pass (gap 1): this is plain insertion sort, so finish sorting the whole array.'
        : `Gap ${gap}: sort each group of values that are ${gap} positions apart, without mixing groups.`,
      nudge: gap === 1
        ? 'Sort everything into ascending order.'
        : `Group 1 is positions 0, ${gap}, ${2 * gap}…, group 2 is 1, ${gap + 1}, ${2 * gap + 1}…, and so on. Sort each group on its own; values only move within their group.`,
      gap,
      settledAfter: gap === 1 ? range(0, n - 1) : [],
    }));
  }
  return rounds;
}

// ---------------------------------------------------------------------------
// Merge sort: "which value goes into the merged run next?"
// ---------------------------------------------------------------------------
function mergeRounds(input) {
  const arr = [...input];
  const rounds = [];

  const merge = (lo, mid, hi) => {
    const L = arr.slice(lo, mid + 1);
    const R = arr.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;
    while (i < L.length && j < R.length) {
      const leftHead = L[i];
      const rightHead = R[j];
      const snapshot = [...arr];
      const merged = snapshot.slice(lo, k);
      const takeLeft = leftHead <= rightHead;
      rounds.push({
        kind: 'merge',
        title: `Merge ${lo}–${hi}`,
        prompt: `Merging [${L.join(', ')}] with [${R.join(', ')}]. Which value goes into the merged run next?`,
        array: snapshot,
        range: [lo, hi],
        left: L.slice(i),
        right: R.slice(j),
        merged,
        answer: takeLeft ? 'left' : 'right',
        // Equal heads: either choice still sorts correctly (the implementation takes the left one to stay stable).
        accepts: (a) => (leftHead === rightHead ? a === 'left' || a === 'right' : a === (takeLeft ? 'left' : 'right')),
        nudge: 'Both runs are already sorted, so the next value must be one of the two front values.',
        mistake: 'Not that one. Compare the two front values: the merged run always takes the smaller.',
        highlightAnswer: takeLeft ? 'left' : 'right',
        tieNote: leftHead === rightHead ? 'Tie! Merge sort takes the left one so equal values keep their original order (stability).' : null,
      });
      arr[k++] = takeLeft ? L[i++] : R[j++];
    }
    while (i < L.length) arr[k++] = L[i++];
    while (j < R.length) arr[k++] = R[j++];
  };

  const sort = (lo, hi) => {
    if (lo >= hi) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };
  sort(0, arr.length - 1);
  return rounds;
}

// ---------------------------------------------------------------------------
// Quick sort (Lomuto, pivot = last element): "where does the pivot end up?"
// ---------------------------------------------------------------------------
function quickRounds(input) {
  const arr = [...input];
  const rounds = [];
  const settled = new Set();

  const partition = (lo, hi) => {
    const pivot = arr[hi];
    const before = [...arr];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      if (arr[j] < pivot) { i++; swap(arr, i, j); }
    }
    swap(arr, i + 1, hi);
    const pi = i + 1;

    const others = before.slice(lo, hi);
    const smaller = others.filter(v => v < pivot).length;
    const equal = others.filter(v => v === pivot).length;
    rounds.push({
      kind: 'pivot',
      title: `Partition ${lo}–${hi}`,
      prompt: `The pivot is ${pivot} (the last value in positions ${lo}–${hi}). After partitioning, which position does it end up in? Click that position.`,
      array: before,
      range: [lo, hi],
      pivotIndex: hi,
      settled: [...settled],
      answer: pi,
      // With duplicates of the pivot, any slot in the run of equal values is a sorted position.
      accepts: (a) => a >= lo + smaller && a <= lo + smaller + equal,
      nudge: `Count how many values in positions ${lo}–${hi - 1} are smaller than ${pivot}. They all go to the pivot's left.`,
      mistake: `Not there. The pivot lands just after every value smaller than ${pivot} in this range.`,
      highlightIndices: [pi],
    });
    settled.add(pi);
    return pi;
  };

  const sort = (lo, hi) => {
    if (lo < hi) {
      const pi = partition(lo, hi);
      sort(lo, pi - 1);
      sort(pi + 1, hi);
    } else if (lo === hi) {
      settled.add(lo);
    }
  };
  sort(0, arr.length - 1);
  return rounds;
}

// ---------------------------------------------------------------------------
// Heap sort (max-heap): "during sift-down, swap with which child, or stop?"
// ---------------------------------------------------------------------------
function heapRounds(input) {
  const arr = [...input];
  const n = arr.length;
  const rounds = [];
  const settled = [];

  const siftDown = (size, start, phase, context) => {
    let i = start;
    let first = true;
    while (2 * i + 1 < size) {
      const children = [2 * i + 1, 2 * i + 2].filter(c => c < size);
      const bigValue = Math.max(...children.map(c => arr[c]));
      const mustSwap = bigValue > arr[i];
      const validChildren = children.filter(c => arr[c] === bigValue);
      // The implementation only switches to the right child if it is strictly bigger, so ties go left.
      const largest = validChildren[0];

      rounds.push({
        kind: 'heap',
        title: phase === 'build' ? 'Build max-heap' : 'Extract max',
        prompt: `${first && context ? `${context} ` : ''}Sift down ${arr[i]} (position ${i}): swap it with a child, or stop if it's already in place?`,
        array: [...arr],
        heapSize: size,
        node: i,
        children,
        settled: [...settled],
        answer: mustSwap ? largest : 'stop',
        accepts: (a) => (mustSwap ? validChildren.includes(a) : a === 'stop'),
        nudge: 'In a max-heap every parent is at least as big as its children. Swap only with the larger child, and only if it is bigger than the parent.',
        mistake: mustSwap
          ? 'Not quite. After the swap the parent must be bigger than both children, so pick the larger child.'
          : 'Not quite. Check whether any child is actually bigger than the parent.',
        highlightIndices: mustSwap ? [largest] : [],
      });

      if (!mustSwap) break;
      swap(arr, i, largest);
      i = largest;
      first = false;
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(n, i, 'build', null);
  for (let end = n - 1; end > 0; end--) {
    const max = arr[0];
    swap(arr, 0, end);
    settled.push(end);
    siftDown(end, 0, 'extract', `Max ${max} was swapped to position ${end}.`);
  }
  return rounds;
}

// ---------------------------------------------------------------------------
// Radix sort (LSD, base 10): "which bucket does this value go into?"
// ---------------------------------------------------------------------------
const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands'];

function radixRounds(input) {
  let arr = [...input];
  const rounds = [];
  const max = Math.max(...arr, 0);
  for (let exp = 1, place = 0; Math.floor(max / exp) > 0; exp *= 10, place++) {
    const buckets = Array.from({ length: 10 }, () => []);
    const placeName = PLACE_NAMES[place] || `10^${place}`;
    arr.forEach((value, idx) => {
      const digit = Math.floor(value / exp) % 10;
      rounds.push({
        kind: 'bucket',
        title: `Pass ${place + 1}: ${placeName} digit`,
        prompt: `Which bucket does ${value} go into? Sort by its ${placeName} digit.`,
        array: [...arr],
        current: idx,
        buckets: buckets.map(b => [...b]),
        placeName,
        answer: digit,
        accepts: (a) => a === digit,
        nudge: `Look only at the ${placeName} digit of ${value}${value < exp ? ` (it has no ${placeName} digit, so treat it as 0)` : ''}.`,
        mistake: `Not that bucket. Which digit sits in the ${placeName} place of ${value}?`,
      });
      buckets[digit].push(value);
    });
    arr = buckets.flat();
  }
  return rounds;
}

// ---------------------------------------------------------------------------
const BUILDERS = {
  bubbleSort: bubbleRounds,
  selectionSort: selectionRounds,
  insertionSort: insertionRounds,
  shellSort: shellRounds,
  mergeSort: mergeRounds,
  quickSort: quickRounds,
  heapSort: heapRounds,
  radixSort: radixRounds,
};

export const PRACTICE_INTRO = {
  bubbleSort: 'Do each pass of bubble sort yourself: swap bars, then press Check.',
  selectionSort: 'Each pass puts the next smallest value in place. Swap bars, then press Check.',
  insertionSort: 'Insert one value at a time into the sorted part. Swap bars, then press Check.',
  shellSort: 'Sort values that are "gap" apart, halving the gap each pass. Swap bars, then press Check.',
  mergeSort: 'Merge sorted runs by repeatedly picking the smaller front value.',
  quickSort: 'Predict where each pivot lands after partitioning.',
  heapSort: 'Keep the max-heap property: decide each sift-down swap.',
  radixSort: 'Distribute each value into a bucket by one digit at a time.',
};

export function buildSortingPractice(algoId, array) {
  const build = BUILDERS[algoId];
  return build ? build(array) : [];
}

// Wraps the precomputed rounds as a stepper engine for usePracticeSession.
// State: { index, work } where `work` is the learner's copy of the array in arrange rounds.
export function createSortingEngine(algoId, array) {
  const rounds = buildSortingPractice(algoId, array);
  const workFor = (i) => (rounds[i]?.kind === 'arrange' ? rounds[i].start : null);

  const question = (state) => {
    const round = rounds[state.index];
    if (!round) return null;
    if (round.kind !== 'arrange') return round;
    return {
      ...round,
      accepts: (work) => sameValues(work, round.target),
      mistake: (work) => {
        const wrong = differingIndices(work, round.target).length;
        return `${round.mistake} (${wrong} bar${wrong === 1 ? ' is' : 's are'} out of place.)`;
      },
      successNote: round.isNoop ? 'No swaps were needed, so the algorithm can stop here.' : null,
      revealNote: 'This is how the pass ends. Press Check to continue.',
    };
  };

  return {
    rounds,
    init: () => ({ index: 0, work: workFor(0) }),
    question,
    apply: (state) => ({ index: state.index + 1, work: workFor(state.index + 1) }),
    auto: (state) => (rounds[state.index].kind === 'arrange' ? rounds[state.index].target : rounds[state.index].answer),
    reveal: (state) => (rounds[state.index]?.kind === 'arrange' ? { ...state, work: rounds[state.index].target } : null),
    edit: (state, { i, j }) => {
      const work = [...state.work];
      [work[i], work[j]] = [work[j], work[i]];
      return { ...state, work };
    },
  };
}

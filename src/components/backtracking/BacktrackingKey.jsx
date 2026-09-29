import { BookOpen } from 'lucide-react';
import { COLOURING_COLORS } from './colors';

// Plain-language guide for backtracking screens. Samples reuse the board classes.

const Term = ({ sample, children }) => (
  <div><dt>{sample}</dt><dd>{children}</dd></div>
);

const QueenSample = ({ className = '', queen }) => (
  <span className={`queens-cell key-board-sample ${className}`}>{queen && <span className="queens-cell__queen">♛</span>}</span>
);
const SudokuSample = ({ className = '', value }) => <span className={`sudoku-cell key-board-sample ${className}`}>{value}</span>;
const Word = ({ children }) => <span className="key-word">{children}</span>;

const BACKTRACKING = (
  <Term sample={<Word>Backtracking</Word>}>
    Make a choice and keep going. If you reach a point where nothing fits, the fault lies in an earlier choice, so <strong>undo the most recent choice</strong> and try its next option. Options that already led to a dead end are marked as tried and aren't used again in that spot.
  </Term>
);

const CONTENT = {
  nQueens: (
    <>
      <Term sample={<Word>Goal</Word>}>Place N queens on an N×N board so that no two attack each other.</Term>
      <Term sample={<QueenSample queen />}><strong>Attacks</strong>: a queen attacks every square in its row, its column and both diagonals.</Term>
      <Term sample={<QueenSample className="is-column" />}><strong>Current column</strong>: the algorithm fills one column at a time, left to right, trying rows from the top.</Term>
      <Term sample={<QueenSample className="is-attacked" />}><strong>Attacked</strong> (shown by the "Show where" hint): a queen already on the board covers this square.</Term>
      <Term sample={<QueenSample className="is-tried" />}><strong>Tried</strong> (✗): this square was used before and led to a dead end.</Term>
      {BACKTRACKING}
    </>
  ),
  sudoku: (
    <>
      <Term sample={<Word>Rule</Word>}>Every row, every column and every 3×3 box must contain each digit 1–9 exactly once.</Term>
      <Term sample={<SudokuSample className="is-given" value="5" />}><strong>Given</strong> (bold): part of the puzzle, never changes.</Term>
      <Term sample={<SudokuSample className="is-current" />}><strong>Current cell</strong>: the first empty cell in reading order (left to right, top to bottom). That's the cell the algorithm fills next.</Term>
      <Term sample={<SudokuSample className="is-placed" value="7" />}><strong>Your guess</strong>: a digit that fit when it was placed. A later dead end can still undo it.</Term>
      {BACKTRACKING}
    </>
  ),
  graphColoring: (
    <>
      <Term sample={<Word>Goal</Word>}>Colour every node using at most m colours so that no edge connects two nodes of the same colour.</Term>
      <Term sample={<span className="colour-choice__dot key-dot" style={{ background: COLOURING_COLORS[0] }} />}><strong>Colours</strong> are numbered 1 to m. The algorithm tries them in that order.</Term>
      <Term sample={<Word>Current</Word>}>The node with the yellow ring is next. Nodes are coloured in alphabetical order.</Term>
      <Term sample={<Word>Neighbour</Word>}>A node joined to this one by an edge. It must not share its colour.</Term>
      {BACKTRACKING}
    </>
  ),
};

export function BacktrackingKey({ algoId, defaultOpen = true }) {
  return (
    <details className="grid-key" open={defaultOpen}>
      <summary><BookOpen size={15} /> How to read this board</summary>
      <div className="grid-key__body grid-key__body--single">
        <dl className="grid-key__terms grid-key__terms--graph">{CONTENT[algoId]}</dl>
      </div>
    </details>
  );
}

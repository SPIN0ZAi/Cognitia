import { useState } from 'react';
import { RotateCcw, Sparkles, CheckCircle } from 'lucide-react';

// Generates all 92 valid 8-queens solutions using backtracking
const generateAllSolutions = (): number[][] => {
  const solutions: number[][] = [];
  const board: number[] = new Array(8).fill(-1); // board[col] = row

  const isSafe = (row: number, col: number): boolean => {
    for (let c = 0; c < col; c++) {
      const r = board[c];
      if (r === row || Math.abs(r - row) === Math.abs(c - col)) {
        return false;
      }
    }
    return true;
  };

  const solve = (col: number) => {
    if (col === 8) {
      solutions.push([...board]);
      return;
    }
    for (let r = 0; r < 8; r++) {
      if (isSafe(r, col)) {
        board[col] = r;
        solve(col + 1);
        board[col] = -1;
      }
    }
  };

  solve(0);
  return solutions;
};

const ALL_92_SOLUTIONS = generateAllSolutions();

export const EightQueensVisualizer: React.FC = () => {
  // Queens placed: array of {row, col}
  const [queens, setQueens] = useState<{ row: number; col: number }[]>([]);
  const [solutionIdx, setSolutionIdx] = useState(0);

  // Check if cell is in conflict
  const isCellInConflict = (row: number, col: number): boolean => {
    for (const q of queens) {
      if (q.row === row && q.col === col) continue;
      // same row, column, or diagonal
      if (
        q.row === row ||
        q.col === col ||
        Math.abs(q.row - row) === Math.abs(q.col - col)
      ) {
        return true;
      }
    }
    return false;
  };

  const handleCellClick = (row: number, col: number) => {
    const existingIndex = queens.findIndex((q) => q.row === row && q.col === col);
    if (existingIndex >= 0) {
      // Remove queen
      setQueens(queens.filter((_, idx) => idx !== existingIndex));
    } else {
      // Add queen if under 8
      if (queens.length < 8) {
        setQueens([...queens, { row, col }]);
      }
    }
  };

  const loadSolution = (idx: number) => {
    const sol = ALL_92_SOLUTIONS[idx];
    const newQueens = sol.map((row, col) => ({ row, col }));
    setQueens(newQueens);
    setSolutionIdx(idx);
  };

  const reset = () => {
    setQueens([]);
  };

  // Count pairwise conflicts
  let conflictPairs = 0;
  for (let i = 0; i < queens.length; i++) {
    for (let j = i + 1; j < queens.length; j++) {
      const q1 = queens[i];
      const q2 = queens[j];
      if (
        q1.row === q2.row ||
        q1.col === q2.col ||
        Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)
      ) {
        conflictPairs++;
      }
    }
  }

  const isSolved = queens.length === 8 && conflictPairs === 0;

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Sparkles size={18} className="text-amber-400" />
            8-Queens Problem & Conflict Ray Visualizer (Lesson 2, Slide 80)
          </div>
          <div className="visualizer-subtitle">
            Compare Incremental Backtracking ($8^8$) vs Complete-State Local Search
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => loadSolution((solutionIdx + 1) % ALL_92_SOLUTIONS.length)}
            className="btn-tactile btn-emerald"
          >
            Show Solution ({solutionIdx + 1}/92)
          </button>
          <button onClick={reset} className="btn-tactile">
            <RotateCcw size={14} />
            Clear Board
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        <div className="grid-2" style={{ alignItems: 'center' }}>
          {/* Chessboard */}
          <div>
            <div className="chessboard">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const hasQueen = queens.some((q) => q.row === r && q.col === c);
                  const inConflict = hasQueen && isCellInConflict(r, c);
                  const isDark = (r + c) % 2 === 1;

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleCellClick(r, c)}
                      className={`chess-cell ${isDark ? 'dark' : 'light'} ${inConflict ? 'conflict' : ''}`}
                    >
                      {hasQueen ? (inConflict ? '❌' : '👑') : ''}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Queens placed: <strong style={{ color: '#fff' }}>{queens.length}/8</strong> | Conflicting pairs: <strong style={{ color: conflictPairs > 0 ? '#fb7185' : '#34d399' }}>{conflictPairs}</strong>
            </div>

            {isSolved && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--accent-emerald)',
                  color: '#34d399',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <CheckCircle size={15} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                Valid Non-Attacking Solution! Zero conflicts across all 8 queens.
              </div>
            )}
          </div>

          {/* Academic Formulation Comparison */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', color: '#f8fafc' }}>
              Formulation Comparison (Slide 80)
            </div>

            <div style={{ marginBottom: '1rem', fontSize: '0.84rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>1. Incremental Formulation (Search):</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Start with an empty board and add one queen per column at each step. As soon as a candidate queen conflicts with an existing queen, the entire subtree is immediately pruned via <strong>backtracking</strong>. State space is bounded by 8^8 ≈ 1.68 × 10^7 configurations, down from C(64, 8) ≈ 4.4 × 10^14 unconstrained states!
              </p>
            </div>

            <div style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--accent-amber)' }}>2. Complete-State Formulation (Local Search):</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                All 8 queens are initially placed on the board (one per column, randomly). Actions consist of moving a queen up or down within its column to minimize the heuristic conflict function h = number of attacking pairs. Suited for hill-climbing, simulated annealing, and min-conflicts heuristic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

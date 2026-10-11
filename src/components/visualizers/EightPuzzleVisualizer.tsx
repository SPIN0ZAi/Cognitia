import { useState } from 'react';
import type { EightPuzzleBoard } from '../../types/graph';
import { RotateCcw, Shuffle, Grid3X3 } from 'lucide-react';

const GOAL_STATE: EightPuzzleBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Preset configurations from lecture slides
const PRESETS: Record<string, { board: EightPuzzleBoard; name: string; slideNote: string }> = {
  lesson3Sample: {
    board: [7, 2, 4, 5, 0, 6, 8, 3, 1],
    name: 'Lesson 3 Slide 46 (Sample State)',
    slideNote: 'h1 = 7 misplaced tiles, h2 = 15 Manhattan distance',
  },
  lesson2Initial: {
    board: [7, 2, 4, 5, 0, 6, 8, 3, 1],
    name: 'Lesson 2 Slide 15 (8-Puzzle Start)',
    slideNote: 'Classic UCLM lecture initial configuration',
  },
  exercise2Initial: {
    board: [2, 8, 3, 0, 1, 4, 7, 6, 5],
    name: 'Lesson 3 Slide 55 (Exercise 2 Start)',
    slideNote: 'Greedy Best-First exercise with h1 wrongly located tiles',
  },
  solvedGoal: {
    board: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    name: 'Goal State (Solved)',
    slideNote: 'h1 = 0, h2 = 0',
  },
};

export const EightPuzzleVisualizer: React.FC = () => {
  const [board, setBoard] = useState<EightPuzzleBoard>(PRESETS.lesson3Sample.board);
  const [moveCount, setMoveCount] = useState(0);

  // Calculate h1: Misplaced tiles (excluding blank)
  const computeH1 = (current: EightPuzzleBoard): number => {
    let misplaced = 0;
    for (let i = 0; i < 9; i++) {
      if (current[i] !== 0 && current[i] !== GOAL_STATE[i]) {
        misplaced++;
      }
    }
    return misplaced;
  };

  // Calculate h2: Sum of Manhattan distances (excluding blank)
  const computeH2 = (current: EightPuzzleBoard): { total: number; tileDetails: { tile: number; dist: number }[] } => {
    let total = 0;
    const tileDetails: { tile: number; dist: number }[] = [];

    for (let i = 0; i < 9; i++) {
      const tile = current[i];
      if (tile !== 0) {
        const currRow = Math.floor(i / 3);
        const currCol = i % 3;

        // Find goal position for this tile
        const goalIndex = GOAL_STATE.indexOf(tile);
        const goalRow = Math.floor(goalIndex / 3);
        const goalCol = goalIndex % 3;

        const dist = Math.abs(currRow - goalRow) + Math.abs(currCol - goalCol);
        total += dist;
        tileDetails.push({ tile, dist });
      }
    }
    tileDetails.sort((a, b) => a.tile - b.tile);
    return { total, tileDetails };
  };

  // Move tile if adjacent to blank (0)
  const handleTileClick = (index: number) => {
    const blankIndex = board.indexOf(0);
    const tileRow = Math.floor(index / 3);
    const tileCol = index % 3;
    const blankRow = Math.floor(blankIndex / 3);
    const blankCol = blankIndex % 3;

    const isAdjacent =
      (Math.abs(tileRow - blankRow) === 1 && tileCol === blankCol) ||
      (Math.abs(tileCol - blankCol) === 1 && tileRow === blankRow);

    if (isAdjacent) {
      const newBoard = [...board];
      newBoard[blankIndex] = board[index];
      newBoard[index] = 0;
      setBoard(newBoard);
      setMoveCount((prev) => prev + 1);
    }
  };

  // Shuffle board by applying random valid moves to preserve solvability parity
  const handleShuffle = () => {
    let current = [...board];
    for (let step = 0; step < 20; step++) {
      const blankIndex = current.indexOf(0);
      const row = Math.floor(blankIndex / 3);
      const col = blankIndex % 3;
      const validNeighbors: number[] = [];

      if (row > 0) validNeighbors.push(blankIndex - 3); // Up
      if (row < 2) validNeighbors.push(blankIndex + 3); // Down
      if (col > 0) validNeighbors.push(blankIndex - 1); // Left
      if (col < 2) validNeighbors.push(blankIndex + 1); // Right

      const randomTarget = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      current[blankIndex] = current[randomTarget];
      current[randomTarget] = 0;
    }
    setBoard(current);
    setMoveCount(0);
  };

  const h1 = computeH1(board);
  const { total: h2, tileDetails } = computeH2(board);
  const isSolved = h1 === 0;

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Grid3X3 size={19} className="text-amber-400" />
            8-Puzzle Heuristic Laboratory: $h_1$ vs $h_2$ Dominance
          </div>
          <div className="visualizer-subtitle">
            Interactive State Space Slider, Manhattan Distance Breakdown & Real-Time Heuristic Analyzer
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={handleShuffle} className="btn-tactile">
            <Shuffle size={14} />
            Random Move Shuffle
          </button>
          <button
            onClick={() => {
              setBoard(PRESETS.lesson3Sample.board);
              setMoveCount(0);
            }}
            className="btn-tactile"
          >
            <RotateCcw size={14} />
            Reset to Slide 46
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Presets Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>
            Lecture Presets:
          </span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => {
                setBoard(preset.board);
                setMoveCount(0);
              }}
              className="btn-tactile btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="grid-2" style={{ alignItems: 'center' }}>
          {/* Interactive Board */}
          <div>
            <div className="puzzle-board">
              {board.map((tile, idx) => {
                const isBlank = tile === 0;
                const isCorrect = !isBlank && tile === GOAL_STATE[idx];

                return (
                  <div
                    key={idx}
                    onClick={() => !isBlank && handleTileClick(idx)}
                    className={`puzzle-tile ${isBlank ? 'blank' : ''} ${isCorrect ? 'correct-pos' : ''}`}
                  >
                    {!isBlank ? tile : ''}
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                User Moves: <strong style={{ color: '#fff' }}>{moveCount}</strong> | Click adjacent tiles to slide.
              </span>
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
                🎉 Puzzle Solved! Goal configuration achieved.
              </div>
            )}
          </div>

          {/* Heuristic Computation Breakdown */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: '#f8fafc' }}>
              Real-Time Heuristic Evaluation
            </div>

            {/* h1 Card */}
            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                borderLeft: '3px solid var(--accent-cyan)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  $h_1(n)$: Misplaced Tiles
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--accent-cyan)',
                  }}
                >
                  {h1}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Count of tiles not in goal position (excluding the blank). Admissible.
              </div>
            </div>

            {/* h2 Card */}
            <div
              style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                borderLeft: '3px solid var(--accent-amber)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  $h_2(n)$: Manhattan Distance
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: 'var(--accent-amber)',
                  }}
                >
                  {h2}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Sum of horizontal & vertical displacements to goal targets. Admissible.
              </div>
            </div>

            {/* Dominance Proof Status */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                background: h2 >= h1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                border: `1px solid ${h2 >= h1 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
              }}
            >
              Dominance check: $h_2(n) \\ge h_1(n) \\implies$ <strong>{h2} &ge; {h1}</strong> ({h2 >= h1 ? 'HOLDS ✓' : 'VIOLATION ✗'})
            </div>

            {/* Tile-by-Tile Manhattan Breakdown */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Tile Distance Breakdown:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {tileDetails.map(({ tile, dist }) => (
                  <span
                    key={tile}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      color: dist === 0 ? 'var(--accent-emerald)' : 'var(--text-secondary)',
                    }}
                  >
                    T{tile}:{dist}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

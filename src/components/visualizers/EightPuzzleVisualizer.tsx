import { useState } from 'react';
import type { EightPuzzleBoard } from '../../types/graph';
import { RotateCcw, Shuffle, Grid3X3, CheckCircle2 } from 'lucide-react';
import { TactileButton, CoordinateStamp, StatusLed } from '../common/InstrumentControls';
import { useLabTheme } from '../../context/LabThemeContext';
import confetti from 'canvas-confetti';

const GOAL_STATE: EightPuzzleBoard = [1, 2, 3, 4, 5, 6, 7, 8, 0];

const PRESETS: Record<string, { board: EightPuzzleBoard; name: string; slideNote: string }> = {
  lesson3Sample: {
    board: [7, 2, 4, 5, 0, 6, 8, 3, 1],
    name: 'Slide 46 (Sample State)',
    slideNote: 'h1 = 7 misplaced tiles, h2 = 15 Manhattan distance',
  },
  lesson2Initial: {
    board: [7, 2, 4, 5, 0, 6, 8, 3, 1],
    name: 'Slide 15 (Initial State)',
    slideNote: 'Classic UCLM lecture configuration',
  },
  exercise2Initial: {
    board: [2, 8, 3, 0, 1, 4, 7, 6, 5],
    name: 'Slide 55 (Exercise 2)',
    slideNote: 'Greedy Best-First with h1 wrongly located tiles',
  },
  solvedGoal: {
    board: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    name: 'Goal Configuration',
    slideNote: 'h1 = 0, h2 = 0 (Solved state)',
  },
};

export const EightPuzzleVisualizer: React.FC = () => {
  const { playClick } = useLabTheme();
  const [board, setBoard] = useState<EightPuzzleBoard>(PRESETS.lesson3Sample.board);
  const [moveCount, setMoveCount] = useState(0);

  // Compute h1: Misplaced tiles (excluding blank)
  const computeH1 = (current: EightPuzzleBoard): number => {
    let misplaced = 0;
    for (let i = 0; i < 9; i++) {
      if (current[i] !== 0 && current[i] !== GOAL_STATE[i]) {
        misplaced++;
      }
    }
    return misplaced;
  };

  // Compute h2: Sum of Manhattan distances
  const computeH2 = (current: EightPuzzleBoard): { total: number; tileDetails: { tile: number; dist: number; dx: number; dy: number }[] } => {
    let total = 0;
    const tileDetails: { tile: number; dist: number; dx: number; dy: number }[] = [];

    for (let i = 0; i < 9; i++) {
      const tile = current[i];
      if (tile !== 0) {
        const currRow = Math.floor(i / 3);
        const currCol = i % 3;

        const goalIndex = GOAL_STATE.indexOf(tile);
        const goalRow = Math.floor(goalIndex / 3);
        const goalCol = goalIndex % 3;

        const dx = goalCol - currCol;
        const dy = goalRow - currRow;
        const dist = Math.abs(dx) + Math.abs(dy);
        total += dist;
        tileDetails.push({ tile, dist, dx, dy });
      }
    }
    tileDetails.sort((a, b) => a.tile - b.tile);
    return { total, tileDetails };
  };

  // Slide tile if adjacent to blank (0)
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
      playClick('soft');
      const newBoard = [...board];
      newBoard[blankIndex] = board[index];
      newBoard[index] = 0;
      setBoard(newBoard);
      setMoveCount((prev) => prev + 1);

      // Check if solved
      if (computeH1(newBoard) === 0) {
        playClick('success');
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#C6F277', '#78D5E8', '#E9B777'],
          });
        } catch {
          // Ignored
        }
      }
    }
  };

  // Shuffle board by applying valid random sliding moves
  const handleShuffle = () => {
    playClick('heavy');
    let current = [...board];
    for (let step = 0; step < 24; step++) {
      const blankIndex = current.indexOf(0);
      const row = Math.floor(blankIndex / 3);
      const col = blankIndex % 3;
      const validNeighbors: number[] = [];

      if (row > 0) validNeighbors.push(blankIndex - 3);
      if (row < 2) validNeighbors.push(blankIndex + 3);
      if (col > 0) validNeighbors.push(blankIndex - 1);
      if (col < 2) validNeighbors.push(blankIndex + 1);

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

  // Get vector info for a specific tile
  const getTileVector = (tileVal: number) => {
    if (tileVal === 0) return null;
    return tileDetails.find((t) => t.tile === tileVal);
  };

  return (
    <div className="visualizer-container" style={{ background: 'var(--lab-bg-surface)', border: '1px solid var(--lab-border-subtle)' }}>
      {/* Top Coordinate Stamp */}
      <CoordinateStamp
        sectionCode="LAB:08 // 8_PUZZLE_INSTRUMENT"
        statusText="HEURISTIC_EVALUATOR_ACTIVE"
        coords="3x3_SLIDING_PERMUTATION // MANHATTAN_VECTOR"
      />

      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#F1F5F9' }}>
            <Grid3X3 size={19} className="text-amber-400" />
            8-Puzzle Mechanical Laboratory: h₁ vs h₂ Dominance
          </div>
          <div className="visualizer-subtitle" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
            Interactive Physics Tiles, Real-time Manhattan Displacement Vectors &amp; Dominance Verification
          </div>
        </div>

        <div className="visualizer-controls" style={{ display: 'flex', gap: '0.45rem' }}>
          <TactileButton
            size="sm"
            variant="secondary"
            onClick={handleShuffle}
            icon={<Shuffle size={13} />}
            cursorLabel="SHUFFLE_BOARD"
          >
            Random Move Shuffle
          </TactileButton>

          <TactileButton
            size="sm"
            variant="secondary"
            onClick={() => {
              playClick('toggle');
              setBoard(PRESETS.lesson3Sample.board);
              setMoveCount(0);
            }}
            icon={<RotateCcw size={13} />}
            cursorLabel="RESET_SLIDE_46"
          >
            Reset Slide 46
          </TactileButton>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Presets Navigation Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '0.5rem 0.75rem',
            background: '#070a10',
            borderRadius: '6px',
            border: '1px solid var(--lab-border-subtle)',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--lab-text-muted)', textTransform: 'uppercase' }}>
            LECTURE PRESETS:
          </span>
          {Object.entries(PRESETS).map(([key, preset]) => (
            <TactileButton
              key={key}
              size="sm"
              variant={board.join('') === preset.board.join('') ? 'lime' : 'secondary'}
              onClick={() => {
                playClick('toggle');
                setBoard(preset.board);
                setMoveCount(0);
              }}
              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
            >
              {preset.name}
            </TactileButton>
          ))}
        </div>

        <div className="grid-2" style={{ alignItems: 'center' }}>
          {/* Mechanical Puzzle Board */}
          <div>
            <div
              className="puzzle-board"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '12px',
                background: 'linear-gradient(180deg, #090e18 0%, #05070c 100%)',
                border: '1px solid #1c2738',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                maxWidth: '340px',
                margin: '0 auto',
              }}
            >
              {board.map((tile, idx) => {
                const isBlank = tile === 0;
                const isCorrect = !isBlank && tile === GOAL_STATE[idx];
                const vec = getTileVector(tile);

                return (
                  <div
                    key={idx}
                    onClick={() => !isBlank && handleTileClick(idx)}
                    style={{
                      height: '92px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      userSelect: 'none',
                      cursor: isBlank ? 'default' : 'pointer',
                      position: 'relative',
                      background: isBlank
                        ? 'rgba(0,0,0,0.35)'
                        : isCorrect
                        ? 'linear-gradient(180deg, #132418 0%, #0c170f 100%)'
                        : 'linear-gradient(180deg, #172132 0%, #0f1622 100%)',
                      border: isBlank
                        ? '1px dashed #1e293b'
                        : isCorrect
                        ? '1px solid #34d399'
                        : '1px solid #273549',
                      boxShadow: isBlank
                        ? 'none'
                        : '0 4px 0 #070b10, inset 0 1px 0 rgba(255,255,255,0.12)',
                      transition: 'transform 0.1s ease',
                    }}
                    data-cursor-label={isBlank ? '' : `SLIDE_TILE_${tile}`}
                  >
                    {!isBlank && (
                      <>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.9rem',
                            fontWeight: 700,
                            color: isCorrect ? '#C6F277' : '#F1F5F9',
                            lineHeight: 1,
                          }}
                        >
                          {tile}
                        </span>

                        {/* Manhattan Vector Indicator Badge */}
                        {vec && (
                          <div
                            style={{
                              marginTop: '4px',
                              fontSize: '9px',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: isCorrect ? '#34d399' : '#E9B777',
                              background: 'rgba(0,0,0,0.4)',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {isCorrect ? '✓ IN GOAL' : `d=${vec.dist}`}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
              <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--lab-text-muted)' }}>
                MOVES: <strong style={{ color: '#C6F277' }}>{moveCount}</strong> // CLICK NEIGHBORING TILE TO SLIDE
              </span>
            </div>

            {isSolved && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.65rem',
                  borderRadius: '6px',
                  background: 'rgba(198, 242, 119, 0.12)',
                  border: '1px solid var(--lab-accent-lime)',
                  color: '#C6F277',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Puzzle Solved! Goal State achieved with h₁ = 0, h₂ = 0.</span>
              </div>
            )}
          </div>

          {/* Heuristic Evaluation Breakdown */}
          <div className="card" style={{ padding: '1.25rem', background: '#0a0f19', border: '1px solid #1a2537' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', fontFamily: 'var(--font-mono)', color: '#F1F5F9' }}>
                HEURISTIC DUAL ANALYZER
              </span>
              <StatusLed status={h2 >= h1 ? 'active' : 'danger'} label="Dominance Verified" />
            </div>

            {/* h1 Misplaced Card */}
            <div
              style={{
                background: '#070a11',
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                marginBottom: '0.75rem',
                borderLeft: '3px solid var(--lab-accent-cyan)',
                border: '1px solid #162232',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#F1F5F9' }}>
                  h₁(n): Misplaced Tiles
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--lab-accent-cyan)',
                  }}
                >
                  {h1}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--lab-text-muted)', marginTop: '0.2rem' }}>
                Count of tiles not in goal position (excluding the blank). Admissible.
              </div>
            </div>

            {/* h2 Manhattan Card */}
            <div
              style={{
                background: '#070a11',
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                borderLeft: '3px solid var(--lab-accent-amber)',
                border: '1px solid #162232',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#F1F5F9' }}>
                  h₂(n): Manhattan Distance
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: 'var(--lab-accent-amber)',
                  }}
                >
                  {h2}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--lab-text-muted)', marginTop: '0.2rem' }}>
                Sum of horizontal &amp; vertical displacements to target cells. Admissible.
              </div>
            </div>

            {/* Dominance Theorem Box */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                background: h2 >= h1 ? 'rgba(198, 242, 119, 0.08)' : 'rgba(248, 113, 113, 0.08)',
                border: `1px solid ${h2 >= h1 ? 'rgba(198, 242, 119, 0.3)' : 'rgba(248, 113, 113, 0.3)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: h2 >= h1 ? '#C6F277' : '#f87171',
              }}
            >
              Dominance Theorem: h₂(n) &ge; h₁(n) &forall; n &implies; <strong>{h2} &ge; {h1}</strong> ({h2 >= h1 ? 'HOLDS ✓' : 'VIOLATION ✗'})
            </div>

            {/* Tile-by-Tile Vector Breakdown */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--lab-text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                INDIVIDUAL TILE MANHATTAN DELTAS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {tileDetails.map(({ tile, dist }) => (
                  <span
                    key={tile}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.72rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '4px',
                      border: '1px solid var(--lab-border-subtle)',
                      color: dist === 0 ? 'var(--lab-accent-lime)' : 'var(--lab-text-secondary)',
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

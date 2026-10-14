import React, { useState, useMemo } from 'react';
import { RotateCcw, Zap, Info } from 'lucide-react';

type Player = 'X' | 'O';
type CellValue = Player | null;

interface LineInfo {
  name: string;
  indices: [number, number, number];
  oCount: number;
  xCount: number;
  availableForO: boolean;
  availableForX: boolean;
}

const WINNING_LINES: [number, number, number][] = [
  [0, 1, 2], // row 0
  [3, 4, 5], // row 1
  [6, 7, 8], // row 2
  [0, 3, 6], // col 0
  [1, 4, 7], // col 1
  [2, 5, 8], // col 2
  [0, 4, 8], // main diagonal
  [2, 4, 6], // anti diagonal
];

const LINE_NAMES = [
  'Top Row (0-1-2)',
  'Center Row (3-4-5)',
  'Bottom Row (6-7-8)',
  'Left Column (0-3-6)',
  'Center Column (1-4-7)',
  'Right Column (2-5-8)',
  'Main Diagonal (0-4-8)',
  'Anti-Diagonal (2-4-6)',
];

export const TicTacToeMinimaxVisualizer: React.FC = () => {
  // Board cells 0..8
  const [board, setBoard] = useState<CellValue[]>([
    null, 'X', null,
    null, 'O', null,
    null, null, null,
  ]); // Default to Slide 61 position!
  const [turn, setTurn] = useState<Player>('O'); // MAX is O in slide 61
  const [searchDepth, setSearchDepth] = useState<number>(3);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [lastAIMoveNote, setLastAIMoveNote] = useState<string>(
    'Slide 61 initial setup loaded. MAX (O) is at center (1,1); MIN (X) is at top-middle (0,1).'
  );

  // Check terminal state
  const winner = useMemo<Player | 'TIE' | null>(() => {
    for (const [a, b, c] of WINNING_LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    if (board.every((cell) => cell !== null)) {
      return 'TIE';
    }
    return null;
  }, [board]);

  // Evaluate lines according to Slide 61 specification
  const lineEvaluations = useMemo<LineInfo[]>(() => {
    return WINNING_LINES.map(([a, b, c], idx) => {
      const cells = [board[a], board[b], board[c]];
      const oCount = cells.filter((c) => c === 'O').length;
      const xCount = cells.filter((c) => c === 'X').length;

      // Available for O if no X is present in the line
      const availableForO = xCount === 0;
      // Available for X if no O is present in the line
      const availableForX = oCount === 0;

      return {
        name: LINE_NAMES[idx],
        indices: [a, b, c],
        oCount,
        xCount,
        availableForO,
        availableForX,
      };
    });
  }, [board]);

  const oPossibleLines = lineEvaluations.filter((l) => l.availableForO).length;
  const xPossibleLines = lineEvaluations.filter((l) => l.availableForX).length;

  // Exact Slide 61 evaluation score
  const heuristicScore = useMemo(() => {
    if (winner === 'O') return +1000;
    if (winner === 'X') return -1000;
    if (winner === 'TIE') return 0;
    return oPossibleLines - xPossibleLines;
  }, [winner, oPossibleLines, xPossibleLines]);

  // Slide 61 Minimax Alpha-Beta Evaluation Function
  function evaluateBoard(b: CellValue[]): number {
    for (const [a, bIdx, c] of WINNING_LINES) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return b[a] === 'O' ? 1000 : -1000;
      }
    }
    if (b.every((c) => c !== null)) return 0;

    let oLines = 0;
    let xLines = 0;
    for (const [a, bIdx, c] of WINNING_LINES) {
      const cells = [b[a], b[bIdx], b[c]];
      const hasX = cells.includes('X');
      const hasO = cells.includes('O');
      if (!hasX) oLines++;
      if (!hasO) xLines++;
    }
    return oLines - xLines;
  }

  // Alpha-Beta Minimax search to specified depth
  function minimaxAlphaBeta(
    b: CellValue[],
    depth: number,
    isMax: boolean,
    alpha: number,
    beta: number
  ): { score: number; move?: number; nodes: number } {
    const score = evaluateBoard(b);
    if (depth === 0 || Math.abs(score) >= 900 || b.every((c) => c !== null)) {
      return { score, nodes: 1 };
    }

    let nodes = 1;
    let bestMove: number | undefined = undefined;

    if (isMax) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = 'O';
          const res = minimaxAlphaBeta(b, depth - 1, false, alpha, beta);
          b[i] = null;
          nodes += res.nodes;

          if (res.score > maxScore) {
            maxScore = res.score;
            bestMove = i;
          }
          alpha = Math.max(alpha, maxScore);
          if (alpha >= beta) break; // Prune
        }
      }
      return { score: maxScore, move: bestMove, nodes };
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = 'X';
          const res = minimaxAlphaBeta(b, depth - 1, true, alpha, beta);
          b[i] = null;
          nodes += res.nodes;

          if (res.score < minScore) {
            minScore = res.score;
            bestMove = i;
          }
          beta = Math.min(beta, minScore);
          if (alpha >= beta) break; // Prune
        }
      }
      return { score: minScore, move: bestMove, nodes };
    }
  }

  // Execute AI move
  const triggerAIMove = () => {
    if (winner) return;
    setIsThinking(true);

    setTimeout(() => {
      const isMax = turn === 'O';
      const result = minimaxAlphaBeta(
        [...board],
        searchDepth,
        isMax,
        -Infinity,
        Infinity
      );

      if (result.move !== undefined) {
        const nextBoard = [...board];
        nextBoard[result.move] = turn;
        setBoard(nextBoard);

        const r = Math.floor(result.move / 3);
        const c = result.move % 3;
        setLastAIMoveNote(
          `AI (${turn}) chose cell (${r}, ${c}) [Index ${result.move}] with backed-up evaluation score ${result.score}. Searched ${result.nodes} nodes to depth ${searchDepth}.`
        );
        setTurn(turn === 'O' ? 'X' : 'O');
      }
      setIsThinking(false);
    }, 250);
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] !== null || winner) return;
    const next = [...board];
    next[idx] = turn;
    setBoard(next);
    setTurn(turn === 'O' ? 'X' : 'O');
  };

  const handleResetSlide61 = () => {
    setBoard([
      null, 'X', null,
      null, 'O', null,
      null, null, null,
    ]);
    setTurn('O');
    setLastAIMoveNote(
      'Reset to Slide 61: MAX (O) at (1,1); MIN (X) at (0,1). Turn of MAX (O).'
    );
  };

  const handleClearBoard = () => {
    setBoard(Array(9).fill(null));
    setTurn('O');
    setLastAIMoveNote('Empty board initialized. MAX (O) to move.');
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-emerald font-mono" style={{ fontSize: '0.7rem' }}>
              EXAM PROBLEM #1 SIMULATOR
            </span>
            <span className="badge badge-indigo font-mono" style={{ fontSize: '0.7rem' }}>
              SLIDE 61
            </span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            Tic-Tac-Toe Line-Counting Minimax Laboratory
          </h4>
        </div>

        {/* Preset buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleResetSlide61} className="btn-tactile btn-sm btn-primary">
            Load Slide 61 Position
          </button>
          <button onClick={handleClearBoard} className="btn-tactile btn-sm">
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Main Grid & Evaluation Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Left: 3x3 Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 75px)',
              gridTemplateRows: 'repeat(3, 75px)',
              gap: '6px',
              background: '#1e293b',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid #334155',
            }}
          >
            {board.map((cell, idx) => {
              const r = Math.floor(idx / 3);
              const c = idx % 3;
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={cell !== null || !!winner}
                  style={{
                    background: '#0b0f19',
                    border: '1px solid #334155',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: cell === 'O' ? '#38bdf8' : cell === 'X' ? '#f43f5e' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: cell === null && !winner ? 'pointer' : 'default',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  title={`Cell (${r}, ${c})`}
                >
                  {cell}
                  {cell === null && (
                    <span style={{ position: 'absolute', bottom: 3, right: 4, fontSize: '0.55rem', color: '#475569', fontFamily: 'monospace' }}>
                      {r},{c}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Turn & Status Indicator */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            {winner ? (
              <div style={{ fontWeight: 800, fontSize: '1rem', color: winner === 'O' ? '#38bdf8' : winner === 'X' ? '#f43f5e' : '#fbbf24' }}>
                {winner === 'TIE' ? 'GAME TIED' : `WINNER: PLAYER ${winner}!`}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Next Turn: <strong style={{ color: turn === 'O' ? '#38bdf8' : '#f43f5e' }}>{turn} ({turn === 'O' ? 'MAX' : 'MIN'})</strong>
              </div>
            )}
          </div>

          {/* AI Trigger Button */}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={triggerAIMove}
              disabled={!!winner || isThinking}
              className="btn-tactile btn-sm btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem' }}
            >
              <Zap size={14} />
              <span>{isThinking ? 'Searching...' : `Execute AI Move as ${turn}`}</span>
            </button>
          </div>
        </div>

        {/* Right: Slide 61 Evaluation Formula & Line Inspector */}
        <div style={{ background: '#070b14', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Slide 61 Evaluation Formula</span>
            <span className="badge badge-cyan font-mono">
              Eval(s) = {heuristicScore > 0 ? `+${heuristicScore}` : heuristicScore}
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', fontFamily: 'monospace' }}>
            Eval(s) = (Lines for O) - (Lines for X) = {oPossibleLines} - {xPossibleLines} = {heuristicScore}
          </div>

          {/* 8-Line Breakdown Table */}
          <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '0.72rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ background: '#0f172a', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '4px 8px' }}>Line</th>
                  <th style={{ padding: '4px 8px' }}>O Open?</th>
                  <th style={{ padding: '4px 8px' }}>X Open?</th>
                </tr>
              </thead>
              <tbody>
                {lineEvaluations.map((line, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '4px 8px', color: '#e2e8f0' }}>{line.name}</td>
                    <td style={{ padding: '4px 8px', color: line.availableForO ? '#38bdf8' : '#475569' }}>
                      {line.availableForO ? 'YES (+1)' : 'Blocked'}
                    </td>
                    <td style={{ padding: '4px 8px', color: line.availableForX ? '#f43f5e' : '#475569' }}>
                      {line.availableForX ? 'YES (-1)' : 'Blocked'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Depth Slider */}
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Search Depth:</span>
            <input
              type="range"
              min="1"
              max="9"
              value={searchDepth}
              onChange={(e) => setSearchDepth(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#38bdf8' }}
            />
            <span className="badge badge-indigo font-mono" style={{ fontSize: '0.75rem' }}>
              Depth {searchDepth}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Log */}
      <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#070b14', borderRadius: 'var(--radius-sm)', border: '1px solid #1e293b', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Info size={16} color="var(--lab-accent-cyan)" />
        <span style={{ fontFamily: 'var(--font-mono)' }}>{lastAIMoveNote}</span>
      </div>
    </div>
  );
};

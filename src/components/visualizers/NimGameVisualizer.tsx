import React, { useState, useMemo } from 'react';
import { Flame, Zap } from 'lucide-react';

export const NimGameVisualizer: React.FC = () => {
  // Rows of matchsticks
  const [rows, setRows] = useState<number[]>([3, 2]); // Situation B default
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [turn, setTurn] = useState<'player' | 'ai'>('player');
  const [historyLog, setHistoryLog] = useState<string[]>([
    'Game loaded: Situation B (Row 1: 3 matches, Row 2: 2 matches). Turn of Player (MAX).',
  ]);

  const totalMatches = rows.reduce((acc, count) => acc + count, 0);

  // Misère NIM: The player who takes the last match LOSES.
  // Hence, leaving 0 matches means you just took the last match and LOST.
  const gameOver = totalMatches === 0;
  const loser = gameOver ? (turn === 'player' ? 'ai' : 'player') : null; // Who took the last match
  const winner = gameOver ? (loser === 'player' ? 'ai' : 'player') : null;

  // Minimax optimal solver for Misère NIM
  // State: string key e.g. "2,2"
  const isWinningPosition = useMemo(() => {
    // Normal nim-sum check adjusted for misère endgame:
    // If all remaining rows have size <= 1, winning condition is odd number of 1s.
    // Otherwise, winning condition is nim-sum != 0.
    const allOnesOrZero = rows.every((r) => r <= 1);
    if (allOnesOrZero) {
      const onesCount = rows.filter((r) => r === 1).length;
      return onesCount % 2 === 0; // If even number of 1s, next player takes one and leaves odd, forcing opponent
    } else {
      const nimSum = rows.reduce((acc, r) => acc ^ r, 0);
      return nimSum !== 0;
    }
  }, [rows]);

  // Compute best move for AI
  function computeBestAIMove(currentRows: number[]): { row: number; count: number } {
    // Test all valid moves
    const candidateMoves: { row: number; count: number; leadsToLossForOpponent: boolean }[] = [];

    for (let r = 0; r < currentRows.length; r++) {
      for (let take = 1; take <= currentRows[r]; take++) {
        const nextRows = [...currentRows];
        nextRows[r] -= take;

        // Check if nextRows is a losing position for the opponent
        const allSmall = nextRows.every((x) => x <= 1);
        let opponentLoses = false;

        if (allSmall) {
          const ones = nextRows.filter((x) => x === 1).length;
          // In misère play, leaving an odd number of 1s (and 0s) means opponent must take 1, eventually taking the last match!
          opponentLoses = ones % 2 === 1;
        } else {
          const xorSum = nextRows.reduce((acc, x) => acc ^ x, 0);
          opponentLoses = xorSum === 0;
        }

        candidateMoves.push({ row: r, count: take, leadsToLossForOpponent: opponentLoses });
      }
    }

    const winningMove = candidateMoves.find((m) => m.leadsToLossForOpponent);
    if (winningMove) {
      return { row: winningMove.row, count: winningMove.count };
    }

    // If in a losing position, take 1 match from the largest row
    let maxIdx = 0;
    let maxVal = currentRows[0];
    for (let i = 1; i < currentRows.length; i++) {
      if (currentRows[i] > maxVal) {
        maxVal = currentRows[i];
        maxIdx = i;
      }
    }
    return { row: maxIdx, count: 1 };
  }

  // Handle human move
  const handleTakeMatches = () => {
    if (selectedRow === null || selectedCount === 0 || gameOver || turn !== 'player') return;

    const nextRows = [...rows];
    nextRows[selectedRow] -= selectedCount;
    setRows(nextRows);

    const logEntry = `Player removed ${selectedCount} match(es) from Row ${selectedRow + 1}. Remaining: (${nextRows.join(', ')}).`;
    setHistoryLog((prev) => [logEntry, ...prev.slice(0, 5)]);

    setSelectedRow(null);
    setSelectedCount(0);
    setTurn('ai');

    // Trigger AI response
    if (nextRows.reduce((a, b) => a + b, 0) > 0) {
      setTimeout(() => {
        const aiMove = computeBestAIMove(nextRows);
        const afterAIMove = [...nextRows];
        afterAIMove[aiMove.row] -= aiMove.count;
        setRows(afterAIMove);

        const aiLog = `AI removed ${aiMove.count} match(es) from Row ${aiMove.row + 1}. Remaining: (${afterAIMove.join(', ')}).`;
        setHistoryLog((prev) => [aiLog, ...prev.slice(0, 5)]);
        setTurn('player');
      }, 700);
    }
  };

  const handleSelectSituationA = () => {
    setRows([2, 2]);
    setSelectedRow(null);
    setSelectedCount(0);
    setTurn('player');
    setHistoryLog(['Loaded Situation A: (2, 2) [|| / ||]. Note: This is a proven second-player win!']);
  };

  const handleSelectSituationB = () => {
    setRows([3, 2]);
    setSelectedRow(null);
    setSelectedCount(0);
    setTurn('player');
    setHistoryLog(['Loaded Situation B: (3, 2) [||| / ||]. First player (MAX) can win by taking 1 from Row 1!']);
  };

  const handleCustom3Row = () => {
    setRows([1, 3, 5]);
    setSelectedRow(null);
    setSelectedCount(0);
    setTurn('player');
    setHistoryLog(['Loaded Classical 3-Row NIM: (1, 3, 5).']);
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-medium)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-amber font-mono" style={{ fontSize: '0.7rem' }}>
              EXAM PROBLEM #2 SIMULATOR
            </span>
            <span className="badge badge-cyan font-mono" style={{ fontSize: '0.7rem' }}>
              SLIDE 62 · MISÈRE PLAY
            </span>
          </div>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
            The Game of NIM: Minimax Game Tree Simulator
          </h4>
        </div>

        {/* Presets */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleSelectSituationA} className={`btn-tactile btn-sm ${rows.join(',') === '2,2' ? 'btn-primary' : ''}`}>
            Situation A: (2, 2)
          </button>
          <button onClick={handleSelectSituationB} className={`btn-tactile btn-sm ${rows.join(',') === '3,2' ? 'btn-primary' : ''}`}>
            Situation B: (3, 2)
          </button>
          <button onClick={handleCustom3Row} className={`btn-tactile btn-sm ${rows.join(',') === '1,3,5' ? 'btn-primary' : ''}`}>
            Classic: (1, 3, 5)
          </button>
        </div>
      </div>

      {/* Main Playing Field */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.25rem' }}>
        {/* Matchstick Rows Field */}
        <div style={{ background: '#070b14', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid #1e293b' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Click matchsticks in a single row to select:</span>
            <span style={{ fontWeight: 700, color: turn === 'player' ? '#38bdf8' : '#f59e0b' }}>
              Current Turn: {turn === 'player' ? 'PLAYER' : 'AI CALCULATING...'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {rows.map((count, rIdx) => {
              const isRowSelected = selectedRow === rIdx;

              return (
                <div key={rIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ width: '60px', fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
                    Row {rIdx + 1} ({count}):
                  </span>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', minHeight: '65px' }}>
                    {count === 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>(empty)</span>
                    )}

                    {Array.from({ length: count }).map((_, mIdx) => {
                      const isMatchSelected = isRowSelected && mIdx >= count - selectedCount;

                      return (
                        <div
                          key={mIdx}
                          onClick={() => {
                            if (turn !== 'player' || gameOver) return;
                            setSelectedRow(rIdx);
                            setSelectedCount(count - mIdx);
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: turn === 'player' && !gameOver ? 'pointer' : 'default',
                            transform: isMatchSelected ? 'translateY(-10px)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                          title={`Click to remove ${count - mIdx} match(es)`}
                        >
                          {/* Phosphor Match Head */}
                          <div
                            style={{
                              width: '10px',
                              height: '14px',
                              borderRadius: '50% 50% 30% 30%',
                              background: isMatchSelected ? '#f59e0b' : '#ef4444',
                              boxShadow: isMatchSelected ? '0 0 10px #f59e0b' : 'none',
                            }}
                          />
                          {/* Wooden Match Stick */}
                          <div
                            style={{
                              width: '4px',
                              height: '45px',
                              background: isMatchSelected ? '#fde68a' : '#d4a373',
                              borderRadius: '1px',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Move Button */}
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handleTakeMatches}
              disabled={selectedRow === null || selectedCount === 0 || turn !== 'player' || gameOver}
              className="btn-tactile btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1.25rem' }}
            >
              <Flame size={14} />
              <span>
                {selectedRow !== null && selectedCount > 0
                  ? `Remove ${selectedCount} from Row ${selectedRow + 1}`
                  : 'Select Matches to Remove'}
              </span>
            </button>

            {gameOver && (
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: winner === 'player' ? '#10b981' : '#f43f5e' }}>
                {winner === 'player' ? 'YOU WIN! (AI took last match)' : 'AI WINS! (You took last match)'}
              </div>
            )}
          </div>
        </div>

        {/* Minimax Mathematical Theory & NIM-Sum Inspector */}
        <div style={{ background: '#0b0f19', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid #1e293b' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16} color="var(--lab-accent-cyan)" />
            <span>Slide 62 Minimax Theory Inspector</span>
          </div>

          {/* Winning Position Status */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: isWinningPosition ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${isWinningPosition ? '#059669' : '#b91c1c'}`,
              marginBottom: '0.75rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isWinningPosition ? '#34d399' : '#f87171' }}>
              {isWinningPosition ? 'WINNING POSITION (P-Position)' : 'LOSING POSITION (N-Position)'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
              {isWinningPosition
                ? 'The current active player has a guaranteed forced win under optimal Minimax play.'
                : 'With optimal counter-play, the active player is forced to lose (e.g. state (2, 2)).'}
            </div>
          </div>

          {/* Key Findings from Problem #2 */}
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              <strong>Situation A (2, 2)</strong>: Any move by Player 1 leaves either $(0, 2)$ or $(1, 2)$. Player 2 responds by leaving $(0, 1)$ or $(1, 0)$, forcing Player 1 to take the final match. <em>Result: Second-player win.</em>
            </p>
            <p style={{ margin: 0 }}>
              <strong>Situation B (3, 2)</strong>: Player 1 removes 1 match from Row 1 $\to (2, 2)$, forcing Player 2 into the losing state of Situation A! <em>Result: First-player win.</em>
            </p>
          </div>

          {/* Activity Log */}
          <div style={{ marginTop: '0.75rem', borderTop: '1px solid #1e293b', paddingTop: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Moves:</span>
            <div style={{ maxHeight: '80px', overflowY: 'auto', fontSize: '0.72rem', fontFamily: 'monospace', color: '#cbd5e1', marginTop: '0.25rem' }}>
              {historyLog.map((log, i) => (
                <div key={i} style={{ marginBottom: '2px' }}>• {log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

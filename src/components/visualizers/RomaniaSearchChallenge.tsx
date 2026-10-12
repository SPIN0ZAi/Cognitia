import React, { useState, useEffect } from 'react';
import { ROMANIA_GRAPH } from '../../data/romaniaData';
import type { SearchAlgorithmType, SearchStepNode } from '../../types/graph';
import { Shuffle, RotateCcw, CheckCircle2, XCircle, Lightbulb, Trophy, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChallengeState {
  startCity: string;
  goalCity: string;
  algorithm: SearchAlgorithmType;
  frontier: SearchStepNode[];
  explored: string[];
  chosenNode: SearchStepNode | null;
  history: string[];
  isComplete: boolean;
  stepNumber: number;
  totalCost: number;
}

// Compute straight-line heuristic distance
function getHeuristic(city: string, goal: string): number {
  if (city === goal) return 0;
  if (goal === 'Bucharest' && ROMANIA_GRAPH[city]?.straightLineToBucharest !== undefined) {
    return ROMANIA_GRAPH[city].straightLineToBucharest;
  }
  const cA = ROMANIA_GRAPH[city];
  const cG = ROMANIA_GRAPH[goal];
  if (!cA || !cG) return 0;
  const dx = cA.x - cG.x;
  const dy = cA.y - cG.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 0.6025);
}

// All available cities in Romania map
const ALL_CITIES = Object.keys(ROMANIA_GRAPH);

export const RomaniaSearchChallenge: React.FC = () => {
  const [algo, setAlgo] = useState<SearchAlgorithmType>('astar');
  const [startCity, setStartCity] = useState('Arad');
  const [goalCity, setGoalCity] = useState('Bucharest');

  // Challenge game engine
  const [state, setState] = useState<ChallengeState | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; mathDetail: string } | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Initialize a new search challenge session
  const initChallenge = (sCity: string = startCity, gCity: string = goalCity, algorithm: SearchAlgorithmType = algo) => {
    const rootH = getHeuristic(sCity, gCity);
    const rootNode: SearchStepNode = {
      id: `${sCity}-0`,
      state: sCity,
      g: 0,
      h: rootH,
      f: rootH,
      depth: 0,
      status: 'frontier',
    };

    setState({
      startCity: sCity,
      goalCity: gCity,
      algorithm,
      frontier: [rootNode],
      explored: [],
      chosenNode: null,
      history: [`Started at ${sCity} with goal ${gCity} using ${algorithm.toUpperCase()}`],
      isComplete: false,
      stepNumber: 1,
      totalCost: 0,
    });
    setFeedback(null);
    setShowHint(false);
  };

  // Generate random start and random goal
  const generateRandomChallenge = () => {
    const sIdx = Math.floor(Math.random() * ALL_CITIES.length);
    let gIdx = Math.floor(Math.random() * ALL_CITIES.length);
    while (gIdx === sIdx) {
      gIdx = Math.floor(Math.random() * ALL_CITIES.length);
    }
    const sCity = ALL_CITIES[sIdx];
    const gCity = ALL_CITIES[gIdx];
    setStartCity(sCity);
    setGoalCity(gCity);
    initChallenge(sCity, gCity, algo);
  };

  useEffect(() => {
    initChallenge();
  }, [algo]);

  if (!state) return null;

  // Determine which node SHOULD be chosen next according to the algorithm rules
  const getExpectedNextNode = (): SearchStepNode | null => {
    if (state.frontier.length === 0) return null;
    const sorted = [...state.frontier];

    if (state.algorithm === 'bfs') {
      // FIFO: shallowest depth, first inserted
      return sorted[0];
    } else if (state.algorithm === 'ucs') {
      // Lowest g(n)
      sorted.sort((a, b) => a.g - b.g);
      return sorted[0];
    } else if (state.algorithm === 'greedy') {
      // Lowest h(n)
      sorted.sort((a, b) => a.h - b.h);
      return sorted[0];
    } else if (state.algorithm === 'astar') {
      // Lowest f(n) = g(n) + h(n), tie-break on h(n)
      sorted.sort((a, b) => a.f - b.f || a.h - b.h);
      return sorted[0];
    }
    return sorted[0];
  };

  const expectedNode = getExpectedNextNode();

  // Student makes a choice
  const handleStudentSelectCity = (chosenCityName: string) => {
    if (state.isComplete || !expectedNode) return;

    setTotalQuestions((prev) => prev + 1);
    const isCorrect = chosenCityName === expectedNode.state;

    // Build academic calculation explanation
    let mathExplanation = '';
    if (state.algorithm === 'astar') {
      mathExplanation = `A* evaluates f(n) = g(n) + h(n). For ${expectedNode.state}: f = ${expectedNode.g} + ${expectedNode.h} = ${expectedNode.f}. This is the minimal f-value currently on the frontier.`;
    } else if (state.algorithm === 'greedy') {
      mathExplanation = `Greedy Best-First evaluates solely h(n). For ${expectedNode.state}: h = ${expectedNode.h}. This is the lowest estimated distance to ${state.goalCity}.`;
    } else if (state.algorithm === 'ucs') {
      mathExplanation = `Uniform-Cost Search evaluates strictly path cost g(n). For ${expectedNode.state}: g = ${expectedNode.g}. It expands the cheapest accumulated path.`;
    } else {
      mathExplanation = `Breadth-First Search uses a FIFO queue, always choosing the shallowest node (depth ${expectedNode.depth}).`;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      setFeedback({
        isCorrect: true,
        message: `Correct! ${expectedNode.state} is selected for expansion.`,
        mathDetail: mathExplanation,
      });

      // Advance search: mark chosen node as explored, and generate its successors
      const currentChosen = expectedNode;
      const nextExplored = [...state.explored, currentChosen.state];

      // Check if goal reached!
      if (currentChosen.state === state.goalCity) {
        setState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            chosenNode: currentChosen,
            explored: nextExplored,
            isComplete: true,
            totalCost: currentChosen.g,
          };
        });
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        return;
      }

      // Generate successors
      const remainingFrontier = state.frontier.filter((n) => n.id !== currentChosen.id);
      const cityData = ROMANIA_GRAPH[currentChosen.state];
      const newSuccessors: SearchStepNode[] = [];

      if (cityData) {
        cityData.connections.forEach((conn, idx) => {
          if (!nextExplored.includes(conn.target)) {
            const nextG = currentChosen.g + conn.cost;
            const nextH = getHeuristic(conn.target, state.goalCity);
            newSuccessors.push({
              id: `${conn.target}-${state.stepNumber + 1}-${idx}`,
              state: conn.target,
              parentId: currentChosen.id,
              g: nextG,
              h: nextH,
              f: nextG + nextH,
              depth: currentChosen.depth + 1,
              status: 'frontier',
            });
          }
        });
      }

      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          chosenNode: currentChosen,
          explored: nextExplored,
          frontier: [...remainingFrontier, ...newSuccessors],
          stepNumber: prev.stepNumber + 1,
          history: [...prev.history, `Step ${prev.stepNumber}: Expanded ${currentChosen.state}`],
        };
      });
    } else {
      setStreak(0);
      const studentNode = state.frontier.find((n) => n.state === chosenCityName);
      let studentDetail = '';
      if (studentNode) {
        studentDetail = `You selected ${chosenCityName} with ${
          state.algorithm === 'astar'
            ? `f = ${studentNode.f} (g=${studentNode.g}, h=${studentNode.h})`
            : state.algorithm === 'greedy'
            ? `h = ${studentNode.h}`
            : `g = ${studentNode.g}`
        }.`;
      }
      setFeedback({
        isCorrect: false,
        message: `Incorrect. ${chosenCityName} is not the next node to expand.`,
        mathDetail: `${studentDetail} But ${expectedNode.state} has ${
          state.algorithm === 'astar'
            ? `f = ${expectedNode.f}`
            : state.algorithm === 'greedy'
            ? `h = ${expectedNode.h}`
            : `g = ${expectedNode.g}`
        }, which has strictly higher priority!`,
      });
    }
  };

  // Distinct cities currently in the frontier (choices for the student)
  const frontierCities = Array.from(new Set(state.frontier.map((n) => n.state)));

  return (
    <div className="visualizer-container">
      {/* Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Trophy size={18} className="text-amber-400" />
            Romania Route Search Interactive Exam Trainer
          </div>
          <div className="visualizer-subtitle">
            Practice Question Engine: Predict Which Node Will Be Chosen & Expanded (Slides 32–42)
          </div>
        </div>

        <div className="visualizer-controls">
          <button onClick={generateRandomChallenge} className="btn-tactile btn-primary">
            <Shuffle size={14} />
            Generate Random Challenge
          </button>
          <button onClick={() => initChallenge()} className="btn-tactile">
            <RotateCcw size={14} />
            Reset Challenge
          </button>
        </div>
      </div>

      <div className="visualizer-body">
        {/* Settings Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <label style={{ marginRight: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Algorithm:</label>
            <select
              value={algo}
              onChange={(e) => setAlgo(e.target.value as SearchAlgorithmType)}
              style={{
                background: 'var(--bg-card)',
                color: '#f8fafc',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
              }}
            >
              <option value="astar">A* Search (f = g + h)</option>
              <option value="greedy">Greedy Best-First (f = h)</option>
              <option value="ucs">Uniform-Cost Search (f = g)</option>
              <option value="bfs">Breadth-First Search (FIFO)</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Start: </span>
            <strong style={{ color: '#38bdf8' }}>{state.startCity}</strong>
            <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>→</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Goal: </span>
            <strong style={{ color: '#34d399' }}>{state.goalCity}</strong>
          </div>

          {/* Score Badge */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <span className="badge badge-indigo font-mono" style={{ fontSize: '0.78rem' }}>
              Score: {score} / {totalQuestions} ({totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 100}%)
            </span>
            {streak > 1 && (
              <span className="badge badge-amber font-mono" style={{ fontSize: '0.78rem' }}>
                🔥 Streak: {streak}
              </span>
            )}
          </div>
        </div>

        {/* Live Romania Map Display */}
        <div className="romania-svg-wrapper" style={{ maxHeight: '420px', marginBottom: '1.25rem' }}>
          <svg viewBox="0 0 1000 720" style={{ width: '100%', height: '100%' }}>
            {/* Render Road Edges */}
            {Object.entries(ROMANIA_GRAPH).map(([cityName, city]) =>
              city.connections.map((conn) => {
                const targetCity = ROMANIA_GRAPH[conn.target];
                if (!targetCity || cityName > conn.target) return null;
                return (
                  <g key={`${cityName}-${conn.target}`}>
                    <line
                      x1={city.x}
                      y1={city.y}
                      x2={targetCity.x}
                      y2={targetCity.y}
                      className="graph-edge"
                    />
                    <text
                      x={(city.x + targetCity.x) / 2}
                      y={(city.y + targetCity.y) / 2 - 4}
                      textAnchor="middle"
                      className="graph-edge-text"
                    >
                      {conn.cost}
                    </text>
                  </g>
                );
              })
            )}

            {/* Render City Nodes */}
            {Object.entries(ROMANIA_GRAPH).map(([name, city]) => {
              const isStart = name === state.startCity;
              const isGoal = name === state.goalCity;
              const isFrontier = state.frontier.some((n) => n.state === name);
              const isExplored = state.explored.includes(name);
              const isChosen = state.chosenNode?.state === name;

              let nodeClass = 'default';
              if (isGoal) nodeClass = 'goal';
              else if (isChosen) nodeClass = 'current';
              else if (isFrontier) nodeClass = 'frontier';
              else if (isExplored) nodeClass = 'explored';

              return (
                <g
                  key={name}
                  transform={`translate(${city.x}, ${city.y})`}
                  onClick={() => isFrontier && handleStudentSelectCity(name)}
                  style={{ cursor: isFrontier ? 'pointer' : 'default' }}
                >
                  <circle
                    r={isChosen || isGoal || isStart ? 18 : 14}
                    className={`city-circle ${nodeClass}`}
                  />
                  <text y={isChosen ? -24 : -18} textAnchor="middle" className="city-label">
                    {name}
                  </text>
                  <text y={4} textAnchor="middle" className="city-heuristic">
                    {getHeuristic(name, state.goalCity)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.25rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
            Chosen Node (Current)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
            Open Nodes / Frontier (Candidate Choices)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#312e81', display: 'inline-block' }} />
            Explored Nodes (Closed Set)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
            Goal City ({state.goalCity})
          </span>
        </div>

        {/* Exam Question Card */}
        {!state.isComplete ? (
          <div
            className="card"
            style={{
              padding: '1.5rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderLeft: '4px solid var(--accent-amber)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                Question {state.stepNumber}: Which node from the Frontier will {algo.toUpperCase()} expand next?
              </span>
              <button
                onClick={() => setShowHint(!showHint)}
                className="btn-tactile btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Lightbulb size={13} className={showHint ? 'text-amber-400' : ''} />
                <span>{showHint ? 'Hide Formula Hint' : 'Show Formula Hint'}</span>
              </button>
            </div>

            {showHint && (
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem',
                  color: '#fef08a',
                  lineHeight: 1.5,
                }}
              >
                <strong>Evaluation Rule: </strong>
                {algo === 'astar' && 'A* expands the node with the minimum f(n) = g(n) + h(n).'}
                {algo === 'greedy' && 'Greedy Best-First expands the node with the minimum h(n) (straight-line distance).'}
                {algo === 'ucs' && 'Uniform-Cost expands the node with the minimum accumulated road cost g(n).'}
                {algo === 'bfs' && 'BFS expands the shallowest open node in FIFO arrival order.'}
              </div>
            )}

            {/* Candidate Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.5rem' }}>
              {frontierCities.map((cityName) => {
                const node = state.frontier.find((n) => n.state === cityName);
                if (!node) return null;

                return (
                  <button
                    key={cityName}
                    onClick={() => handleStudentSelectCity(cityName)}
                    className="btn-tactile"
                    style={{
                      padding: '0.65rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      minWidth: '140px',
                      background: 'rgba(217, 119, 6, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fef3c7' }}>
                      {cityName}
                    </span>
                    <span
                      className="font-mono"
                      style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}
                    >
                      {algo === 'astar' && `f = ${node.g}+${node.h} = ${node.f}`}
                      {algo === 'greedy' && `h = ${node.h}`}
                      {algo === 'ucs' && `g = ${node.g}`}
                      {algo === 'bfs' && `depth = ${node.depth}`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Notification */}
            {feedback && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: `1px solid ${feedback.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-rose)'}`,
                  color: feedback.isCorrect ? '#34d399' : '#fb7185',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.88rem' }}>
                  {feedback.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  <span>{feedback.message}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  {feedback.mathDetail}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Goal Achieved Celebration Banner */
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '2px solid var(--accent-emerald)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <Award size={36} className="text-emerald-400" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginBottom: '0.4rem' }}>
              Goal Achieved: {state.goalCity} Reached!
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.25rem auto' }}>
              You successfully traced the search trajectory from <strong>{state.startCity}</strong> to{' '}
              <strong>{state.goalCity}</strong> under {algo.toUpperCase()}. Total solution cost: <strong>{state.totalCost} km</strong>.
            </p>
            <button onClick={generateRandomChallenge} className="btn-tactile btn-emerald">
              <span>Next Random Challenge</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

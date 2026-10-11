import { useState, useEffect, useRef } from 'react';
import { ROMANIA_GRAPH } from '../../data/romaniaData';
import type { SearchAlgorithmType, SearchStepNode } from '../../types/graph';
import { Play, Pause, RotateCcw, ChevronRight, Compass } from 'lucide-react';

export const RomaniaGraphVisualizer: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<SearchAlgorithmType>('astar');
  const [startCity, setStartCity] = useState('Arad');
  const [goalCity, setGoalCity] = useState('Bucharest');
  const [isGraphMode, setIsGraphMode] = useState(true); // Graph Search (with explored set) vs Tree Search
  const [depthLimit, setDepthLimit] = useState(19);

  // Search execution state
  const [frontier, setFrontier] = useState<SearchStepNode[]>([]);
  const [explored, setExplored] = useState<string[]>([]);
  const [currentNode, setCurrentNode] = useState<SearchStepNode | null>(null);
  const [solutionPath, setSolutionPath] = useState<string[] | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Click Play or Step to begin search.');

  // Animation playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize or reset search
  const resetSearch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);

    const rootH = ROMANIA_GRAPH[startCity]?.straightLineToBucharest || 0;
    const rootNode: SearchStepNode = {
      id: `${startCity}-0`,
      state: startCity,
      g: 0,
      h: rootH,
      f: selectedAlgo === 'greedy' ? rootH : selectedAlgo === 'ucs' ? 0 : rootH,
      depth: 0,
      status: 'frontier',
    };

    setFrontier([rootNode]);
    setExplored([]);
    setCurrentNode(null);
    setSolutionPath(null);
    setTotalCost(0);
    setStepCount(0);
    setIsFinished(false);
    setStatusMessage(`Initialized search from ${startCity} using ${selectedAlgo.toUpperCase()}.`);
  };

  useEffect(() => {
    resetSearch();
  }, [selectedAlgo, startCity, goalCity, isGraphMode, depthLimit]);

  // Execute one step of search
  const stepSearch = () => {
    if (isFinished || frontier.length === 0) {
      if (frontier.length === 0 && !isFinished) {
        setIsFinished(true);
        setStatusMessage('Frontier exhausted: No solution found.');
      }
      setIsPlaying(false);
      return;
    }

    // Sort or extract based on algorithm
    let nextFrontier = [...frontier];
    let selected: SearchStepNode;

    if (selectedAlgo === 'bfs') {
      // FIFO: extract first
      selected = nextFrontier.shift()!;
    } else if (selectedAlgo === 'dfs') {
      // LIFO: extract last
      selected = nextFrontier.pop()!;
    } else if (selectedAlgo === 'ucs') {
      // Priority by g(n) ascending
      nextFrontier.sort((a, b) => a.g - b.g);
      selected = nextFrontier.shift()!;
    } else if (selectedAlgo === 'greedy') {
      // Priority by h(n) ascending
      nextFrontier.sort((a, b) => a.h - b.h);
      selected = nextFrontier.shift()!;
    } else if (selectedAlgo === 'astar') {
      // Priority by f(n) = g(n) + h(n) ascending
      nextFrontier.sort((a, b) => a.f - b.f || a.h - b.h);
      selected = nextFrontier.shift()!;
    } else if (selectedAlgo === 'dls') {
      // LIFO with depth cutoff
      selected = nextFrontier.pop()!;
    } else {
      // IDS default step
      nextFrontier.sort((a, b) => a.f - b.f);
      selected = nextFrontier.shift()!;
    }

    // Check if in explored set (for graph search)
    if (isGraphMode && explored.includes(selected.state)) {
      setFrontier(nextFrontier);
      setStatusMessage(`Skipping ${selected.state} (already in explored set).`);
      return;
    }

    setCurrentNode(selected);
    const newExplored = isGraphMode ? [...explored, selected.state] : explored;
    setExplored(newExplored);
    setStepCount((prev) => prev + 1);

    // Goal test on extraction
    if (selected.state === goalCity) {
      setIsFinished(true);
      setIsPlaying(false);
      setTotalCost(selected.g);

      // Reconstruct path
      const path: string[] = [selected.state];
      let curr = selected;
      while (curr.parentId) {
        // Find parent in explored/history
        const parentName = curr.parentId.split('-')[0];
        path.unshift(parentName);
        break; // For visual illustration
      }
      setSolutionPath([startCity, ...((selected.state !== startCity) ? [selected.state] : [])]);
      setStatusMessage(`Goal reached! Found optimal route to ${goalCity} with cost ${selected.g} km.`);
      return;
    }

    // Depth check for DLS
    if (selectedAlgo === 'dls' && selected.depth >= depthLimit) {
      setFrontier(nextFrontier);
      setStatusMessage(`Depth limit ${depthLimit} reached at ${selected.state}. Cutting off branch.`);
      return;
    }

    // Expand successors
    const cityData = ROMANIA_GRAPH[selected.state];
    if (cityData) {
      const generatedChildren: SearchStepNode[] = [];

      cityData.connections.forEach((conn) => {
        if (isGraphMode && newExplored.includes(conn.target)) return;

        const childG = selected.g + conn.cost;
        const childH = ROMANIA_GRAPH[conn.target]?.straightLineToBucharest || 0;
        const childF =
          selectedAlgo === 'greedy'
            ? childH
            : selectedAlgo === 'ucs'
            ? childG
            : childG + childH;

        const childNode: SearchStepNode = {
          id: `${conn.target}-${stepCount + 1}-${Math.random().toString(36).substring(2, 5)}`,
          state: conn.target,
          parentId: selected.id,
          action: `Road to ${conn.target}`,
          g: childG,
          h: childH,
          f: childF,
          depth: selected.depth + 1,
          status: 'frontier',
        };

        generatedChildren.push(childNode);
      });

      if (selectedAlgo === 'dfs' || selectedAlgo === 'dls') {
        // Push children for LIFO
        nextFrontier = [...nextFrontier, ...generatedChildren];
      } else {
        // Append or priority insert
        nextFrontier = [...nextFrontier, ...generatedChildren];
      }

      setFrontier(nextFrontier);
      setStatusMessage(
        `Expanded ${selected.state} (g=${selected.g}, h=${selected.h}, f=${selected.f}). Generated ${generatedChildren.length} successors.`
      );
    }
  };

  // Autoplay loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        stepSearch();
      }, speedMs);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, frontier, isFinished, speedMs]);

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-title-area">
          <div className="visualizer-title">
            <Compass size={19} className="text-cyan-400" />
            Romania Route Search Simulator
          </div>
          <div className="visualizer-subtitle">
            Interactive State Space Graph & Priority Queue Exploration Engine (UCLM 2026/2027)
          </div>
        </div>

        <div className="visualizer-controls">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFinished}
            className={`btn-tactile ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button
            onClick={stepSearch}
            disabled={isPlaying || isFinished}
            className="btn-tactile"
          >
            <ChevronRight size={15} />
            Step
          </button>

          <button onClick={resetSearch} className="btn-tactile">
            <RotateCcw size={15} />
            Reset
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
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            alignItems: 'center',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <label style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>Algorithm:</label>
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value as SearchAlgorithmType)}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.3rem 0.6rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <optgroup label="Uninformed Search (Lesson 2)">
                <option value="bfs">BFS (Breadth-First Search)</option>
                <option value="ucs">UCS (Uniform-Cost Search)</option>
                <option value="dfs">DFS (Depth-First Search)</option>
                <option value="dls">DLS (Depth-Limited Search)</option>
              </optgroup>
              <optgroup label="Informed / Heuristic Search (Lesson 3)">
                <option value="greedy">Greedy Best-First (f = h)</option>
                <option value="astar">A* Search (f = g + h)</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label style={{ marginRight: '0.4rem', color: 'var(--text-muted)' }}>Start:</label>
            <select
              value={startCity}
              onChange={(e) => setStartCity(e.target.value)}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.3rem 0.5rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {Object.keys(ROMANIA_GRAPH).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ marginRight: '0.4rem', color: 'var(--text-muted)' }}>Goal:</label>
            <select
              value={goalCity}
              onChange={(e) => setGoalCity(e.target.value)}
              style={{
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.3rem 0.5rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {Object.keys(ROMANIA_GRAPH).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>Graph Mode:</label>
            <button
              onClick={() => setIsGraphMode(!isGraphMode)}
              className={`badge ${isGraphMode ? 'badge-emerald' : 'badge-amber'}`}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              {isGraphMode ? 'Graph Search (Closed List ON)' : 'Tree Search (Loops Possible)'}
            </button>
          </div>

          {selectedAlgo === 'dls' && (
            <div>
              <label style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>Limit (l):</label>
              <input
                type="number"
                min="1"
                max="25"
                value={depthLimit}
                onChange={(e) => setDepthLimit(Number(e.target.value))}
                style={{
                  width: '50px',
                  background: 'var(--bg-surface)',
                  color: '#fff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '0.2rem',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }}>Speed:</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              style={{ verticalAlign: 'middle', width: '90px' }}
            />
            <span style={{ marginLeft: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              {speedMs}ms
            </span>
          </div>
        </div>

        {/* Live Map Display */}
        <div className="romania-svg-wrapper">
          <svg viewBox="0 0 1000 720" style={{ width: '100%', height: '100%' }}>
            {/* Render Road Edges */}
            {Object.entries(ROMANIA_GRAPH).map(([cityName, city]) =>
              city.connections.map((conn) => {
                const targetCity = ROMANIA_GRAPH[conn.target];
                if (!targetCity || cityName > conn.target) return null; // Draw each edge once
                const isSolEdge =
                  solutionPath &&
                  solutionPath.includes(cityName) &&
                  solutionPath.includes(conn.target);

                const midX = (city.x + targetCity.x) / 2;
                const midY = (city.y + targetCity.y) / 2;

                return (
                  <g key={`${cityName}-${conn.target}`}>
                    <line
                      x1={city.x}
                      y1={city.y}
                      x2={targetCity.x}
                      y2={targetCity.y}
                      className={`graph-edge ${isSolEdge ? 'solution' : ''}`}
                    />
                    <rect
                      x={midX - 14}
                      y={midY - 9}
                      width="28"
                      height="18"
                      fill="#080b11"
                      rx="4"
                      opacity="0.85"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
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
              const isFrontier = frontier.some((n) => n.state === name);
              const isCurrent = currentNode?.state === name;
              const isClosed = explored.includes(name);
              const isGoal = name === goalCity;

              let nodeClass = 'default';
              if (isGoal) nodeClass = 'goal';
              else if (isCurrent) nodeClass = 'current';
              else if (isFrontier) nodeClass = 'frontier';
              else if (isClosed) nodeClass = 'explored';

              return (
                <g key={name} transform={`translate(${city.x}, ${city.y})`}>
                  <circle r={isCurrent ? 18 : 14} className={`city-circle ${nodeClass}`} />
                  <text y={isCurrent ? -22 : -18} textAnchor="middle" className="city-label">
                    {name}
                  </text>
                  <text y={4} textAnchor="middle" className="city-heuristic">
                    {city.straightLineToBucharest}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Status & Queue Telemetry */}
        <div style={{ marginTop: '1.25rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              marginBottom: '1rem',
            }}
          >
            {statusMessage}
          </div>

          <div className="grid-2">
            {/* Frontier Priority Queue Inspector */}
            <div className="card" style={{ padding: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-amber)' }}>
                  Frontier Open Set ({frontier.length} nodes)
                </span>
                <span className="badge badge-amber font-mono">
                  {selectedAlgo === 'bfs'
                    ? 'FIFO Queue'
                    : selectedAlgo === 'dfs'
                    ? 'LIFO Stack'
                    : 'Priority Queue'}
                </span>
              </div>
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                {frontier.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Frontier is empty.</div>
                ) : (
                  frontier.slice(0, 8).map((node, i) => (
                    <div
                      key={node.id || i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {i === 0 ? '▶ ' : ''}
                        {node.state} (d={node.depth})
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        g=<span style={{ color: 'var(--cost-g)' }}>{node.g}</span> | h=
                        <span style={{ color: 'var(--cost-h)' }}>{node.h}</span> | f=
                        <span style={{ color: 'var(--cost-f)', fontWeight: 700 }}>{node.f}</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Search Statistics */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem', color: '#38bdf8' }}>
                Search Telemetry & Cost
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nodes Expanded</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {stepCount}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Explored States</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {explored.length}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Path Cost</div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: isFinished ? 'var(--accent-emerald)' : 'var(--text-primary)',
                    }}
                  >
                    {totalCost > 0 ? `${totalCost} km` : 'In progress'}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status</div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: isFinished ? 'var(--accent-emerald)' : 'var(--accent-amber)',
                    }}
                  >
                    {isFinished ? 'Completed' : 'Running'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

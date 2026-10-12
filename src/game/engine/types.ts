/**
 * Cognitia Chase: Maze Agents — Core Engine Types
 */

export type TileType =
  | 'wall'       // Impassable circuit barrier
  | 'empty'      // Walkable open path (cleared)
  | 'pellet'     // Standard knowledge node (cost 1 to traverse, +10 pts)
  | 'power'      // Super Inversion node (cost 1 to traverse, +50 pts, frightens ghosts)
  | 'mud'        // High-friction obstacle (cost 3 to traverse, slows down)
  | 'ice';       // Low-friction superconductor (cost 0.5 to traverse, fast)

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface GridCoord {
  x: number;
  y: number;
}

export interface EntityPosition {
  tileX: number;
  tileY: number;
  subX: number; // 0.0 to 1.0 within tile for smooth interpolation
  subY: number;
}

export type GhostPersonality =
  | 'bfs'     // The Wave: expands layer by layer, fewest hops
  | 'ucs'     // The Miser: cost-sensitive, avoids mud, favors ice
  | 'dfs'     // The Plunger: dives deep down corridors, easily tricked
  | 'greedy'  // The Gambler: h(n) pure seeker, gets trapped in dead-ends
  | 'astar';  // The Strategist: optimal g + h balancer

export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eaten';

export interface GhostTelemetry {
  algorithm: GhostPersonality;
  name: string;
  codename: string;
  accentColor: string;
  currentTile: GridCoord;
  targetTile: GridCoord;
  currentPath: GridCoord[];
  frontierTiles: GridCoord[];
  exploredTiles: GridCoord[];
  nodesExpanded: number;
  nodesGenerated: number;
  currentG: number;
  currentH: number;
  currentF: number;
  heuristicType: 'manhattan' | 'euclidean' | 'inadmissible';
  calculationTimeMs: number;
}

export interface GhostEntity {
  id: string;
  personality: GhostPersonality;
  name: string;
  codename: string;
  color: string;
  x: number; // floating tile coordinate
  y: number;
  targetTile: GridCoord;
  dir: Direction;
  nextDir: Direction;
  speed: number; // tiles per second
  mode: GhostMode;
  frightenedTimer: number;
  path: GridCoord[];
  telemetry: GhostTelemetry;
}

export interface PlayerEntity {
  x: number; // floating tile coordinate
  y: number;
  dir: Direction;
  nextDir: Direction;
  speed: number;
  lives: number;
  invulnerableTimer: number;
}

export type GameEngineState =
  | 'ready'
  | 'running'
  | 'paused'
  | 'player_caught'
  | 'level_cleared'
  | 'game_over';

export type GameMode =
  | 'campaign'    // Micro-lessons + gating quizzes per algorithm
  | 'ghost_lab'   // Algorithm sandbox + heuristic experiments
  | 'be_the_agent'// Student solves path; compared against A* / BFS
  | 'arcade';     // Endless survival score-chase

export interface CampaignLevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  lessonId: string;
  description: string;
  enemies: GhostPersonality[];
  mazeLayout: string[];
  mudAllowed: boolean;
  iceAllowed: boolean;
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

/**
 * Cognitia Chase: Maze Agents — Core Engine Types
 * 
 * Supports both Authentic 1980 Arcade Pac-Man Dossier rules (Blinky, Pinky, Inky, Clyde)
 * and Course Algorithm Search Mode (The Wave, The Miser, The Plunger, The Gambler, The Strategist).
 */

export type TileType =
  | 'wall'       // Impassable outer or interior maze wall
  | 'empty'      // Walkable cleared path
  | 'pellet'     // Standard dot (+10 pts, 1 frame pause)
  | 'power'      // Energizer / Power pellet (+50 pts, 3 frames pause, frightens ghosts)
  | 'door'       // Ghost house permeable door (permeable to ghosts, blocked to player)
  | 'mud'        // High-friction obstacle (cost 3 to traverse, used in algorithm mode)
  | 'ice';       // Low-friction superconductor (cost 0.5 to traverse, used in algorithm mode)

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface GridCoord {
  x: number;
  y: number;
}

export type ClassicGhostId = 'blinky' | 'pinky' | 'inky' | 'clyde';
export type AlgoGhostId = 'bfs' | 'ucs' | 'dfs' | 'greedy' | 'astar';
export type GhostPersonality = ClassicGhostId | AlgoGhostId;

export type GhostMode = 'chase' | 'scatter' | 'frightened' | 'eaten' | 'house';

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
  x: number; // floating tile coordinate (sub-tile precision)
  y: number;
  targetTile: GridCoord;
  scatterTile: GridCoord;
  dir: Direction;
  nextDir: Direction;
  speed: number; // tiles per second
  mode: GhostMode;
  frightenedTimer: number;
  inHouse: boolean;
  dotCounter: number;
  cruiseElroy: number; // 0 = off, 1 = elroy 1, 2 = elroy 2
  path: GridCoord[];
  telemetry: GhostTelemetry;
}

export interface PlayerEntity {
  x: number; // floating tile coordinate (sub-tile precision)
  y: number;
  dir: Direction;
  nextDir: Direction; // buffered pre-turn direction for corner-cutting
  speed: number;
  lives: number;
  invulnerableTimer: number;
  eatPauseFrames: number; // 1 frame per dot, 3 frames per energizer
}

export interface BonusFruitEntity {
  active: boolean;
  tile: GridCoord;
  type: 'cherry' | 'strawberry' | 'peach' | 'apple' | 'melon' | 'galaxian' | 'bell' | 'key';
  points: number;
  timer: number; // remaining display time in seconds
  collected: boolean;
}

export type GameEngineState =
  | 'ready'          // READY! intro sequence
  | 'running'        // Active gameplay
  | 'paused'         // Game paused
  | 'player_caught'  // Death animation sequence
  | 'level_cleared'  // Level flashed & completed
  | 'game_over';     // Game over

export type GameMode =
  | 'campaign'       // Micro-lessons + gating quizzes per algorithm
  | 'ghost_lab'      // Algorithm sandbox + heuristic experiments
  | 'be_the_agent'   // Student solves path; compared against A* / BFS
  | 'arcade';        // Classic endless arcade chase

export type TargetingMode = 'classic' | 'algorithm';

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

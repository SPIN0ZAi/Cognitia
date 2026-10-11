export interface CityNode {
  name: string;
  x: number; // SVG percentage or pixels
  y: number;
  straightLineToBucharest: number; // h(n) from slide tables
  connections: { target: string; cost: number }[];
}

export interface SearchStepNode {
  id: string;
  state: string;
  parentId?: string;
  action?: string;
  g: number;
  h: number;
  f: number;
  depth: number;
  status: 'frontier' | 'expanded' | 'current' | 'solution';
}

export interface SearchAlgorithmState {
  currentStepIndex: number;
  frontier: SearchStepNode[];
  explored: string[]; // State strings
  currentNode: SearchStepNode | null;
  solutionPath: string[] | null;
  totalCost: number;
  isComplete: boolean;
  message: string;
}

export type SearchAlgorithmType =
  | 'bfs'
  | 'ucs'
  | 'dfs'
  | 'dls'
  | 'ids'
  | 'greedy'
  | 'astar';

export type EightPuzzleBoard = number[]; // 0 represents the blank gap, array length 9

export interface EightPuzzleStep {
  board: EightPuzzleBoard;
  action: string;
  g: number;
  h1: number;
  h2: number;
  f: number;
  depth: number;
}

/**
 * Cognitia — Generic Graph Search Engine
 * 
 * Unified, deterministic implementation of search algorithms:
 * - Breadth-First Search (BFS)
 * - Uniform Cost Search (UCS / Dijkstra)
 * - Depth-First Search (DFS)
 * - Depth-Limited Search (DLS)
 * - Greedy Best-First Search
 * - A* Search
 * 
 * Shared between:
 * 1. Course visualizers (RomaniaGraphVisualizer, RomaniaSearchChallenge)
 * 2. "Cognitia Chase" Maze Agents (The Wave, The Miser, The Plunger, The Gambler, The Strategist)
 * 3. Ghost Lab heuristic experiments (admissible vs inadmissible heuristics)
 */

export type SearchAlgorithmType =
  | 'bfs'
  | 'ucs'
  | 'dfs'
  | 'dls'
  | 'greedy'
  | 'astar';

export interface SearchSuccessor<TState> {
  state: TState;
  action?: string;
  cost: number;
}

export interface GraphSearchProblem<TState> {
  initialState: TState;
  isGoal: (state: TState) => boolean;
  getSuccessors: (state: TState) => SearchSuccessor<TState>[];
  getHeuristic?: (state: TState) => number;
  stateKey?: (state: TState) => string;
}

export interface SearchNode<TState> {
  id: string;
  state: TState;
  stateKey: string;
  parentId?: string;
  parent: SearchNode<TState> | null;
  action?: string;
  g: number;
  h: number;
  f: number;
  depth: number;
}

export interface SearchResult<TState> {
  found: boolean;
  solutionNode: SearchNode<TState> | null;
  path: TState[];
  actions: string[];
  totalCost: number;
  nodesExpanded: number;
  nodesGenerated: number;
  exploredKeys: string[];
  frontierRemaining: SearchNode<TState>[];
  expansionOrder: TState[];
}

export interface SearchStepSnapshot<TState> {
  frontier: SearchNode<TState>[];
  explored: string[]; // State keys
  currentNode: SearchNode<TState> | null;
  solutionPath: TState[] | null;
  totalCost: number;
  stepCount: number;
  isFinished: boolean;
  statusMessage: string;
  activeLineIndex: number;
  nodesExpanded: number;
  nodesGenerated: number;
}

export interface SearchSessionOptions {
  isGraphMode?: boolean;
  depthLimit?: number;
}

function defaultKey<TState>(state: TState): string {
  if (typeof state === 'string') return state;
  return JSON.stringify(state);
}

/**
 * Reconstruct full path from initial state to goal node
 */
export function reconstructPath<TState>(node: SearchNode<TState> | null): TState[] {
  if (!node) return [];
  const path: TState[] = [];
  let curr: SearchNode<TState> | null = node;
  while (curr) {
    path.unshift(curr.state);
    curr = curr.parent;
  }
  return path;
}

/**
 * Reconstruct sequence of actions
 */
export function reconstructActions<TState>(node: SearchNode<TState> | null): string[] {
  if (!node) return [];
  const actions: string[] = [];
  let curr: SearchNode<TState> | null = node;
  while (curr && curr.action) {
    actions.unshift(curr.action);
    curr = curr.parent;
  }
  return actions;
}

/**
 * Creates an initial search root node
 */
export function createRootNode<TState>(
  problem: GraphSearchProblem<TState>,
  algorithm: SearchAlgorithmType
): SearchNode<TState> {
  const getKey = problem.stateKey || defaultKey;
  const key = getKey(problem.initialState);
  const h = problem.getHeuristic ? problem.getHeuristic(problem.initialState) : 0;
  const g = 0;
  const f = algorithm === 'greedy' ? h : algorithm === 'ucs' ? 0 : g + h;

  return {
    id: `${key}-0`,
    state: problem.initialState,
    stateKey: key,
    parent: null,
    g,
    h,
    f,
    depth: 0,
  };
}

/**
 * Select the next node to expand according to algorithm discipline
 */
export function selectNextNode<TState>(
  frontier: SearchNode<TState>[],
  algorithm: SearchAlgorithmType
): { selected: SearchNode<TState>; remaining: SearchNode<TState>[] } | null {
  if (frontier.length === 0) return null;

  const nextFrontier = [...frontier];
  let selected: SearchNode<TState>;

  switch (algorithm) {
    case 'bfs':
      // FIFO
      selected = nextFrontier.shift()!;
      break;
    case 'dfs':
    case 'dls':
      // LIFO
      selected = nextFrontier.pop()!;
      break;
    case 'ucs':
      // Lowest g(n)
      nextFrontier.sort((a, b) => a.g - b.g);
      selected = nextFrontier.shift()!;
      break;
    case 'greedy':
      // Lowest h(n)
      nextFrontier.sort((a, b) => a.h - b.h);
      selected = nextFrontier.shift()!;
      break;
    case 'astar':
      // Lowest f(n) = g(n) + h(n), tie-break with lowest h(n)
      nextFrontier.sort((a, b) => {
        if (Math.abs(a.f - b.f) > 0.0001) {
          return a.f - b.f;
        }
        return a.h - b.h;
      });
      selected = nextFrontier.shift()!;
      break;
    default:
      selected = nextFrontier.shift()!;
      break;
  }

  return { selected, remaining: nextFrontier };
}

/**
 * Generate successors for a node
 */
export function expandNode<TState>(
  node: SearchNode<TState>,
  problem: GraphSearchProblem<TState>,
  algorithm: SearchAlgorithmType,
  exploredKeys: Set<string>,
  isGraphMode: boolean,
  counterRef: { count: number }
): SearchNode<TState>[] {
  const getKey = problem.stateKey || defaultKey;
  const rawSuccessors = problem.getSuccessors(node.state);
  const children: SearchNode<TState>[] = [];

  for (const succ of rawSuccessors) {
    const childKey = getKey(succ.state);
    if (isGraphMode && exploredKeys.has(childKey)) {
      continue;
    }

    const childG = node.g + succ.cost;
    const childH = problem.getHeuristic ? problem.getHeuristic(succ.state) : 0;
    const childF =
      algorithm === 'greedy'
        ? childH
        : algorithm === 'ucs'
        ? childG
        : childG + childH;

    counterRef.count += 1;
    const childNode: SearchNode<TState> = {
      id: `${childKey}-${node.depth + 1}-${counterRef.count}`,
      state: succ.state,
      stateKey: childKey,
      parentId: node.id,
      parent: node,
      action: succ.action,
      g: childG,
      h: childH,
      f: childF,
      depth: node.depth + 1,
    };

    children.push(childNode);
  }

  return children;
}

/**
 * Run a full search to completion synchronously
 */
export function runSearch<TState>(
  problem: GraphSearchProblem<TState>,
  algorithm: SearchAlgorithmType,
  options: SearchSessionOptions = {}
): SearchResult<TState> {
  const isGraphMode = options.isGraphMode ?? true;
  const depthLimit = options.depthLimit ?? 1000;

  const root = createRootNode(problem, algorithm);
  let frontier: SearchNode<TState>[] = [root];
  const explored = new Set<string>();
  const expansionOrder: TState[] = [];
  let nodesExpanded = 0;
  let nodesGenerated = 1;
  const counterRef = { count: 0 };

  while (frontier.length > 0) {
    const selection = selectNextNode(frontier, algorithm);
    if (!selection) break;

    const { selected, remaining } = selection;
    frontier = remaining;

    // In graph mode, if already explored, skip
    if (isGraphMode && explored.has(selected.stateKey)) {
      continue;
    }

    // Check goal condition upon popping (standard graph search)
    if (problem.isGoal(selected.state)) {
      return {
        found: true,
        solutionNode: selected,
        path: reconstructPath(selected),
        actions: reconstructActions(selected),
        totalCost: selected.g,
        nodesExpanded,
        nodesGenerated,
        exploredKeys: Array.from(explored),
        frontierRemaining: frontier,
        expansionOrder,
      };
    }

    if (isGraphMode) {
      explored.add(selected.stateKey);
    }
    nodesExpanded += 1;
    expansionOrder.push(selected.state);

    // Depth limit check for DLS
    if (algorithm === 'dls' && selected.depth >= depthLimit) {
      continue;
    }

    // Expand
    const children = expandNode(
      selected,
      problem,
      algorithm,
      explored,
      isGraphMode,
      counterRef
    );
    nodesGenerated += children.length;
    frontier = [...frontier, ...children];
  }

  return {
    found: false,
    solutionNode: null,
    path: [],
    actions: [],
    totalCost: Infinity,
    nodesExpanded,
    nodesGenerated,
    exploredKeys: Array.from(explored),
    frontierRemaining: frontier,
    expansionOrder,
  };
}

/**
 * Step-by-step search session for visualizers and interactive challenges
 */
export class InteractiveSearchSession<TState> {
  private problem: GraphSearchProblem<TState>;
  private algorithm: SearchAlgorithmType;
  private isGraphMode: boolean;
  private depthLimit: number;

  private frontier: SearchNode<TState>[] = [];
  private explored = new Set<string>();
  private currentNode: SearchNode<TState> | null = null;
  private solutionPath: TState[] | null = null;
  private totalCost = 0;
  private stepCount = 0;
  private isFinished = false;
  private statusMessage = 'Initialized search engine.';
  private activeLineIndex = 0;
  private nodesExpanded = 0;
  private nodesGenerated = 0;
  private counterRef = { count: 0 };

  private history: SearchStepSnapshot<TState>[] = [];

  constructor(
    problem: GraphSearchProblem<TState>,
    algorithm: SearchAlgorithmType,
    options: SearchSessionOptions = {}
  ) {
    this.problem = problem;
    this.algorithm = algorithm;
    this.isGraphMode = options.isGraphMode ?? true;
    this.depthLimit = options.depthLimit ?? 19;
    this.reset();
  }

  public reset(): void {
    const root = createRootNode(this.problem, this.algorithm);
    this.frontier = [root];
    this.explored = new Set<string>();
    this.currentNode = null;
    this.solutionPath = null;
    this.totalCost = 0;
    this.stepCount = 0;
    this.isFinished = false;
    this.statusMessage = `Initialized search radar using ${this.algorithm.toUpperCase()}.`;
    this.activeLineIndex = 0;
    this.nodesExpanded = 0;
    this.nodesGenerated = 1;
    this.counterRef = { count: 0 };
    this.history = [];
  }

  public getSnapshot(): SearchStepSnapshot<TState> {
    return {
      frontier: [...this.frontier],
      explored: Array.from(this.explored),
      currentNode: this.currentNode,
      solutionPath: this.solutionPath ? [...this.solutionPath] : null,
      totalCost: this.totalCost,
      stepCount: this.stepCount,
      isFinished: this.isFinished,
      statusMessage: this.statusMessage,
      activeLineIndex: this.activeLineIndex,
      nodesExpanded: this.nodesExpanded,
      nodesGenerated: this.nodesGenerated,
    };
  }

  /**
   * Peek which node would be selected next without changing state
   */
  public peekNextNode(): SearchNode<TState> | null {
    if (this.frontier.length === 0) return null;
    const selection = selectNextNode(this.frontier, this.algorithm);
    return selection ? selection.selected : null;
  }

  /**
   * Perform one step of search
   */
  public step(): SearchStepSnapshot<TState> {
    if (this.isFinished || this.frontier.length === 0) {
      if (this.frontier.length === 0 && !this.isFinished) {
        this.isFinished = true;
        this.statusMessage = 'Search frontier exhausted: Target unreachable.';
      }
      return this.getSnapshot();
    }

    // Save history
    this.history.push(this.getSnapshot());

    // Select next node
    const selection = selectNextNode(this.frontier, this.algorithm);
    if (!selection) {
      this.isFinished = true;
      return this.getSnapshot();
    }

    const { selected, remaining } = selection;
    this.frontier = remaining;

    // Check if state is already in explored set (graph search)
    if (this.isGraphMode && this.explored.has(selected.stateKey)) {
      this.statusMessage = `Cycle detected: ${selected.stateKey} already explored. Discarding duplicate branch.`;
      this.activeLineIndex = 4;
      return this.getSnapshot();
    }

    this.currentNode = selected;
    if (this.isGraphMode) {
      this.explored.add(selected.stateKey);
    }
    this.stepCount += 1;
    this.nodesExpanded += 1;
    this.activeLineIndex = 2;

    // Goal test
    if (this.problem.isGoal(selected.state)) {
      this.isFinished = true;
      this.totalCost = selected.g;
      this.solutionPath = reconstructPath(selected);
      this.statusMessage = `Goal reached! Path cost: ${selected.g}.`;
      this.activeLineIndex = 3;
      return this.getSnapshot();
    }

    // Depth check for DLS
    if (this.algorithm === 'dls' && selected.depth >= this.depthLimit) {
      this.statusMessage = `Depth cutoff: limit ${this.depthLimit} reached at ${selected.stateKey}.`;
      this.activeLineIndex = 4;
      return this.getSnapshot();
    }

    // Expand
    const children = expandNode(
      selected,
      this.problem,
      this.algorithm,
      this.explored,
      this.isGraphMode,
      this.counterRef
    );

    this.nodesGenerated += children.length;
    this.frontier = [...this.frontier, ...children];
    this.statusMessage = `Extracted ${selected.stateKey} (g=${selected.g}, h=${selected.h}, f=${selected.f}). Generated ${children.length} child nodes.`;
    this.activeLineIndex = 6;

    return this.getSnapshot();
  }

  /**
   * Step backward to previous snapshot
   */
  public stepBack(): SearchStepSnapshot<TState> | null {
    if (this.history.length === 0) return null;
    const prev = this.history.pop()!;
    this.frontier = [...prev.frontier];
    this.explored = new Set(prev.explored);
    this.currentNode = prev.currentNode;
    this.solutionPath = prev.solutionPath ? [...prev.solutionPath] : null;
    this.totalCost = prev.totalCost;
    this.stepCount = prev.stepCount;
    this.isFinished = prev.isFinished;
    this.statusMessage = prev.statusMessage;
    this.activeLineIndex = prev.activeLineIndex;
    this.nodesExpanded = prev.nodesExpanded;
    this.nodesGenerated = prev.nodesGenerated;
    return this.getSnapshot();
  }
}

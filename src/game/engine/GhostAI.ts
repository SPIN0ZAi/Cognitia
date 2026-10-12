/**
 * Cognitia Chase: Maze Agents — Ghost AI Controller
 * Powers the 5 algorithm enemies calling the shared GraphSearch module
 */

import { runSearch } from '../../lib/search/GraphSearch';
import type { SearchAlgorithmType } from '../../lib/search/GraphSearch';
import { MazeMap } from './MazeMap';
import type {
  GhostEntity,
  GhostPersonality,
  GridCoord,
  Direction,
} from './types';

export const GHOST_PROFILES: Record<
  GhostPersonality,
  { name: string; codename: string; color: string; algoType: SearchAlgorithmType }
> = {
  bfs: {
    name: 'The Wave',
    codename: 'BREADTH_FIRST_SEARCH',
    color: '#78D5E8', // Luminous Cyan
    algoType: 'bfs',
  },
  ucs: {
    name: 'The Miser',
    codename: 'UNIFORM_COST_SEARCH',
    color: '#F59E0B', // Amber / Gold
    algoType: 'ucs',
  },
  dfs: {
    name: 'The Plunger',
    codename: 'DEPTH_FIRST_SEARCH',
    color: '#A855F7', // Cyber Violet
    algoType: 'dfs',
  },
  greedy: {
    name: 'The Gambler',
    codename: 'GREEDY_BEST_FIRST',
    color: '#F43F5E', // Hot Coral / Crimson
    algoType: 'greedy',
  },
  astar: {
    name: 'The Strategist',
    codename: 'ASTAR_OPTIMAL',
    color: '#C6F277', // Luminous Lime
    algoType: 'astar',
  },
};

export class GhostAI {
  /**
   * Instantiates a new Ghost entity with default telemetry
   */
  public static createGhost(
    personality: GhostPersonality,
    spawnTile: GridCoord,
    id: string = `ghost-${personality}`
  ): GhostEntity {
    const profile = GHOST_PROFILES[personality];

    return {
      id,
      personality,
      name: profile.name,
      codename: profile.codename,
      color: profile.color,
      x: spawnTile.x,
      y: spawnTile.y,
      targetTile: { x: spawnTile.x, y: spawnTile.y },
      dir: 'none',
      nextDir: 'none',
      speed: 3.5, // 3.5 tiles per second baseline
      mode: 'chase',
      frightenedTimer: 0,
      path: [],
      telemetry: {
        algorithm: personality,
        name: profile.name,
        codename: profile.codename,
        accentColor: profile.color,
        currentTile: { ...spawnTile },
        targetTile: { ...spawnTile },
        currentPath: [],
        frontierTiles: [],
        exploredTiles: [],
        nodesExpanded: 0,
        nodesGenerated: 0,
        currentG: 0,
        currentH: 0,
        currentF: 0,
        heuristicType: 'manhattan',
        calculationTimeMs: 0,
      },
    };
  }

  /**
   * Computes route for ghost toward target using shared GraphSearch
   */
  public static recalculatePath(
    ghost: GhostEntity,
    targetTile: GridCoord,
    maze: MazeMap,
    heuristicType: 'manhattan' | 'euclidean' | 'inadmissible' = 'manhattan'
  ): void {
    const profile = GHOST_PROFILES[ghost.personality];
    const ghostTile: GridCoord = {
      x: Math.round(ghost.x),
      y: Math.round(ghost.y),
    };

    // Frightened mode: target corner away from player
    let effectiveTarget = targetTile;
    if (ghost.mode === 'frightened') {
      effectiveTarget = {
        x: ghostTile.x > targetTile.x ? maze.width - 2 : 1,
        y: ghostTile.y > targetTile.y ? maze.height - 2 : 1,
      };
    }

    const t0 = performance.now();
    const problem = maze.createSearchProblem(ghostTile, effectiveTarget, heuristicType);
    const searchResult = runSearch(problem, profile.algoType, { isGraphMode: true });
    const elapsed = Math.max(0.1, Number((performance.now() - t0).toFixed(2)));

    ghost.path = searchResult.path;
    ghost.targetTile = effectiveTarget;

    // Convert explored and frontier keys to GridCoords for X-Ray visualization
    const exploredTiles: GridCoord[] = searchResult.exploredKeys.map((key) => {
      const [x, y] = key.split(',').map(Number);
      return { x: x || 0, y: y || 0 };
    });

    const frontierTiles: GridCoord[] = searchResult.frontierRemaining.map((n) => n.state);

    const nextNode = searchResult.solutionNode;
    const currentG = nextNode ? nextNode.g : 0;
    const currentH = nextNode ? nextNode.h : 0;
    const currentF = nextNode ? nextNode.f : 0;

    ghost.telemetry = {
      algorithm: ghost.personality,
      name: profile.name,
      codename: profile.codename,
      accentColor: profile.color,
      currentTile: ghostTile,
      targetTile: effectiveTarget,
      currentPath: searchResult.path,
      frontierTiles,
      exploredTiles,
      nodesExpanded: searchResult.nodesExpanded,
      nodesGenerated: searchResult.nodesGenerated,
      currentG,
      currentH,
      currentF,
      heuristicType,
      calculationTimeMs: elapsed,
    };
  }

  /**
   * Determine movement direction from current tile to next tile in planned path
   */
  public static getDirectionToNextTile(current: GridCoord, next: GridCoord): Direction {
    if (next.x > current.x) return 'right';
    if (next.x < current.x) return 'left';
    if (next.y > current.y) return 'down';
    if (next.y < current.y) return 'up';
    return 'none';
  }
}

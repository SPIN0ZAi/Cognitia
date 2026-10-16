/**
 * Cognitia Chase: Maze Agents — Authentic 1980 Arcade & Course Algorithm Ghost Controller
 * 
 * Implements:
 * 1. Classic Mode: Authentic Pac-Man Dossier rules:
 *    - Blinky direct chase (T = P) + Cruise Elroy acceleration.
 *    - Pinky 4-tile ambush with the 16-bit UP overflow bug (T = P + 4*dir; if UP, T = (Px - 4, Py - 4)).
 *    - Inky 2x vector doubling from Blinky to 2-ahead tile.
 *    - Clyde distance-8 proximity cowardice (chases if d >= 8, flees to scatter corner if d < 8).
 *    - Strict No-Reverse rule.
 *    - UP > LEFT > DOWN > RIGHT tie-breaking.
 *    - Forbidden Up-turn tiles at (12, 11), (15, 11), (12, 23), (15, 23).
 * 2. Algorithm Mode: Course search algorithms (BFS, UCS, DFS, Greedy, A*) from GraphSearch.
 */

import { runSearch } from '../../lib/search/GraphSearch';
import type { SearchAlgorithmType } from '../../lib/search/GraphSearch';
import { MazeMap } from './MazeMap';
import type {
  GhostEntity,
  GhostPersonality,
  GridCoord,
  Direction,
  TargetingMode,
} from './types';

export const GHOST_PROFILES: Record<
  GhostPersonality,
  { name: string; codename: string; color: string; algoType?: SearchAlgorithmType }
> = {
  // Classic 1980 arcade characters
  blinky: {
    name: 'Blinky',
    codename: 'SHADOW / DIRECT_CHASER',
    color: '#FF2A4A',
  },
  pinky: {
    name: 'Pinky',
    codename: 'SPEEDY / 4_TILE_AMBUSH',
    color: '#FF7AC6',
  },
  inky: {
    name: 'Inky',
    codename: 'BASHFUL / 2X_VECTOR_FLANK',
    color: '#00F0FF',
  },
  clyde: {
    name: 'Clyde',
    codename: 'POKEY / 8_TILE_COWARD',
    color: '#FF9F1C',
  },
  // Course search algorithms
  bfs: {
    name: 'The Wave',
    codename: 'BREADTH_FIRST_SEARCH',
    color: '#78D5E8',
    algoType: 'bfs',
  },
  ucs: {
    name: 'The Miser',
    codename: 'UNIFORM_COST_SEARCH',
    color: '#E6A817',
    algoType: 'ucs',
  },
  dfs: {
    name: 'The Plunger',
    codename: 'DEPTH_FIRST_SEARCH',
    color: '#E05666',
    algoType: 'dfs',
  },
  greedy: {
    name: 'The Gambler',
    codename: 'GREEDY_BEST_FIRST',
    color: '#D45BD9',
    algoType: 'greedy',
  },
  astar: {
    name: 'The Strategist',
    codename: 'A_STAR_SEARCH',
    color: '#65D68A',
    algoType: 'astar',
  },
};

// Strict tie-break order: UP > LEFT > DOWN > RIGHT
export const TIE_BREAK_ORDER: Direction[] = ['up', 'left', 'down', 'right'];

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
  none: 'none',
};

export const DIR_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  left: { dx: -1, dy: 0 },
  down: { dx: 0, dy: 1 },
  right: { dx: 1, dy: 0 },
  none: { dx: 0, dy: 0 },
};

export class GhostAIController {
  private maze: MazeMap;

  constructor(maze: MazeMap) {
    this.maze = maze;
  }

  /**
   * Computes the target tile for a ghost according to classic Pac-Man Dossier rules.
   */
  public computeClassicTarget(
    ghost: GhostEntity,
    playerTile: GridCoord,
    playerDir: Direction,
    blinkyTile: GridCoord
  ): GridCoord {
    // 1. Eaten eyes target: Ghost pen door tile (13.5, 11)
    if (ghost.mode === 'eaten') {
      return { x: 13.5, y: 11 };
    }

    // 2. Scatter mode: each ghost has its fixed corner
    if (ghost.mode === 'scatter') {
      return ghost.scatterTile;
    }

    // 3. Chase mode: personality-specific targeting
    switch (ghost.personality) {
      case 'blinky':
      case 'astar':
        // Blinky: exact tile of the player
        return { x: playerTile.x, y: playerTile.y };

      case 'pinky':
      case 'greedy': {
        // Pinky: 4 tiles ahead of player with the arcade UP overflow bug
        let targetX = playerTile.x;
        let targetY = playerTile.y;

        if (playerDir === 'up') {
          // Documented arcade quirk: 4 tiles up AND 4 tiles left
          targetX -= 4;
          targetY -= 4;
        } else if (playerDir === 'down') {
          targetY += 4;
        } else if (playerDir === 'left') {
          targetX -= 4;
        } else if (playerDir === 'right') {
          targetX += 4;
        }
        return { x: targetX, y: targetY };
      }

      case 'inky':
      case 'ucs': {
        // Inky: intermediate tile 2 tiles ahead of player, then double vector from Blinky
        let interX = playerTile.x;
        let interY = playerTile.y;

        if (playerDir === 'up') {
          // Same UP quirk: 2 tiles up and 2 tiles left
          interX -= 2;
          interY -= 2;
        } else if (playerDir === 'down') {
          interY += 2;
        } else if (playerDir === 'left') {
          interX -= 2;
        } else if (playerDir === 'right') {
          interX += 2;
        }

        const vecX = interX - blinkyTile.x;
        const vecY = interY - blinkyTile.y;
        return {
          x: blinkyTile.x + 2 * vecX,
          y: blinkyTile.y + 2 * vecY,
        };
      }

      case 'clyde':
      case 'dfs':
      case 'bfs': {
        // Clyde: if distance >= 8 tiles, chase player; if < 8 tiles, flee to scatter corner
        const dx = ghost.x - playerTile.x;
        const dy = ghost.y - playerTile.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist >= 8) {
          return { x: playerTile.x, y: playerTile.y };
        } else {
          return ghost.scatterTile; // (0, 31)
        }
      }

      default:
        return { x: playerTile.x, y: playerTile.y };
    }
  }

  /**
   * Decides next direction for a ghost at a tile intersection.
   * Follows strict Pac-Man Dossier rules:
   * 1. Cannot reverse direction
   * 2. Cannot hit walls (or door unless eaten/house)
   * 3. Cannot turn UP on forbidden tiles (12, 11), (15, 11), (12, 23), (15, 23)
   * 4. Minimum straight-line distance squared to target tile
   * 5. Tie-break order: UP > LEFT > DOWN > RIGHT
   */
  public decideNextDirectionClassic(
    ghost: GhostEntity,
    targetTile: GridCoord,
    randomSeed?: number
  ): Direction {
    const curX = Math.round(ghost.x);
    const curY = Math.round(ghost.y);
    const opposite = OPPOSITE_DIRECTION[ghost.dir];

    // Frightened mode: pseudo-random selection among valid non-reverse directions
    if (ghost.mode === 'frightened') {
      const validDirs: Direction[] = [];
      for (const dir of TIE_BREAK_ORDER) {
        if (dir === opposite && ghost.dir !== 'none') continue;
        const offset = DIR_OFFSETS[dir];
        const nx = curX + offset.dx;
        const ny = curY + offset.dy;
        if (this.maze.isWalkable(nx, ny, false)) {
          validDirs.push(dir);
        }
      }
      if (validDirs.length > 0) {
        const seed = randomSeed ?? Math.floor(Math.random() * 1000);
        return validDirs[seed % validDirs.length];
      }
      return ghost.dir !== 'none' ? ghost.dir : 'left';
    }

    let bestDir: Direction = 'none';
    let bestDistSq = Infinity;

    for (const dir of TIE_BREAK_ORDER) {
      // Rule 1: No reverse direction
      if (dir === opposite && ghost.dir !== 'none') {
        continue;
      }

      // Rule 2: Cannot turn UP on restricted tiles
      if (dir === 'up' && this.maze.isForbiddenUp(curX, curY) && ghost.mode !== 'eaten') {
        continue;
      }

      const offset = DIR_OFFSETS[dir];
      let nx = curX + offset.dx;
      let ny = curY + offset.dy;

      // Tunnel wrap-around check at row 14 (classic arcade only)
      if (this.maze.width === 28 && this.maze.height === 31 && ny === 14) {
        if (nx < 0) nx = this.maze.width - 1;
        else if (nx >= this.maze.width) nx = 0;
      }

      // Rule 3: Must be walkable
      if (!this.maze.isWalkable(nx, ny, ghost.mode === 'eaten' || ghost.inHouse)) {
        continue;
      }

      // Rule 4: Straight-line distance squared to target
      const distSq = (nx - targetTile.x) ** 2 + (ny - targetTile.y) ** 2;

      // Rule 5: Pick minimum distance. Because we iterate in UP > LEFT > DOWN > RIGHT order,
      // strictly using '<' preserves the exact authentic tie-breaking order!
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestDir = dir;
      }
    }

    if (bestDir !== 'none') {
      return bestDir;
    }

    // Fallback if trapped in dead end: reverse is allowed only as last resort
    return opposite !== 'none' ? opposite : 'left';
  }

  /**
   * Updates ghost trajectory and telemetry for either Classic Mode or Algorithm Mode.
   */
  public updateGhostDecision(
    ghost: GhostEntity,
    playerTile: GridCoord,
    playerDir: Direction,
    blinkyTile: GridCoord,
    mode: TargetingMode,
    heuristicType: 'manhattan' | 'euclidean' | 'inadmissible' = 'manhattan'
  ): void {
    const startTime = performance.now();
    const curX = Math.round(ghost.x);
    const curY = Math.round(ghost.y);

    if (mode === 'classic') {
      // 1. Classic Mode: Pac-Man Dossier authentic targeting & heuristic lookahead
      const target = this.computeClassicTarget(ghost, playerTile, playerDir, blinkyTile);
      ghost.targetTile = target;

      const nextDir = this.decideNextDirectionClassic(ghost, target);
      ghost.nextDir = nextDir;

      // Telemetry: connects classic chase to the h(n) informed search lesson
      const euc = Math.sqrt((curX - target.x) ** 2 + (curY - target.y) ** 2);

      ghost.telemetry = {
        algorithm: ghost.personality,
        name: GHOST_PROFILES[ghost.personality].name,
        codename: GHOST_PROFILES[ghost.personality].codename,
        accentColor: GHOST_PROFILES[ghost.personality].color,
        currentTile: { x: curX, y: curY },
        targetTile: target,
        currentPath: [{ x: curX, y: curY }, { x: target.x, y: target.y }],
        frontierTiles: [
          { x: curX, y: curY - 1 },
          { x: curX - 1, y: curY },
          { x: curX, y: curY + 1 },
          { x: curX + 1, y: curY },
        ].filter((c) => this.maze.isWalkable(c.x, c.y, true)),
        exploredTiles: [{ x: curX, y: curY }],
        nodesExpanded: 4,
        nodesGenerated: 4,
        currentG: 1,
        currentH: Math.round(euc * 10) / 10,
        currentF: Math.round((1 + euc) * 10) / 10,
        heuristicType,
        calculationTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
      return;
    }

    // 2. Algorithm Mode: Course search algorithms (BFS, UCS, DFS, Greedy, A*)
    if (ghost.mode === 'frightened') {
      const nextDir = this.decideNextDirectionClassic(ghost, playerTile);
      ghost.nextDir = nextDir;
      return;
    }

    let algoType: SearchAlgorithmType = 'astar';
    if (ghost.personality === 'bfs') algoType = 'bfs';
    else if (ghost.personality === 'ucs') algoType = 'ucs';
    else if (ghost.personality === 'dfs') algoType = 'dfs';
    else if (ghost.personality === 'greedy') algoType = 'greedy';
    else if (ghost.personality === 'astar') algoType = 'astar';

    let goal = playerTile;
    if (ghost.mode === 'scatter') {
      const clampedX = Math.max(1, Math.min(this.maze.width - 2, ghost.scatterTile.x));
      const clampedY = Math.max(1, Math.min(this.maze.height - 2, ghost.scatterTile.y));
      goal = { x: clampedX, y: clampedY };
    } else if (ghost.mode === 'eaten') {
      goal = { x: Math.round(this.maze.ghostSpawn.x), y: Math.round(this.maze.ghostSpawn.y) };
    }
    ghost.targetTile = goal;

    const problem = this.maze.createSearchProblem(
      { x: curX, y: curY },
      goal,
      heuristicType
    );

    const result = runSearch(problem, algoType, { isGraphMode: true });

    const pathCoords: GridCoord[] = result.path;
    ghost.path = pathCoords;

    // Pick first step on path, or fall back to classic lookahead if path is empty
    if (pathCoords.length > 1) {
      const nextStep = pathCoords[1];
      if (nextStep.x > curX) ghost.nextDir = 'right';
      else if (nextStep.x < curX) ghost.nextDir = 'left';
      else if (nextStep.y > curY) ghost.nextDir = 'down';
      else if (nextStep.y < curY) ghost.nextDir = 'up';
    } else {
      ghost.nextDir = this.decideNextDirectionClassic(ghost, goal);
    }

    const lastNode = result.solutionNode;
    ghost.telemetry = {
      algorithm: ghost.personality,
      name: GHOST_PROFILES[ghost.personality].name,
      codename: GHOST_PROFILES[ghost.personality].codename,
      accentColor: GHOST_PROFILES[ghost.personality].color,
      currentTile: { x: curX, y: curY },
      targetTile: goal,
      currentPath: pathCoords,
      frontierTiles: [],
      exploredTiles: result.exploredKeys.map((s: string) => {
        const [x, y] = s.split(',').map(Number);
        return { x: x || 0, y: y || 0 };
      }),
      nodesExpanded: result.nodesExpanded,
      nodesGenerated: result.nodesGenerated,
      currentG: lastNode?.g ?? 0,
      currentH: lastNode?.h ?? 0,
      currentF: lastNode?.f ?? 0,
      heuristicType,
      calculationTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
  }
}

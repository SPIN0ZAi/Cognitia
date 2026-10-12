/**
 * Cognitia Chase: Maze Agents — Maze Map & Graph Generator
 */

import type { TileType, GridCoord } from './types';
import type { GraphSearchProblem } from '../../lib/search/GraphSearch';

export class MazeMap {
  public width: number;
  public height: number;
  public grid: TileType[][];
  public playerSpawn: GridCoord;
  public ghostSpawn: GridCoord;
  public totalPellets: number = 0;
  public remainingPellets: number = 0;

  constructor(layout: string[]) {
    this.height = layout.length;
    this.width = layout[0]?.length || 0;
    this.grid = [];
    this.playerSpawn = { x: 1, y: 1 };
    this.ghostSpawn = { x: Math.floor(this.width / 2), y: Math.floor(this.height / 2) };

    this.parseLayout(layout);
  }

  private parseLayout(layout: string[]): void {
    this.grid = [];
    this.totalPellets = 0;

    for (let y = 0; y < this.height; y++) {
      const row: TileType[] = [];
      const line = layout[y] || '';

      for (let x = 0; x < this.width; x++) {
        const char = line[x] || '#';
        let tile: TileType = 'wall';

        switch (char) {
          case '#':
            tile = 'wall';
            break;
          case '.':
            tile = 'pellet';
            this.totalPellets++;
            break;
          case 'o':
          case 'O':
            tile = 'power';
            this.totalPellets++;
            break;
          case 'M':
          case 'm':
            tile = 'mud';
            this.totalPellets++;
            break;
          case 'I':
          case 'i':
            tile = 'ice';
            this.totalPellets++;
            break;
          case 'P':
            tile = 'empty';
            this.playerSpawn = { x, y };
            break;
          case 'G':
            tile = 'empty';
            this.ghostSpawn = { x, y };
            break;
          case ' ':
          default:
            tile = 'empty';
            break;
        }
        row.push(tile);
      }
      this.grid.push(row);
    }

    this.remainingPellets = this.totalPellets;
  }

  public getTile(x: number, y: number): TileType {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 'wall';
    }
    return this.grid[y][x];
  }

  public setTile(x: number, y: number, tile: TileType): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[y][x] = tile;
    }
  }

  public isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile !== 'wall';
  }

  /**
   * Action step cost for traversing this tile:
   * Normal / Pellet / Power = 1.0
   * Mud = 3.0 (high friction, teaches cost-aware UCS!)
   * Ice = 0.5 (superconductor corridor, low friction)
   * Wall = Infinity
   */
  public getTraversalCost(x: number, y: number): number {
    const tile = this.getTile(x, y);
    switch (tile) {
      case 'mud':
        return 3.0;
      case 'ice':
        return 0.5;
      case 'wall':
        return Infinity;
      default:
        return 1.0;
    }
  }

  /**
   * Collect pellet at position if present
   */
  public eatPellet(x: number, y: number): { ate: boolean; type: TileType; points: number } {
    const tile = this.getTile(x, y);
    if (tile === 'pellet') {
      this.setTile(x, y, 'empty');
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { ate: true, type: 'pellet', points: 10 };
    }
    if (tile === 'power') {
      this.setTile(x, y, 'empty');
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { ate: true, type: 'power', points: 50 };
    }
    if (tile === 'mud') {
      // mud remains mud terrain, but student gets points for braving it!
      return { ate: true, type: 'mud', points: 5 };
    }
    if (tile === 'ice') {
      return { ate: true, type: 'ice', points: 5 };
    }
    return { ate: false, type: 'empty', points: 0 };
  }

  /**
   * Convert maze into a generic GraphSearchProblem for GraphSearch.ts
   */
  public createSearchProblem(
    start: GridCoord,
    goal: GridCoord,
    heuristicType: 'manhattan' | 'euclidean' | 'inadmissible' = 'manhattan'
  ): GraphSearchProblem<GridCoord> {
    const DIRS = [
      { dx: 0, dy: -1, action: 'up' },
      { dx: 0, dy: 1, action: 'down' },
      { dx: -1, dy: 0, action: 'left' },
      { dx: 1, dy: 0, action: 'right' },
    ];

    return {
      initialState: { x: Math.round(start.x), y: Math.round(start.y) },
      isGoal: (c: GridCoord) => c.x === Math.round(goal.x) && c.y === Math.round(goal.y),
      getSuccessors: (c: GridCoord) => {
        const successors: Array<{ state: GridCoord; action: string; cost: number }> = [];
        for (const dir of DIRS) {
          const nx = c.x + dir.dx;
          const ny = c.y + dir.dy;
          if (this.isWalkable(nx, ny)) {
            successors.push({
              state: { x: nx, y: ny },
              action: dir.action,
              cost: this.getTraversalCost(nx, ny),
            });
          }
        }
        return successors;
      },
      getHeuristic: (c: GridCoord) => {
        const dx = Math.abs(c.x - goal.x);
        const dy = Math.abs(c.y - goal.y);

        if (heuristicType === 'euclidean') {
          return Math.sqrt(dx * dx + dy * dy);
        }
        if (heuristicType === 'inadmissible') {
          // Gross overestimate (3x Manhattan distance) to prove A* suboptimality
          return 3.0 * (dx + dy);
        }
        // Standard admissible Manhattan distance
        return dx + dy;
      },
      stateKey: (c: GridCoord) => `${c.x},${c.y}`,
    };
  }
}

/**
 * Built-in standard campaign mazes
 */
export const DEFAULT_MAZE_LAYOUTS = {
  // Level 1: "The Wave Arrives" (BFS Intro) — Clean symmetric maze, no mud
  level1_wave: [
    '###################',
    '#P.......#.......G#',
    '#.##.###.#.###.##.#',
    '#o.#.#.......#.#.o#',
    '#.##.#.#####.#.##.#',
    '#......#...#......#',
    '######.###.###.####',
    '#......#...#......#',
    '#.####.#.#.#.####.#',
    '#o...#...#...#...o#',
    '####.#.#####.#.####',
    '#........#........#',
    '###################',
  ],

  // Level 2: "The Miser's Toll" (UCS Intro) — Mud corridors vs Ice bypass
  level2_miser: [
    '###################',
    '#P....MMMMMMMM...G#',
    '#.###.MMMMMMMM.##.#',
    '#o..#.MMMMMMMM.#.o#',
    '###.#.########.####',
    '#...#..........I..#',
    '#.#####.####.##I#.#',
    '#.......#....#II#.#',
    '#.#######.##.#II#.#',
    '#o......#....#II.o#',
    '#######.####.####.#',
    '#................G#',
    '###################',
  ],

  // Level 3: "Down the Rabbit Hole" (DFS Intro) — Long winding dead-end spurs
  level3_plunger: [
    '###################',
    '#P#.............#G#',
    '#.#.###########.#.#',
    '#.#.#.........#.#.#',
    '#.#.#.#######.#.#.#',
    '#...#.#.....#.#...#',
    '###.#.#.###.#.#####',
    '#...#...#.#.#.....#',
    '#.#######.#.#####.#',
    '#o........#......o#',
    '###################',
  ],

  // Level 4: "The Gambler's Trap" (Greedy Best-First) — U-shaped concave obstacles
  level4_gambler: [
    '###################',
    '#P...............G#',
    '#.#######.#######.#',
    '#.#.....#.#.....#.#',
    '#.#.###.#.#.###.#.#',
    '#...#o#.....#o#...#',
    '#.###.#######.###.#',
    '#.....#.....#.....#',
    '#.###.#.###.#.###.#',
    '#o..#...#G#...#..o#',
    '###################',
  ],

  // Level 5: "The Strategist's Gambit" (A* Intro) — Mixed terrain with optimal trade-offs
  level5_strategist: [
    '###################',
    '#P...#...M...#...G#',
    '#.##.#.##M##.#.##.#',
    '#o.#.#.IIMII.#.#.o#',
    '#.##.#.IIMII.#.##.#',
    '#......IIMII......#',
    '######.IIMII.######',
    '#......IIMII......#',
    '#.####.IIMII.####.#',
    '#o...#...M...#...o#',
    '####.###.M.###.####',
    '#........M........#',
    '###################',
  ],

  // Level 6 / Arcade: Full Arena with all 5 algorithms
  arcade_arena: [
    '#####################',
    '#P........#........G#',
    '#.###.###.#.###.###.#',
    '#o#.#.#...M...#.#.#o#',
    '#.###.###.#.###.###.#',
    '#.........#.........#',
    '###.#####...#####.###',
    '#II.#...# G #...#.II#',
    '#II.#.#.#####.#.#.II#',
    '#II...#.......#...II#',
    '###.#####.#.#####.###',
    '#.........#.........#',
    '#.###.###.#.###.###.#',
    '#o..#.#...M...#.#..o#',
    '###.#.#.#####.#.#.###',
    '#.......#...#.......#',
    '#####################',
  ],
};

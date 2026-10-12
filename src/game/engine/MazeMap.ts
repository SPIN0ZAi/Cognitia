/**
 * Cognitia Chase: Maze Agents — Authentic 28x31 Maze Map & Graph Generator
 * 
 * Implements the authentic 28x31 arcade maze from "The Pac-Man Dossier" (Jamey Pittman)
 * with 244 dots (240 pellets + 4 energizers), side wrap-around tunnels, ghost pen door,
 * and restricted intersection tiles.
 */

import type { TileType, GridCoord } from './types';
import type { GraphSearchProblem } from '../../lib/search/GraphSearch';

/**
 * Authentic 1980 Arcade 28x31 Layout
 * # = Wall, . = Dot, o = Energizer, - = Ghost House Door, ' ' = Empty path
 */
export const CLASSIC_ARCADE_MAZE: string[] = [
  '############################', // 0
  '#............##............#', // 1
  '#.####.#####.##.#####.####.#', // 2
  '#o####.#####.##.#####.####o#', // 3
  '#.####.#####.##.#####.####.#', // 4
  '#..........................#', // 5
  '#.####.##.########.##.####.#', // 6
  '#.####.##.########.##.####.#', // 7
  '#......##....##....##......#', // 8
  '######.##### ## #####.######', // 9
  '     #.##### ## #####.#     ', // 10
  '     #.##          ##.#     ', // 11
  '     #.## ###--### ##.#     ', // 12 (door at cols 13-14)
  '######.## #      # ##.######', // 13
  '          #      #          ', // 14 (tunnel row, wrap-around)
  '######.## #      # ##.######', // 15
  '     #.## ######## ##.#     ', // 16
  '     #.##          ##.#     ', // 17 (fruit spawn at 13.5, 17)
  '     #.## ######## ##.#     ', // 18
  '######.## ######## ##.######', // 19
  '#............##............#', // 20
  '#.####.#####.##.#####.####.#', // 21
  '#.####.#####.##.#####.####.#', // 22
  '#o..##................##..o#', // 23
  '###.##.##.########.##.##.###', // 24
  '###.##.##.########.##.##.###', // 25
  '#......##....##....##......#', // 26
  '#.##########.##.##########.#', // 27
  '#.##########.##.##########.#', // 28
  '#..........................#', // 29
  '############################', // 30
];

export class MazeMap {
  public width: number;
  public height: number;
  public grid: TileType[][];
  public playerSpawn: GridCoord;
  public fruitSpawn: GridCoord;
  public ghostSpawn: GridCoord;
  public ghostSpawns: {
    blinky: GridCoord;
    pinky: GridCoord;
    inky: GridCoord;
    clyde: GridCoord;
  };
  public scatterTargets: {
    blinky: GridCoord;
    pinky: GridCoord;
    inky: GridCoord;
    clyde: GridCoord;
  };
  public totalPellets: number = 0;
  public remainingPellets: number = 0;

  constructor(layout: string[] = CLASSIC_ARCADE_MAZE) {
    this.height = layout.length;
    this.width = layout[0]?.length || 28;
    this.grid = [];
    this.playerSpawn = { x: 13.5, y: 23 };
    this.fruitSpawn = { x: 13.5, y: 17 };
    this.ghostSpawn = { x: 13.5, y: 11 };
    this.ghostSpawns = {
      blinky: { x: 13.5, y: 11 },
      pinky: { x: 13.5, y: 14 },
      inky: { x: 11.5, y: 14 },
      clyde: { x: 15.5, y: 14 },
    };
    this.scatterTargets = {
      blinky: { x: 25, y: -3 },
      pinky: { x: 2, y: -3 },
      inky: { x: 27, y: 31 },
      clyde: { x: 0, y: 31 },
    };

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
          case '-':
            tile = 'door';
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
    const rx = Math.floor(x);
    const ry = Math.floor(y);

    // Tunnel wrap-around check at row 14
    if (ry === 14 && (rx < 0 || rx >= this.width)) {
      return 'empty';
    }

    if (rx < 0 || rx >= this.width || ry < 0 || ry >= this.height) {
      return 'wall';
    }
    return this.grid[ry][rx];
  }

  public isWalkable(x: number, y: number, isGhost: boolean = false): boolean {
    const rx = Math.floor(x);
    const ry = Math.floor(y);

    // Tunnel corridor wrap-around
    if (ry === 14 && (rx < 0 || rx >= this.width)) {
      return true;
    }

    if (rx < 0 || rx >= this.width || ry < 0 || ry >= this.height) {
      return false;
    }

    // Protect off-board void areas (columns outside 5..22 on rows 10..12 and 16..18)
    if ((rx < 5 || rx > 22) && ((ry >= 10 && ry <= 12) || (ry >= 16 && ry <= 18))) {
      return false;
    }

    const t = this.grid[ry][rx];
    if (t === 'wall') return false;
    if (t === 'door') return isGhost; // Only ghosts can pass through door
    return true;
  }

  /**
   * Tunnel Slow-Down Zone:
   * According to The Pac-Man Dossier, ghosts traveling inside the side tunnel (row 14)
   * outside columns 6..21 move at tunnel speed (approx 40% - 50%).
   */
  public isTunnel(x: number, y: number): boolean {
    const ry = Math.floor(y);
    const rx = Math.floor(x);
    return ry === 14 && (rx <= 5 || rx >= 22);
  }

  /**
   * Special "No Upward Turn" Restriction Tiles:
   * According to The Pac-Man Dossier, ghosts are forbidden from turning Up at:
   * (12, 11), (15, 11), (12, 23), (15, 23).
   */
  public isForbiddenUp(x: number, y: number): boolean {
    const rx = Math.floor(x);
    const ry = Math.floor(y);
    return (
      (rx === 12 && ry === 11) ||
      (rx === 15 && ry === 11) ||
      (rx === 12 && ry === 23) ||
      (rx === 15 && ry === 23)
    );
  }

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

  public eatPellet(x: number, y: number): { type: TileType; points: number } | null {
    const rx = Math.floor(x);
    const ry = Math.floor(y);

    if (rx < 0 || rx >= this.width || ry < 0 || ry >= this.height) {
      return null;
    }

    const tile = this.grid[ry][rx];
    if (tile === 'pellet') {
      this.grid[ry][rx] = 'empty';
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { type: 'pellet', points: 10 };
    }
    if (tile === 'power') {
      this.grid[ry][rx] = 'empty';
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { type: 'power', points: 50 };
    }
    if (tile === 'mud' || tile === 'ice') {
      this.grid[ry][rx] = 'empty';
      this.remainingPellets = Math.max(0, this.remainingPellets - 1);
      return { type: tile, points: 10 };
    }

    return null;
  }

  public createSearchProblem(
    start: GridCoord,
    goal: GridCoord,
    heuristicType: 'manhattan' | 'euclidean' | 'inadmissible' = 'manhattan'
  ): GraphSearchProblem<GridCoord> {
    const DIRS = [
      { dx: 0, dy: -1, action: 'up' },
      { dx: -1, dy: 0, action: 'left' },
      { dx: 0, dy: 1, action: 'down' },
      { dx: 1, dy: 0, action: 'right' },
    ];

    return {
      initialState: { x: Math.round(start.x), y: Math.round(start.y) },
      isGoal: (c: GridCoord) => c.x === Math.round(goal.x) && c.y === Math.round(goal.y),
      getSuccessors: (c: GridCoord) => {
        const successors: Array<{ state: GridCoord; action: string; cost: number }> = [];
        for (const dir of DIRS) {
          let nx = c.x + dir.dx;
          let ny = c.y + dir.dy;

          // Wrap tunnel
          if (ny === 14) {
            if (nx < 0) nx = this.width - 1;
            else if (nx >= this.width) nx = 0;
          }

          if (this.isWalkable(nx, ny, true)) {
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
          return 3.0 * (dx + dy);
        }
        return dx + dy;
      },
      stateKey: (c: GridCoord) => `${c.x},${c.y}`,
    };
  }
}

export const DEFAULT_MAZE_LAYOUTS = {
  classic_arcade: CLASSIC_ARCADE_MAZE,
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

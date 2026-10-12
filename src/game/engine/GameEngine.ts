/**
 * Cognitia Chase: Maze Agents — Core Game Engine
 * 
 * Pure TypeScript deterministic game loop decoupled from React / Canvas.
 * Fixed-timestep 60Hz accumulator pattern.
 */

import { MazeMap, DEFAULT_MAZE_LAYOUTS } from './MazeMap';
import { GhostAI } from './GhostAI';
import type {
  PlayerEntity,
  GhostEntity,
  GhostPersonality,
  GameEngineState,
  GameMode,
  Direction,
  GridCoord,
} from './types';

export interface GameEngineEvents {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onStateChange?: (state: GameEngineState) => void;
  onPelletEaten?: (pelletType: 'pellet' | 'power' | 'mud' | 'ice', points: number) => void;
  onGhostEaten?: (ghost: GhostEntity, points: number) => void;
  onPlayerCaught?: (livesLeft: number) => void;
  onLevelCleared?: () => void;
}

export class GameEngine {
  public maze: MazeMap;
  public player: PlayerEntity;
  public ghosts: GhostEntity[] = [];
  public state: GameEngineState = 'ready';
  public mode: GameMode = 'arcade';
  public score: number = 0;
  public highScore: number = 0;
  public currentLevel: number = 1;
  public speedMultiplier: number = 1.0; // 0.6x for slow accessibility mode
  public activeGhostPersonality: GhostPersonality = 'astar'; // For X-Ray focal tracking

  // Fixed timestep physics accumulator
  private readonly FIXED_DELTA = 1 / 60; // 60Hz tick (16.67ms)
  private accumulator = 0;
  private pathRecalcTimer = 0;

  // Event handlers
  public events: GameEngineEvents = {};

  constructor(
    layout: string[] = DEFAULT_MAZE_LAYOUTS.arcade_arena,
    mode: GameMode = 'arcade',
    ghostTypes: GhostPersonality[] = ['astar', 'bfs', 'ucs', 'greedy', 'dfs']
  ) {
    this.mode = mode;
    this.maze = new MazeMap(layout);

    this.player = {
      x: this.maze.playerSpawn.x,
      y: this.maze.playerSpawn.y,
      dir: 'none',
      nextDir: 'none',
      speed: 4.2, // 4.2 tiles per second
      lives: 3,
      invulnerableTimer: 2.0,
    };

    this.initGhosts(ghostTypes);
  }

  public initGhosts(ghostTypes: GhostPersonality[]): void {
    this.ghosts = [];
    const spawn = this.maze.ghostSpawn;

    ghostTypes.forEach((type, idx) => {
      // Offset ghost spawns slightly around ghost house
      const spawnX = Math.max(1, Math.min(this.maze.width - 2, spawn.x + ((idx % 3) - 1)));
      const spawnY = spawn.y;
      const ghost = GhostAI.createGhost(type, { x: spawnX, y: spawnY }, `ghost-${type}-${idx}`);
      this.ghosts.push(ghost);
    });

    if (this.ghosts.length > 0) {
      this.activeGhostPersonality = this.ghosts[0].personality;
    }
  }

  public setMazeLayout(layout: string[], ghostTypes?: GhostPersonality[]): void {
    this.maze = new MazeMap(layout);
    this.player.x = this.maze.playerSpawn.x;
    this.player.y = this.maze.playerSpawn.y;
    this.player.dir = 'none';
    this.player.nextDir = 'none';

    if (ghostTypes) {
      this.initGhosts(ghostTypes);
    } else {
      this.ghosts.forEach((g) => {
        g.x = this.maze.ghostSpawn.x;
        g.y = this.maze.ghostSpawn.y;
        g.path = [];
        g.mode = 'chase';
        g.frightenedTimer = 0;
      });
    }

    this.recalculateAllGhostPaths();
  }

  public start(): void {
    this.state = 'running';
    this.events.onStateChange?.(this.state);
    this.recalculateAllGhostPaths();
  }

  public pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
      this.events.onStateChange?.(this.state);
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
      this.events.onStateChange?.(this.state);
    }
  }

  public togglePause(): void {
    if (this.state === 'running') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  public resetGame(): void {
    this.score = 0;
    this.player.lives = 3;
    this.state = 'ready';
    this.player.x = this.maze.playerSpawn.x;
    this.player.y = this.maze.playerSpawn.y;
    this.player.dir = 'none';
    this.player.nextDir = 'none';
    this.player.invulnerableTimer = 2.0;

    this.ghosts.forEach((g) => {
      g.x = this.maze.ghostSpawn.x;
      g.y = this.maze.ghostSpawn.y;
      g.dir = 'none';
      g.nextDir = 'none';
      g.mode = 'chase';
      g.frightenedTimer = 0;
      g.path = [];
    });

    this.events.onScoreChange?.(this.score);
    this.events.onLivesChange?.(this.player.lives);
    this.events.onStateChange?.(this.state);
  }

  public setPlayerDirection(dir: Direction): void {
    this.player.nextDir = dir;
    if (this.state === 'ready' && dir !== 'none') {
      this.start();
    }
  }

  /**
   * Main game loop update call. Decoupled from monitor refresh rate!
   * Accrues delta time and executes in fixed 60Hz increments.
   */
  public update(realDeltaSeconds: number): void {
    if (this.state !== 'running') return;

    // Cap delta time to prevent spiral of death when tab is backgrounded
    const dt = Math.min(0.1, realDeltaSeconds) * this.speedMultiplier;
    this.accumulator += dt;

    while (this.accumulator >= this.FIXED_DELTA) {
      this.fixedTick(this.FIXED_DELTA);
      this.accumulator -= this.FIXED_DELTA;
    }
  }

  /**
   * Deterministic 60Hz physics tick
   */
  private fixedTick(dt: number): void {
    this.updatePlayerMovement(dt);
    this.updateGhostMovement(dt);
    this.checkCollisions();

    // Invulnerability timer countdown
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }

    // Periodic path recalculation for ghosts (every 0.4s or on intersection)
    this.pathRecalcTimer += dt;
    if (this.pathRecalcTimer >= 0.4) {
      this.pathRecalcTimer = 0;
      this.recalculateAllGhostPaths();
    }
  }

  private updatePlayerMovement(dt: number): void {
    const p = this.player;
    const curTileX = Math.round(p.x);
    const curTileY = Math.round(p.y);

    // Friction modifier for terrain: Mud slows down to 1/3, Ice speeds up 1.6x
    const terrainCost = this.maze.getTraversalCost(curTileX, curTileY);
    let speedMod = 1.0;
    if (terrainCost === 3.0) speedMod = 0.35; // Mud
    if (terrainCost === 0.5) speedMod = 1.6;  // Ice superconductor

    const effectiveSpeed = p.speed * speedMod;
    const dist = effectiveSpeed * dt;

    // Check if player can turn to nextDir
    if (p.nextDir !== 'none' && p.nextDir !== p.dir) {
      const isReversing =
        (p.dir === 'left' && p.nextDir === 'right') ||
        (p.dir === 'right' && p.nextDir === 'left') ||
        (p.dir === 'up' && p.nextDir === 'down') ||
        (p.dir === 'down' && p.nextDir === 'up');

      if (isReversing) {
        p.dir = p.nextDir;
      } else {
        // Can turn when near tile center
        const dxFromCenter = Math.abs(p.x - curTileX);
        const dyFromCenter = Math.abs(p.y - curTileY);

        if (dxFromCenter < 0.25 && dyFromCenter < 0.25) {
          const targetNext = this.getNeighborTile(curTileX, curTileY, p.nextDir);
          if (this.maze.isWalkable(targetNext.x, targetNext.y)) {
            p.x = curTileX;
            p.y = curTileY;
            p.dir = p.nextDir;
          }
        }
      }
    }

    // Move in current direction
    if (p.dir !== 'none') {
      let nx = p.x;
      let ny = p.y;

      if (p.dir === 'left') nx -= dist;
      if (p.dir === 'right') nx += dist;
      if (p.dir === 'up') ny -= dist;
      if (p.dir === 'down') ny += dist;

      // Wall collision check
      const checkX = p.dir === 'left' ? Math.floor(nx) : Math.ceil(nx);
      const checkY = p.dir === 'up' ? Math.floor(ny) : Math.ceil(ny);

      if (this.maze.isWalkable(checkX, curTileY) && (p.dir === 'left' || p.dir === 'right')) {
        p.x = nx;
      } else if (p.dir === 'left' || p.dir === 'right') {
        p.x = curTileX; // Snapped
      }

      if (this.maze.isWalkable(curTileX, checkY) && (p.dir === 'up' || p.dir === 'down')) {
        p.y = ny;
      } else if (p.dir === 'up' || p.dir === 'down') {
        p.y = curTileY; // Snapped
      }
    }

    // Pellet eating
    const eatResult = this.maze.eatPellet(curTileX, curTileY);
    if (eatResult.ate) {
      this.score += eatResult.points;
      if (this.score > this.highScore) this.highScore = this.score;
      this.events.onScoreChange?.(this.score);
      this.events.onPelletEaten?.(eatResult.type as any, eatResult.points);

      // Super Power Pellet triggers frightened mode in ghosts
      if (eatResult.type === 'power') {
        this.frightenGhosts();
      }

      // Check level cleared
      if (this.maze.remainingPellets === 0) {
        this.state = 'level_cleared';
        this.events.onStateChange?.(this.state);
        this.events.onLevelCleared?.();
      }
    }
  }

  private updateGhostMovement(dt: number): void {
    const playerTile: GridCoord = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    };

    for (const ghost of this.ghosts) {
      // Countdown frightened mode
      if (ghost.frightenedTimer > 0) {
        ghost.frightenedTimer = Math.max(0, ghost.frightenedTimer - dt);
        if (ghost.frightenedTimer === 0) {
          ghost.mode = 'chase';
        }
      }

      const curTileX = Math.round(ghost.x);
      const curTileY = Math.round(ghost.y);

      // Friction speed adjustments
      const terrainCost = this.maze.getTraversalCost(curTileX, curTileY);
      let speedMod = 1.0;
      if (terrainCost === 3.0) speedMod = 0.4;  // Ghost slowed in mud
      if (terrainCost === 0.5) speedMod = 1.4;  // Ghost fast on ice
      if (ghost.mode === 'frightened') speedMod *= 0.65; // Slower when frightened

      const moveDist = ghost.speed * speedMod * dt;

      // If ghost has reached or passed current target waypoint in path
      if (!ghost.path || ghost.path.length <= 1) {
        GhostAI.recalculatePath(ghost, playerTile, this.maze);
      }

      if (ghost.path && ghost.path.length > 1) {
        const nextWaypoint = ghost.path[1];
        const dx = nextWaypoint.x - ghost.x;
        const dy = nextWaypoint.y - ghost.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= moveDist) {
          ghost.x = nextWaypoint.x;
          ghost.y = nextWaypoint.y;
          ghost.path.shift(); // Remove reached waypoint
        } else {
          ghost.x += (dx / dist) * moveDist;
          ghost.y += (dy / dist) * moveDist;
          ghost.dir = GhostAI.getDirectionToNextTile({ x: curTileX, y: curTileY }, nextWaypoint);
        }
      }
    }
  }

  private checkCollisions(): void {
    const p = this.player;

    for (const ghost of this.ghosts) {
      const dx = p.x - ghost.x;
      const dy = p.y - ghost.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 0.65) {
        if (ghost.mode === 'frightened') {
          // Player eats ghost!
          const points = 200;
          this.score += points;
          if (this.score > this.highScore) this.highScore = this.score;
          this.events.onScoreChange?.(this.score);

          // Reset ghost to ghost spawn
          ghost.x = this.maze.ghostSpawn.x;
          ghost.y = this.maze.ghostSpawn.y;
          ghost.mode = 'chase';
          ghost.frightenedTimer = 0;
          ghost.path = [];

          this.events.onGhostEaten?.(ghost, points);
        } else if (p.invulnerableTimer <= 0) {
          // Player is caught!
          p.lives = Math.max(0, p.lives - 1);
          this.events.onLivesChange?.(p.lives);
          this.events.onPlayerCaught?.(p.lives);

          if (p.lives <= 0) {
            this.state = 'game_over';
            this.events.onStateChange?.(this.state);
          } else {
            // Respawn player
            p.x = this.maze.playerSpawn.x;
            p.y = this.maze.playerSpawn.y;
            p.dir = 'none';
            p.nextDir = 'none';
            p.invulnerableTimer = 2.5;

            // Reset ghosts to spawn
            this.ghosts.forEach((g) => {
              g.x = this.maze.ghostSpawn.x;
              g.y = this.maze.ghostSpawn.y;
              g.path = [];
            });
            this.recalculateAllGhostPaths();
          }
          break;
        }
      }
    }
  }

  public frightenGhosts(): void {
    this.ghosts.forEach((g) => {
      g.mode = 'frightened';
      g.frightenedTimer = 7.0; // 7 seconds of frightened state
      g.path = []; // Force recalculation away from player
    });
    this.recalculateAllGhostPaths();
  }

  public recalculateAllGhostPaths(): void {
    const playerTile: GridCoord = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    };

    for (const ghost of this.ghosts) {
      GhostAI.recalculatePath(ghost, playerTile, this.maze);
    }
  }

  private getNeighborTile(x: number, y: number, dir: Direction): GridCoord {
    switch (dir) {
      case 'left':
        return { x: x - 1, y };
      case 'right':
        return { x: x + 1, y };
      case 'up':
        return { x, y: y - 1 };
      case 'down':
        return { x, y: y + 1 };
      default:
        return { x, y };
    }
  }
}

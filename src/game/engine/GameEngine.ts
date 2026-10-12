/**
 * Cognitia Chase: Maze Agents — Core Game Engine
 * 
 * Implements the authentic 1980 arcade rules from "The Pac-Man Dossier" (Jamey Pittman)
 * with 60Hz fixed-timestep loop, sub-tile corner cutting, dot pause frames,
 * mode schedule timers, ghost house counters, bonus fruit, and scoring chains.
 * Also provides the teaching bridge to course search algorithms ("Algorithm Mode").
 */

import { MazeMap, CLASSIC_ARCADE_MAZE } from './MazeMap';
import {
  GhostAIController,
  GHOST_PROFILES,
  OPPOSITE_DIRECTION,
  DIR_OFFSETS,
} from './GhostAI';
import { SoundSynthesizer } from '../audio/SoundSynthesizer';
import type {
  PlayerEntity,
  GhostEntity,
  GhostPersonality,
  GameEngineState,
  GameMode,
  TargetingMode,
  Direction,
  GridCoord,
  BonusFruitEntity,
} from './types';

export interface GameEngineEvents {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onStateChange?: (state: GameEngineState) => void;
  onPelletEaten?: (pelletType: 'pellet' | 'power' | 'mud' | 'ice', points: number) => void;
  onFruitEaten?: (points: number, fruitType: string) => void;
  onGhostEaten?: (ghost: GhostEntity, points: number) => void;
  onPlayerCaught?: (livesLeft: number) => void;
  onLevelCleared?: () => void;
  onExtraLife?: () => void;
}

export class GameEngine {
  public maze: MazeMap;
  public player: PlayerEntity;
  public ghosts: GhostEntity[] = [];
  public fruit: BonusFruitEntity;
  public aiController: GhostAIController;
  public sound: SoundSynthesizer;

  public state: GameEngineState = 'ready';
  public mode: GameMode = 'arcade';
  public targetingMode: TargetingMode = 'classic';
  public score: number = 0;
  public highScore: number = 0;
  public currentLevel: number = 1;
  public speedMultiplier: number = 1.0;
  public activeGhostPersonality: GhostPersonality = 'blinky';

  // Mode schedule state
  public globalGhostMode: 'scatter' | 'chase' = 'scatter';
  public scatterChasePhase: number = 0;
  public phaseTimer: number = 7.0; // Level 1 starts with Scatter 1 for 7s

  // Ghost house release & scoring counters
  public dotsEatenThisRound: number = 0;
  public dotsEatenThisLife: number = 0;
  public inactivityTimer: number = 0;
  public ghostsEatenInPower: number = 0;
  public extraLifeAwarded: boolean = false;

  // Fixed timestep physics accumulator (60Hz)
  private readonly FIXED_DELTA = 1 / 60;
  private accumulator = 0;
  public readyTimer = 2.0;
  public deathTimer = 0;

  public events: GameEngineEvents = {};

  constructor(
    layout: string[] = CLASSIC_ARCADE_MAZE,
    mode: GameMode = 'arcade',
    ghostTypes: GhostPersonality[] = ['blinky', 'pinky', 'inky', 'clyde']
  ) {
    this.mode = mode;
    this.maze = new MazeMap(layout);
    this.aiController = new GhostAIController(this.maze);
    this.sound = new SoundSynthesizer(true);

    this.player = {
      x: this.maze.playerSpawn.x,
      y: this.maze.playerSpawn.y,
      dir: 'none',
      nextDir: 'none',
      speed: 6.0, // 80% base speed (7.5 * 0.8 = 6.0 tiles/sec)
      lives: 3,
      invulnerableTimer: 0,
      eatPauseFrames: 0,
    };

    this.fruit = {
      active: false,
      tile: { x: 13.5, y: 17 },
      type: 'cherry',
      points: 100,
      timer: 0,
      collected: false,
    };

    this.initGhosts(ghostTypes);
  }

  public setTargetingMode(mode: TargetingMode): void {
    this.targetingMode = mode;
    if (mode === 'algorithm') {
      this.initGhosts(['astar', 'bfs', 'ucs', 'greedy', 'dfs']);
    } else {
      this.initGhosts(['blinky', 'pinky', 'inky', 'clyde']);
    }
  }

  public initGhosts(ghostTypes: GhostPersonality[]): void {
    this.ghosts = [];
    const spawns = this.maze.ghostSpawns;
    const scatters = this.maze.scatterTargets;

    ghostTypes.forEach((type, idx) => {
      let spawnCoord: GridCoord = spawns.blinky;
      let scatterCoord: GridCoord = scatters.blinky;
      let inHouse = false;
      let initialDir: Direction = 'left';

      if (type === 'blinky' || type === 'astar') {
        spawnCoord = spawns.blinky; // (13.5, 11) outside
        scatterCoord = scatters.blinky;
        inHouse = false;
        initialDir = 'left';
      } else if (type === 'pinky' || type === 'greedy') {
        spawnCoord = spawns.pinky; // (13.5, 14) inside
        scatterCoord = scatters.pinky;
        inHouse = true;
        initialDir = 'up';
      } else if (type === 'inky' || type === 'ucs') {
        spawnCoord = spawns.inky; // (11.5, 14) inside
        scatterCoord = scatters.inky;
        inHouse = true;
        initialDir = 'up';
      } else if (type === 'clyde' || type === 'dfs') {
        spawnCoord = spawns.clyde; // (15.5, 14) inside
        scatterCoord = scatters.clyde;
        inHouse = true;
        initialDir = 'up';
      } else {
        spawnCoord = { x: 13.5, y: 11 + idx };
        scatterCoord = { x: 0, y: 0 };
      }

      const profile = GHOST_PROFILES[type];
      const ghost: GhostEntity = {
        id: `ghost-${type}`,
        personality: type,
        name: profile.name,
        codename: profile.codename,
        color: profile.color,
        x: spawnCoord.x,
        y: spawnCoord.y,
        targetTile: scatterCoord,
        scatterTile: scatterCoord,
        dir: initialDir,
        nextDir: initialDir,
        speed: 5.625, // 75% base speed (7.5 * 0.75 = 5.625 tiles/sec)
        mode: this.globalGhostMode,
        frightenedTimer: 0,
        inHouse,
        dotCounter: 0,
        cruiseElroy: 0,
        path: [],
        telemetry: {
          algorithm: type,
          name: profile.name,
          codename: profile.codename,
          accentColor: profile.color,
          currentTile: { x: Math.round(spawnCoord.x), y: Math.round(spawnCoord.y) },
          targetTile: scatterCoord,
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

      this.ghosts.push(ghost);
    });

    if (this.ghosts.length > 0) {
      this.activeGhostPersonality = this.ghosts[0].personality;
    }
  }

  public start(): void {
    if (this.state === 'game_over') {
      this.resetGame();
    } else if (this.state === 'player_caught') {
      this.resetLife(true);
    }
    this.state = 'running';
    this.readyTimer = 0;
    this.sound.playIntroJingle();
    this.events.onStateChange?.(this.state);
  }

  public pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
      this.sound.stopSiren();
      this.sound.stopFrightenedLoop();
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

  public setPlayerDirection(dir: Direction): void {
    if (this.state === 'player_caught') return; // Cannot steer while dying!
    this.player.nextDir = dir;
    if (this.state === 'ready' && dir !== 'none') {
      this.player.dir = dir;
      this.start();
    }
  }

  public resetLife(maintainScore: boolean = true): void {
    if (!maintainScore) {
      this.score = 0;
      this.player.lives = 3;
      this.currentLevel = 1;
      this.dotsEatenThisRound = 0;
      this.extraLifeAwarded = false;
      this.fruit.active = false;
    }

    this.state = 'ready';
    this.readyTimer = 2.0;
    this.deathTimer = 0;
    this.dotsEatenThisLife = 0;
    this.inactivityTimer = 0;
    this.ghostsEatenInPower = 0;
    this.globalGhostMode = 'scatter';
    this.scatterChasePhase = 0;
    this.phaseTimer = 7.0;

    // Reset player position
    this.player.x = this.maze.playerSpawn.x;
    this.player.y = this.maze.playerSpawn.y;
    this.player.dir = 'none';
    this.player.nextDir = 'none';
    this.player.eatPauseFrames = 0;
    this.player.invulnerableTimer = 2.0;

    // Reset ghost positions
    const spawns = this.maze.ghostSpawns;
    this.ghosts.forEach((g) => {
      if (g.personality === 'blinky' || g.personality === 'astar') {
        g.x = spawns.blinky.x;
        g.y = spawns.blinky.y;
        g.inHouse = false;
        g.dir = 'left';
      } else if (g.personality === 'pinky' || g.personality === 'greedy') {
        g.x = spawns.pinky.x;
        g.y = spawns.pinky.y;
        g.inHouse = true;
        g.dir = 'up';
      } else if (g.personality === 'inky' || g.personality === 'ucs') {
        g.x = spawns.inky.x;
        g.y = spawns.inky.y;
        g.inHouse = true;
        g.dir = 'up';
      } else {
        g.x = spawns.clyde.x;
        g.y = spawns.clyde.y;
        g.inHouse = true;
        g.dir = 'up';
      }
      g.nextDir = g.dir;
      g.mode = 'scatter';
      g.frightenedTimer = 0;
      g.path = [];
    });

    this.sound.stopSiren();
    this.sound.stopFrightenedLoop();

    this.events.onScoreChange?.(this.score);
    this.events.onLivesChange?.(this.player.lives);
    this.events.onStateChange?.(this.state);
  }

  public resetGame(): void {
    this.maze = new MazeMap(CLASSIC_ARCADE_MAZE);
    this.resetLife(false);
  }

  /**
   * Main game loop update call. Decoupled from monitor refresh rate.
   */
  public update(realDeltaSeconds: number): void {
    if (this.state === 'ready') {
      // Wait for player explicit input (arrow keys, WASD, touch D-pad, or click Start/Continue)
      return;
    }

    if (this.state === 'player_caught') {
      this.deathTimer -= realDeltaSeconds;
      if (this.deathTimer <= 0) {
        if (this.player.lives > 0) {
          this.resetLife(true);
        } else {
          this.state = 'game_over';
          this.events.onStateChange?.(this.state);
        }
      }
      return;
    }

    if (this.state !== 'running') return;

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
    this.updateModeSchedule(dt);
    this.updateGhostHouseReleases(dt);
    this.updateFruit(dt);
    this.updatePlayerMovement(dt);
    this.updateGhostMovement(dt);
    this.checkCollisions();

    // Invulnerability countdown
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer = Math.max(0, this.player.invulnerableTimer - dt);
    }

    // Audio ambient siren updates
    const remainingRatio = 1.0 - this.maze.remainingPellets / Math.max(1, this.maze.totalPellets);
    const hasFrightened = this.ghosts.some((g) => g.mode === 'frightened');
    if (hasFrightened) {
      this.sound.startFrightenedLoop();
    } else {
      this.sound.stopFrightenedLoop();
      this.sound.updateSiren(remainingRatio);
    }
  }

  /**
   * Mode Timing Schedule (Scatter / Chase phases)
   * Transitions reverse ghost directions immediately!
   */
  private updateModeSchedule(dt: number): void {
    // If any ghost is frightened, scatter/chase timers pause
    if (this.ghosts.some((g) => g.mode === 'frightened')) return;

    if (this.phaseTimer !== Infinity) {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.scatterChasePhase++;
        this.applyPhaseSchedule();
      }
    }
  }

  private applyPhaseSchedule(): void {
    // Level 1 schedule:
    // P0: Scatter (7s), P1: Chase (20s), P2: Scatter (7s), P3: Chase (20s)
    // P4: Scatter (5s), P5: Chase (20s), P6: Scatter (5s), P7: Chase (permanent)
    switch (this.scatterChasePhase) {
      case 0:
        this.globalGhostMode = 'scatter';
        this.phaseTimer = 7.0;
        break;
      case 1:
        this.globalGhostMode = 'chase';
        this.phaseTimer = 20.0;
        break;
      case 2:
        this.globalGhostMode = 'scatter';
        this.phaseTimer = 7.0;
        break;
      case 3:
        this.globalGhostMode = 'chase';
        this.phaseTimer = 20.0;
        break;
      case 4:
        this.globalGhostMode = 'scatter';
        this.phaseTimer = 5.0;
        break;
      case 5:
        this.globalGhostMode = 'chase';
        this.phaseTimer = 20.0;
        break;
      case 6:
        this.globalGhostMode = 'scatter';
        this.phaseTimer = 5.0;
        break;
      case 7:
      default:
        this.globalGhostMode = 'chase';
        this.phaseTimer = Infinity;
        break;
    }

    // When phase changes, all non-frightened, non-eaten ghosts immediately reverse direction!
    this.ghosts.forEach((g) => {
      if (g.mode !== 'frightened' && g.mode !== 'eaten' && !g.inHouse) {
        g.mode = this.globalGhostMode;
        g.dir = OPPOSITE_DIRECTION[g.dir];
        g.nextDir = g.dir;
      }
    });
  }

  /**
   * Ghost House Release System (staggered dot counters + 4s inactivity timer)
   */
  private updateGhostHouseReleases(dt: number): void {
    this.inactivityTimer += dt;

    // Pinky exits immediately on start
    const pinky = this.ghosts.find((g) => g.personality === 'pinky' || g.personality === 'greedy');
    if (pinky && pinky.inHouse) {
      this.releaseGhostFromHouse(pinky);
    }

    // Inky exits after 30 dots (or 4s inactivity)
    const inky = this.ghosts.find((g) => g.personality === 'inky' || g.personality === 'ucs');
    if (inky && inky.inHouse) {
      if (this.dotsEatenThisLife >= 30 || this.inactivityTimer >= 4.0) {
        this.releaseGhostFromHouse(inky);
        this.inactivityTimer = 0;
      }
    }

    // Clyde exits after 60 dots (or 4s inactivity)
    const clyde = this.ghosts.find((g) => g.personality === 'clyde' || g.personality === 'dfs');
    if (clyde && clyde.inHouse) {
      if (this.dotsEatenThisLife >= 60 || this.inactivityTimer >= 4.0) {
        this.releaseGhostFromHouse(clyde);
        this.inactivityTimer = 0;
      }
    }
  }

  private releaseGhostFromHouse(ghost: GhostEntity): void {
    // Move up through the ghost house door to (13.5, 11)
    ghost.x = 13.5;
    ghost.y = 11;
    ghost.inHouse = false;
    ghost.dir = 'left';
    ghost.nextDir = 'left';
    ghost.mode = this.globalGhostMode;
  }

  /**
   * Bonus Fruit System (spawns at 70 and 170 dots)
   */
  private updateFruit(dt: number): void {
    if (this.fruit.active) {
      this.fruit.timer -= dt;
      if (this.fruit.timer <= 0) {
        this.fruit.active = false;
      }
    } else if (!this.fruit.collected) {
      if (this.dotsEatenThisRound === 70 || this.dotsEatenThisRound === 170) {
        this.spawnFruit();
      }
    }
  }

  private spawnFruit(): void {
    this.fruit.active = true;
    this.fruit.timer = 9.5; // Displays for 9.5 seconds
    this.fruit.tile = { x: 13.5, y: 17 };

    // Fruit value & type based on level
    if (this.currentLevel === 1) {
      this.fruit.type = 'cherry';
      this.fruit.points = 100;
    } else if (this.currentLevel === 2) {
      this.fruit.type = 'strawberry';
      this.fruit.points = 300;
    } else if (this.currentLevel === 3) {
      this.fruit.type = 'peach';
      this.fruit.points = 500;
    } else if (this.currentLevel === 4) {
      this.fruit.type = 'apple';
      this.fruit.points = 700;
    } else if (this.currentLevel === 5) {
      this.fruit.type = 'melon';
      this.fruit.points = 1000;
    } else {
      this.fruit.type = 'bell';
      this.fruit.points = 3000;
    }
  }

  /**
   * Player Movement with Pre-Turn Corner-Cutting & Dot-Eating Pauses
   */
  private updatePlayerMovement(dt: number): void {
    const p = this.player;

    // 1-frame pause for dot, 3-frame pause for energizer
    if (p.eatPauseFrames > 0) {
      p.eatPauseFrames--;
      return;
    }

    const curTileX = Math.round(p.x);
    const curTileY = Math.round(p.y);

    // Pre-Turn & Corner-Cutting
    if (p.nextDir !== 'none' && p.nextDir !== p.dir) {
      // Reversal is instant
      if (p.nextDir === OPPOSITE_DIRECTION[p.dir]) {
        p.dir = p.nextDir;
      } else {
        // Perpendicular corner-cutting: if within 0.4 tiles of center and turn path is open
        const dxFromCenter = Math.abs(p.x - curTileX);
        const dyFromCenter = Math.abs(p.y - curTileY);

        if (dxFromCenter < 0.4 && dyFromCenter < 0.4) {
          const offset = DIR_OFFSETS[p.nextDir];
          const targetTileX = curTileX + offset.dx;
          const targetTileY = curTileY + offset.dy;

          if (this.maze.isWalkable(targetTileX, targetTileY, false)) {
            // Snap the perpendicular axis to tile center for a clean corner cut
            if (p.nextDir === 'up' || p.nextDir === 'down') {
              p.x = curTileX;
            } else {
              p.y = curTileY;
            }
            p.dir = p.nextDir;
          }
        }
      }
    }

    // Calculate movement distance
    const dist = p.speed * dt;

    if (p.dir !== 'none') {
      let nx = p.x;
      let ny = p.y;

      if (p.dir === 'left') nx -= dist;
      if (p.dir === 'right') nx += dist;
      if (p.dir === 'up') ny -= dist;
      if (p.dir === 'down') ny += dist;

      // Tunnel wrap-around at row 14 for horizontal movement
      if (curTileY === 14 && (p.dir === 'left' || p.dir === 'right')) {
        if (nx < -0.5) {
          nx = this.maze.width - 0.5;
        } else if (nx > this.maze.width - 0.5) {
          nx = -0.5;
        }
      }

      // Horizontal movement collision check
      if (p.dir === 'left' || p.dir === 'right') {
        if (curTileY === 14 && (nx < 0 || nx >= this.maze.width - 1)) {
          // Inside tunnel screen-edge corridor: allow free wrap traversal
          p.x = nx;
        } else {
          const checkX = p.dir === 'left' ? Math.floor(nx) : Math.ceil(nx);
          if (this.maze.isWalkable(checkX, curTileY, false)) {
            p.x = nx;
          } else {
            p.x = curTileX;
          }
        }
      }

      // Vertical movement collision check (unblocked on ALL rows including row 14)
      if (p.dir === 'up' || p.dir === 'down') {
        const checkY = p.dir === 'up' ? Math.floor(ny) : Math.ceil(ny);
        if (this.maze.isWalkable(curTileX, checkY, false)) {
          p.y = ny;
        } else {
          p.y = curTileY;
        }
      }
    }

    // Pellet eating
    const eatResult = this.maze.eatPellet(curTileX, curTileY);
    if (eatResult) {
      this.score += eatResult.points;
      this.dotsEatenThisRound++;
      this.dotsEatenThisLife++;
      this.inactivityTimer = 0; // Reset 4s timeout

      if (this.score > this.highScore) this.highScore = this.score;

      // 10,000 extra life check
      if (this.score >= 10000 && !this.extraLifeAwarded) {
        this.extraLifeAwarded = true;
        this.player.lives++;
        this.sound.playExtraLife();
        this.events.onExtraLife?.();
        this.events.onLivesChange?.(this.player.lives);
      }

      this.events.onScoreChange?.(this.score);
      this.events.onPelletEaten?.(eatResult.type as any, eatResult.points);

      // Frame pause
      if (eatResult.type === 'power') {
        p.eatPauseFrames = 3;
        this.frightenGhosts();
        this.sound.playPowerPulse();
      } else {
        p.eatPauseFrames = 1;
        this.sound.playMunch();
      }

      // Check level cleared
      if (this.maze.remainingPellets === 0) {
        this.state = 'level_cleared';
        this.events.onStateChange?.(this.state);
        this.events.onLevelCleared?.();
      }
    }

    // Fruit eating collision
    if (this.fruit.active) {
      const fDist = Math.hypot(p.x - this.fruit.tile.x, p.y - this.fruit.tile.y);
      if (fDist < 0.6) {
        this.fruit.active = false;
        this.score += this.fruit.points;
        if (this.score > this.highScore) this.highScore = this.score;
        this.sound.playFruitEaten();
        this.events.onScoreChange?.(this.score);
        this.events.onFruitEaten?.(this.fruit.points, this.fruit.type);
      }
    }
  }

  /**
   * Ghost Movement & Decision Loop
   */
  private updateGhostMovement(dt: number): void {
    const playerTile: GridCoord = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
    };

    const blinky = this.ghosts.find((g) => g.personality === 'blinky' || g.personality === 'astar');
    const blinkyTile: GridCoord = blinky
      ? { x: Math.round(blinky.x), y: Math.round(blinky.y) }
      : playerTile;

    // Cruise Elroy speedup for Blinky
    if (blinky && this.currentLevel === 1) {
      if (this.maze.remainingPellets <= 10) blinky.cruiseElroy = 2;
      else if (this.maze.remainingPellets <= 20) blinky.cruiseElroy = 1;
    }

    for (const ghost of this.ghosts) {
      // Countdown frightened mode
      if (ghost.frightenedTimer > 0) {
        ghost.frightenedTimer = Math.max(0, ghost.frightenedTimer - dt);
        if (ghost.frightenedTimer === 0 && ghost.mode === 'frightened') {
          ghost.mode = this.globalGhostMode;
        }
      }

      const curTileX = Math.round(ghost.x);
      const curTileY = Math.round(ghost.y);

      // Determine ghost speed based on level and state
      let speedTilesPerSec = 5.625; // Normal 75%
      if (this.maze.isTunnel(curTileX, curTileY)) {
        speedTilesPerSec = 3.0; // Tunnel 40%
      } else if (ghost.mode === 'frightened') {
        speedTilesPerSec = 3.75; // Frightened 50%
      } else if (ghost.mode === 'eaten') {
        speedTilesPerSec = 15.0; // Eyes 200%
      } else if (ghost.cruiseElroy === 1) {
        speedTilesPerSec = 6.0; // Elroy 1: 80%
      } else if (ghost.cruiseElroy === 2) {
        speedTilesPerSec = 6.375; // Elroy 2: 85%
      }

      ghost.speed = speedTilesPerSec;
      const moveDist = ghost.speed * dt;

      // Check if ghost reached ghost pen door while eaten
      if (ghost.mode === 'eaten') {
        const distToDoor = Math.hypot(ghost.x - 13.5, ghost.y - 11);
        if (distToDoor < 0.3) {
          // Enter house, revive, and exit
          ghost.mode = this.globalGhostMode;
          ghost.frightenedTimer = 0;
          ghost.dir = 'left';
        }
      }

      // Check intersection decision point: when near tile center, pick next direction
      const dxCenter = Math.abs(ghost.x - curTileX);
      const dyCenter = Math.abs(ghost.y - curTileY);

      if (dxCenter < 0.08 && dyCenter < 0.08) {
        this.aiController.updateGhostDecision(
          ghost,
          playerTile,
          this.player.dir,
          blinkyTile,
          this.targetingMode
        );
        if (ghost.nextDir !== 'none') {
          ghost.dir = ghost.nextDir;
        }
      }

      // Move ghost
      if (ghost.dir !== 'none') {
        let gx = ghost.x;
        let gy = ghost.y;

        if (ghost.dir === 'left') gx -= moveDist;
        if (ghost.dir === 'right') gx += moveDist;
        if (ghost.dir === 'up') gy -= moveDist;
        if (ghost.dir === 'down') gy += moveDist;

        // Tunnel wrap-around at row 14
        if (curTileY === 14) {
          if (gx < -0.5) gx = this.maze.width - 0.5;
          else if (gx > this.maze.width - 0.5) gx = -0.5;
        }

        ghost.x = gx;
        ghost.y = gy;
      }
    }
  }

  public frightenGhosts(): void {
    this.ghostsEatenInPower = 0;
    const duration = this.currentLevel === 1 ? 6.0 : Math.max(2.0, 6.0 - this.currentLevel * 0.5);

    this.ghosts.forEach((g) => {
      if (g.mode !== 'eaten' && !g.inHouse) {
        g.mode = 'frightened';
        g.frightenedTimer = duration;
        // Reverse direction upon entering frightened mode
        g.dir = OPPOSITE_DIRECTION[g.dir];
        g.nextDir = g.dir;
      }
    });
  }

  /**
   * Collision Detection: Player vs Ghosts
   */
  private checkCollisions(): void {
    if (this.player.invulnerableTimer > 0) return;

    for (const ghost of this.ghosts) {
      const dist = Math.hypot(this.player.x - ghost.x, this.player.y - ghost.y);

      if (dist < 0.55) {
        if (ghost.mode === 'frightened') {
          // Eat ghost: 200, 400, 800, 1600 points chain
          this.ghostsEatenInPower++;
          const points = Math.min(1600, 200 * Math.pow(2, this.ghostsEatenInPower - 1));
          this.score += points;
          if (this.score > this.highScore) this.highScore = this.score;

          ghost.mode = 'eaten';
          ghost.frightenedTimer = 0;

          this.sound.playGhostEaten();
          this.events.onScoreChange?.(this.score);
          this.events.onGhostEaten?.(ghost, points);
        } else if (ghost.mode !== 'eaten' && !ghost.inHouse) {
          // Player caught
          this.handlePlayerDeath();
          break;
        }
      }
    }
  }

  private handlePlayerDeath(): void {
    this.player.lives = Math.max(0, this.player.lives - 1);
    this.state = 'player_caught';
    this.deathTimer = 1.5;
    this.sound.playDeathSequence();
    this.events.onLivesChange?.(this.player.lives);
    this.events.onPlayerCaught?.(this.player.lives);
    this.events.onStateChange?.(this.state);
  }
}

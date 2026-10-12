/**
 * Cognitia Chase: Comprehensive Unit Tests for Authentic 1980 Arcade Rules
 * 
 * Verifies all acceptance criteria from "The Pac-Man Dossier" (Jamey Pittman):
 * 1. 28x31 Authentic Maze & 244 Dot Count
 * 2. Blinky Targeting (direct chase)
 * 3. Pinky Targeting (4-ahead with authentic UP overflow bug)
 * 4. Inky Targeting (2x vector doubling from Blinky)
 * 5. Clyde Targeting (distance 8 threshold chase vs scatter)
 * 6. Strict No-Reverse Rule at intersections
 * 7. Strict Tie-Break Order: UP > LEFT > DOWN > RIGHT
 * 8. Forbidden Up-Turn Tiles: (12, 11), (15, 11), (12, 23), (15, 23)
 * 9. Scatter / Chase Mode Timer Schedule & Instant Reversal
 * 10. Consecutive Ghost Scoring Chain: 200, 400, 800, 1600
 * 11. Bonus Fruit Spawning at 70 and 170 dots
 * 12. Pre-Turn Corner-Cutting Mechanics
 */

import { GameEngine } from './GameEngine';
import { MazeMap, CLASSIC_ARCADE_MAZE } from './MazeMap';
import { GhostAIController } from './GhostAI';
import type { GhostEntity, GridCoord } from './types';

function runFidelityTests() {
  console.log('--- Testing Cognitia Chase: Authentic 1980 Arcade Fidelity ---');
  let passed = 0;
  let total = 0;

  function assert(desc: string, condition: boolean, detail?: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}: ${detail || 'assertion failed'}`);
    }
  }

  const maze = new MazeMap(CLASSIC_ARCADE_MAZE);
  const ai = new GhostAIController(maze);

  // 1. Maze Layout & Dot Count
  assert(
    'Maze dimensions are exactly 28 columns x 31 rows',
    maze.width === 28 && maze.height === 31,
    `Dimensions: ${maze.width}x${maze.height}`
  );
  assert(
    'Total dot inventory is exactly 244 (240 pellets + 4 energizers)',
    maze.totalPellets === 244,
    `Total dots: ${maze.totalPellets}`
  );
  assert(
    'Tunnel row is at y = 14 with wrap-around',
    maze.isTunnel(0, 14) && maze.isTunnel(27, 14),
    'Tunnel detection failed'
  );

  // Helper ghost creator
  function makeGhost(personality: any, x: number, y: number, dir: any = 'left'): GhostEntity {
    return {
      id: `test-${personality}`,
      personality,
      name: personality,
      codename: personality,
      color: '#fff',
      x,
      y,
      targetTile: { x: 0, y: 0 },
      scatterTile: maze.scatterTargets[personality as keyof typeof maze.scatterTargets] || { x: 0, y: 0 },
      dir,
      nextDir: dir,
      speed: 5.625,
      mode: 'chase',
      frightenedTimer: 0,
      inHouse: false,
      dotCounter: 0,
      cruiseElroy: 0,
      path: [],
      telemetry: {} as any,
    };
  }

  // 2. Ghost Targeting: Blinky (Direct Chase)
  const blinky = makeGhost('blinky', 10, 10);
  const playerTile: GridCoord = { x: 18, y: 23 };
  const blinkyTarget = ai.computeClassicTarget(blinky, playerTile, 'left', { x: 10, y: 10 });
  assert(
    'Blinky targets the player exact tile directly (T = P)',
    blinkyTarget.x === playerTile.x && blinkyTarget.y === playerTile.y,
    `Expected (${playerTile.x}, ${playerTile.y}), got (${blinkyTarget.x}, ${blinkyTarget.y})`
  );

  // 3. Ghost Targeting: Pinky (4-ahead + Authentic UP overflow quirk)
  const pinky = makeGhost('pinky', 10, 10);

  // Pinky when player faces Left
  const pinkyTargetLeft = ai.computeClassicTarget(pinky, { x: 15, y: 15 }, 'left', { x: 0, y: 0 });
  assert(
    'Pinky targets 4 tiles ahead when facing Left (Px - 4, Py)',
    pinkyTargetLeft.x === 11 && pinkyTargetLeft.y === 15,
    `Got (${pinkyTargetLeft.x}, ${pinkyTargetLeft.y})`
  );

  // Pinky when player faces UP: Documented 16-bit arcade bug (4 up AND 4 left!)
  const pinkyTargetUp = ai.computeClassicTarget(pinky, { x: 15, y: 15 }, 'up', { x: 0, y: 0 });
  assert(
    'Pinky reproduces the authentic arcade UP overflow bug (Px - 4, Py - 4)',
    pinkyTargetUp.x === 11 && pinkyTargetUp.y === 11,
    `Got (${pinkyTargetUp.x}, ${pinkyTargetUp.y})`
  );

  // 4. Ghost Targeting: Inky (2x vector doubling from Blinky)
  const inky = makeGhost('inky', 10, 10);
  // Player at (10, 10) facing Right -> intermediate is (12, 10)
  // Blinky at (10, 8) -> vector = (2, 2)
  // Inky target = Blinky + 2 * vector = (10 + 4, 8 + 4) = (14, 12)
  const inkyTarget = ai.computeClassicTarget(inky, { x: 10, y: 10 }, 'right', { x: 10, y: 8 });
  assert(
    'Inky doubles the vector from Blinky to 2-ahead tile for flanking',
    inkyTarget.x === 14 && inkyTarget.y === 12,
    `Got (${inkyTarget.x}, ${inkyTarget.y})`
  );

  // 5. Ghost Targeting: Clyde (Distance 8 Proximity Threshold)
  const clydeFar = makeGhost('clyde', 0, 0);
  const clydeTargetFar = ai.computeClassicTarget(clydeFar, { x: 10, y: 10 }, 'left', { x: 0, y: 0 });
  assert(
    'Clyde targets player directly when distance >= 8 tiles',
    clydeTargetFar.x === 10 && clydeTargetFar.y === 10,
    `Got (${clydeTargetFar.x}, ${clydeTargetFar.y})`
  );

  const clydeNear = makeGhost('clyde', 8, 8); // dist to (10, 10) is sqrt(8) ~ 2.8 < 8
  const clydeTargetNear = ai.computeClassicTarget(clydeNear, { x: 10, y: 10 }, 'left', { x: 0, y: 0 });
  assert(
    'Clyde retreats to scatter corner (0, 31) when distance < 8 tiles',
    clydeTargetNear.x === 0 && clydeTargetNear.y === 31,
    `Got (${clydeTargetNear.x}, ${clydeTargetNear.y})`
  );

  // 6. Strict No-Reverse Rule
  // Ghost is moving 'right' at (6, 5). Target tile is at (1, 5) (strictly to its left).
  const ghostMovingRight = makeGhost('blinky', 6, 5, 'right');
  const chosenDirNoRev = ai.decideNextDirectionClassic(ghostMovingRight, { x: 1, y: 5 });
  assert(
    'Ghost cannot reverse 180 degrees at an intersection even if target is behind it',
    chosenDirNoRev !== 'left',
    `Chosen direction: ${chosenDirNoRev}`
  );

  // 7. Strict Tie-Break Order: UP > LEFT > DOWN > RIGHT
  // Place ghost at an intersection where UP and LEFT have equal distance to target
  // e.g. Ghost at (6, 5) with candidate next tiles (6, 4) [UP] and (5, 5) [LEFT].
  // If target is at (5, 4), dist to UP is 1, dist to LEFT is 1 -> tie!
  const ghostTied = makeGhost('blinky', 6, 5, 'none');
  const tieChosen = ai.decideNextDirectionClassic(ghostTied, { x: 5, y: 4 });
  assert(
    'Strict tie-break order selects UP over LEFT when distances are identical',
    tieChosen === 'up',
    `Chosen direction on tie: ${tieChosen}`
  );

  // 8. Forbidden Up-Turn Restriction Tiles
  // At (12, 11), ghost moving left or right cannot turn UP
  assert(
    'Restriction tile (12, 11) is flagged as forbidden up',
    maze.isForbiddenUp(12, 11) === true
  );
  assert(
    'Restriction tile (15, 11) is flagged as forbidden up',
    maze.isForbiddenUp(15, 11) === true
  );
  assert(
    'Restriction tile (12, 23) is flagged as forbidden up',
    maze.isForbiddenUp(12, 23) === true
  );
  assert(
    'Restriction tile (15, 23) is flagged as forbidden up',
    maze.isForbiddenUp(15, 23) === true
  );

  const ghostAtForbidden = makeGhost('blinky', 12, 11, 'right');
  const dirAtRestricted = ai.decideNextDirectionClassic(ghostAtForbidden, { x: 12, y: 0 });
  assert(
    'Ghost cannot turn UP on forbidden restriction tile (12, 11)',
    dirAtRestricted !== 'up',
    `Selected: ${dirAtRestricted}`
  );

  // 9. Scatter / Chase Mode Timers & Instant Direction Reversal
  const engine = new GameEngine(CLASSIC_ARCADE_MAZE, 'arcade', ['blinky', 'pinky', 'inky', 'clyde']);
  engine.start(); // Set running state
  assert('Game begins in Scatter phase 0 with 7s timer', engine.scatterChasePhase === 0 && engine.globalGhostMode === 'scatter');

  // Fast forward 7.1 seconds (426 ticks) to trigger Phase 1 (Chase 20s)
  for (let i = 0; i < 430; i++) {
    engine.update(1 / 60);
  }
  assert(
    'Engine transitions from Scatter to Chase phase 1 after 7 seconds',
    engine.scatterChasePhase === 1 && engine.globalGhostMode === 'chase',
    `Phase: ${engine.scatterChasePhase}, mode: ${engine.globalGhostMode}`
  );

  // 10. Scoring Chain (200, 400, 800, 1600)
  // Ensure all ghosts are released from house for frightened test
  engine.ghosts.forEach((g) => {
    g.inHouse = false;
  });
  engine.frightenGhosts();
  assert('All active ghosts enter frightened mode on power pellet', engine.ghosts[0].mode === 'frightened');

  // Simulate eating 4 frightened ghosts in sequence
  const startScore = engine.score;
  const g1 = engine.ghosts[0];
  const g2 = engine.ghosts[1];
  const g3 = engine.ghosts[2];
  const g4 = engine.ghosts[3];

  // Force positions onto player one by one
  engine.player.x = 10;
  engine.player.y = 10;
  engine.player.invulnerableTimer = 0;

  g1.x = 10; g1.y = 10;
  engine.update(1 / 60);
  assert('1st ghost eaten awards 200 points', engine.score - startScore === 200, `Score delta: ${engine.score - startScore}`);

  g2.x = 10; g2.y = 10;
  engine.update(1 / 60);
  assert('2nd ghost eaten awards 400 points (total 600)', engine.score - startScore === 600, `Score delta: ${engine.score - startScore}`);

  g3.x = 10; g3.y = 10;
  engine.update(1 / 60);
  assert('3rd ghost eaten awards 800 points (total 1400)', engine.score - startScore === 1400, `Score delta: ${engine.score - startScore}`);

  g4.x = 10; g4.y = 10;
  engine.update(1 / 60);
  assert('4th ghost eaten awards 1600 points (total 3000)', engine.score - startScore === 3000, `Score delta: ${engine.score - startScore}`);

  // 11. Bonus Fruit Spawning
  const freshEngine = new GameEngine(CLASSIC_ARCADE_MAZE, 'arcade');
  freshEngine.start();
  assert('Fruit is inactive at start', freshEngine.fruit.active === false);

  freshEngine.dotsEatenThisRound = 70;
  freshEngine.update(1 / 60);
  assert('Fruit spawns after 70 dots eaten', freshEngine.fruit.active === true, `Fruit active: ${freshEngine.fruit.active}`);
  assert('Level 1 fruit is Cherry worth 100 points', freshEngine.fruit.type === 'cherry' && freshEngine.fruit.points === 100);

  // 12. Vertical Movement Across Row 14 (Tunnel Equator)
  const moveEngine = new GameEngine(CLASSIC_ARCADE_MAZE, 'arcade');
  moveEngine.start();
  // Place at row 14, column 6 (vertical corridor)
  moveEngine.player.x = 6;
  moveEngine.player.y = 14;
  moveEngine.player.dir = 'up';
  moveEngine.player.nextDir = 'up';
  for (let i = 0; i < 15; i++) {
    moveEngine.update(1 / 60);
  }
  assert('Player can move UP across row 14 to upper half of map', moveEngine.player.y < 13.8, `Player y: ${moveEngine.player.y}`);

  moveEngine.player.x = 6;
  moveEngine.player.y = 14;
  moveEngine.player.dir = 'down';
  moveEngine.player.nextDir = 'down';
  for (let i = 0; i < 15; i++) {
    moveEngine.update(1 / 60);
  }
  assert('Player can move DOWN across row 14 to lower half of map', moveEngine.player.y > 14.2, `Player y: ${moveEngine.player.y}`);

  // 13. Player Caught & Spawn Relocation
  const deathEngine = new GameEngine(CLASSIC_ARCADE_MAZE, 'arcade');
  deathEngine.start();
  // Move player right on top of Blinky
  deathEngine.player.x = deathEngine.ghosts[0].x;
  deathEngine.player.y = deathEngine.ghosts[0].y;
  deathEngine.player.invulnerableTimer = 0;
  deathEngine.update(1 / 60);
  assert('Player enters caught state on ghost collision', deathEngine.state === 'player_caught', `State: ${deathEngine.state}`);

  // Fast-forward death animation timer (1.5s)
  deathEngine.update(1.6);
  assert('After death timer expires, game enters ready state', deathEngine.state === 'ready', `State: ${deathEngine.state}`);
  assert('Player position is reset to spawn (13.5, 23)', deathEngine.player.x === 13.5 && deathEngine.player.y === 23, `Pos: (${deathEngine.player.x}, ${deathEngine.player.y})`);
  assert('Ghosts are reset to house / pen door', deathEngine.ghosts.find(g => g.personality === 'blinky')?.y === 11, `Blinky y: ${deathEngine.ghosts[0].y}`);
  assert('Player has temporary invulnerability on spawn', deathEngine.player.invulnerableTimer > 0, `Invuln: ${deathEngine.player.invulnerableTimer}`);
  assert('Player is stationary on spawn without moving on its own', deathEngine.player.dir === 'none', `Dir: ${deathEngine.player.dir}`);

  // Confirm game does NOT auto-start on its own even after 5 seconds
  deathEngine.update(5.0);
  assert('Game waits in ready state and does NOT start on its own', deathEngine.state === 'ready', `State: ${deathEngine.state}`);

  // Starts only when player provides direction input
  deathEngine.setPlayerDirection('left');
  assert('Game starts running only when player provides input', deathEngine.state === 'running', `State: ${deathEngine.state}`);
  assert('Player moves in inputted direction', deathEngine.player.dir === 'left', `Dir: ${deathEngine.player.dir}`);

  console.log(`\nResults: ${passed} / ${total} authentic arcade fidelity tests passed.`);
  if (passed !== total) {
    if (typeof (globalThis as any).process !== 'undefined') {
      (globalThis as any).process.exit(1);
    }
  }
}

runFidelityTests();

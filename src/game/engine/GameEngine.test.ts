import { GameEngine } from './GameEngine';
import { MazeMap, DEFAULT_MAZE_LAYOUTS } from './MazeMap';
import { GhostAI } from './GhostAI';

function runEngineTests() {
  console.log('--- Testing Cognitia Chase: GameEngine & Ghost AI ---');
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

  // 1. MazeMap parsing and terrain costs
  const testLayout = [
    '#####',
    '#P.G#',
    '#MoI#',
    '#####',
  ];
  const maze = new MazeMap(testLayout);
  assert('Maze dimensions parsed correctly', maze.width === 5 && maze.height === 4);
  assert('Player spawn found at (1, 1)', maze.playerSpawn.x === 1 && maze.playerSpawn.y === 1);
  assert('Mud tile cost is 3.0', maze.getTraversalCost(1, 2) === 3.0);
  assert('Ice tile cost is 0.5', maze.getTraversalCost(3, 2) === 0.5);
  assert('Standard pellet cost is 1.0', maze.getTraversalCost(2, 1) === 1.0);
  assert('Wall cost is Infinity', maze.getTraversalCost(0, 0) === Infinity);

  // 2. Ghost AI pathfinding across all 5 personalities
  const personalities = ['bfs', 'ucs', 'dfs', 'greedy', 'astar'] as const;
  for (const p of personalities) {
    const ghost = GhostAI.createGhost(p, { x: 3, y: 1 });
    GhostAI.recalculatePath(ghost, { x: 1, y: 1 }, maze);
    assert(
      `Ghost [${ghost.name} / ${p.toUpperCase()}] calculates non-empty path`,
      ghost.path.length > 0,
      `Path length: ${ghost.path.length}`
    );
    assert(
      `Ghost [${p}] telemetry records expanded nodes`,
      ghost.telemetry.nodesExpanded >= 1
    );
  }

  // 3. GameEngine initialization and state machine
  const engine = new GameEngine(DEFAULT_MAZE_LAYOUTS.level1_wave, 'campaign', ['bfs']);
  assert('Engine starts in ready state', engine.state === 'ready');
  assert('Engine has 3 lives initially', engine.player.lives === 3);

  // 4. Moving player and collecting pellet
  engine.setPlayerDirection('right');
  assert('Setting direction transitions state to running', engine.state === 'running');

  // Advance time by 0.5 seconds (30 ticks)
  for (let i = 0; i < 30; i++) {
    engine.update(1 / 60);
  }
  assert('Player moves to the right', engine.player.x > engine.maze.playerSpawn.x);

  // 5. Test Frightened Mode and eating ghosts
  engine.frightenGhosts();
  assert('Ghosts enter frightened mode', engine.ghosts[0].mode === 'frightened');

  console.log(`\nResults: ${passed} / ${total} game engine tests passed.`);
  if (passed !== total) {
    if (typeof (globalThis as any).process !== 'undefined') {
      (globalThis as any).process.exit(1);
    }
  }
}

runEngineTests();

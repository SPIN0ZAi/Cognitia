import {
  runSearch,
  InteractiveSearchSession,
} from './GraphSearch';
import type { GraphSearchProblem } from './GraphSearch';
import { ROMANIA_GRAPH } from '../../data/romaniaData';

function createRomaniaProblem(startCity: string, goalCity: string, heuristicMultiplier = 1): GraphSearchProblem<string> {
  return {
    initialState: startCity,
    isGoal: (city: string) => city === goalCity,
    getSuccessors: (city: string) => {
      const data = ROMANIA_GRAPH[city];
      if (!data) return [];
      return data.connections.map((c) => ({
        state: c.target,
        cost: c.cost,
        action: `Drive to ${c.target}`,
      }));
    },
    getHeuristic: (city: string) => {
      if (city === goalCity) return 0;
      if (goalCity === 'Bucharest' && ROMANIA_GRAPH[city]?.straightLineToBucharest !== undefined) {
        return ROMANIA_GRAPH[city].straightLineToBucharest * heuristicMultiplier;
      }
      const cA = ROMANIA_GRAPH[city];
      const cG = ROMANIA_GRAPH[goalCity];
      if (!cA || !cG) return 0;
      const dx = cA.x - cG.x;
      const dy = cA.y - cG.y;
      return Math.round(Math.sqrt(dx * dx + dy * dy) * 0.6025) * heuristicMultiplier;
    },
    stateKey: (city: string) => city,
  };
}

function runTests() {
  console.log('--- Testing GraphSearch Module on Romania Graph ---');
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

  // 1. A* optimality on Arad -> Bucharest
  const astarProb = createRomaniaProblem('Arad', 'Bucharest');
  const astarRes = runSearch(astarProb, 'astar');
  assert('A* finds solution', astarRes.found);
  assert(
    'A* optimal cost is 418',
    astarRes.totalCost === 418,
    `Got ${astarRes.totalCost}`
  );
  assert(
    'A* path is Arad -> Sibiu -> Rimnicu Vilcea -> Pitesti -> Bucharest',
    JSON.stringify(astarRes.path) === JSON.stringify(['Arad', 'Sibiu', 'Rimnicu Vilcea', 'Pitesti', 'Bucharest']),
    `Path: ${astarRes.path.join(' -> ')}`
  );

  // 2. UCS optimality on Arad -> Bucharest
  const ucsRes = runSearch(astarProb, 'ucs');
  assert('UCS finds solution', ucsRes.found);
  assert('UCS optimal cost is 418', ucsRes.totalCost === 418, `Got ${ucsRes.totalCost}`);
  assert(
    'UCS path matches A* optimal path',
    JSON.stringify(ucsRes.path) === JSON.stringify(astarRes.path),
    `UCS path: ${ucsRes.path.join(' -> ')}`
  );

  // 3. BFS finds fewest edges on Arad -> Bucharest (Arad -> Sibiu -> Fagaras -> Bucharest = 3 hops, cost 450)
  const bfsRes = runSearch(astarProb, 'bfs');
  assert('BFS finds solution', bfsRes.found);
  assert(
    'BFS path has 3 hops (4 nodes)',
    bfsRes.path.length === 4,
    `Length: ${bfsRes.path.length}`
  );
  assert(
    'BFS path is Arad -> Sibiu -> Fagaras -> Bucharest',
    JSON.stringify(bfsRes.path) === JSON.stringify(['Arad', 'Sibiu', 'Fagaras', 'Bucharest']),
    `BFS path: ${bfsRes.path.join(' -> ')}`
  );
  assert('BFS total cost is 450 km', bfsRes.totalCost === 450, `Cost: ${bfsRes.totalCost}`);

  // 4. Greedy search on Arad -> Bucharest follows h(n)
  const greedyRes = runSearch(astarProb, 'greedy');
  assert('Greedy finds solution', greedyRes.found);
  assert(
    'Greedy path is Arad -> Sibiu -> Fagaras -> Bucharest',
    JSON.stringify(greedyRes.path) === JSON.stringify(['Arad', 'Sibiu', 'Fagaras', 'Bucharest']),
    `Greedy path: ${greedyRes.path.join(' -> ')}`
  );

  // 5. InteractiveSearchSession step-by-step matches batch execution
  const session = new InteractiveSearchSession(astarProb, 'astar');
  while (!session.getSnapshot().isFinished) {
    session.step();
  }
  const snap = session.getSnapshot();
  assert('Interactive session reaches goal', snap.isFinished);
  assert('Interactive session cost equals 418', snap.totalCost === 418, `Got ${snap.totalCost}`);
  assert(
    'Interactive session path matches batch path',
    JSON.stringify(snap.solutionPath) === JSON.stringify(astarRes.path)
  );

  // 6. Test InteractiveSearchSession stepBack
  session.stepBack();
  const backSnap = session.getSnapshot();
  assert('stepBack restored unfinished state', !backSnap.isFinished);
  assert('stepBack restored frontier', backSnap.frontier.length > 0);

  // 7. Heuristic experiment: Inadmissible heuristic (overestimating)
  // Let's inflate Rimnicu Vilcea's heuristic artificially so A* avoids it and takes Fagaras instead
  const biasedProb: GraphSearchProblem<string> = {
    ...astarProb,
    getHeuristic: (city: string) => {
      if (city === 'Bucharest') return 0;
      if (city === 'Rimnicu Vilcea') return 999; // gross overestimate
      return ROMANIA_GRAPH[city]?.straightLineToBucharest || 0;
    },
  };
  const biasedAstar = runSearch(biasedProb, 'astar');
  assert('Biased heuristic makes A* pick sub-optimal route (Fagaras)', biasedAstar.path.includes('Fagaras'));
  assert('Biased cost is 450 > optimal 418', biasedAstar.totalCost === 450);

  console.log(`\nResults: ${passed} / ${total} tests passed.`);
  if (passed !== total) {
    if (typeof (globalThis as any).process !== 'undefined') {
      (globalThis as any).process.exit(1);
    }
  }
}

runTests();

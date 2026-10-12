/**
 * Cognitia Chase: Campaign Levels & Micro-Lessons
 * 
 * 6 progressive levels mapping directly to Intelligent Systems course concepts.
 * Each level features an academic micro-lesson and gating quiz questions.
 */

import type { CampaignLevelConfig } from './types';
import { DEFAULT_MAZE_LAYOUTS } from './MazeMap';

export const CAMPAIGN_LEVELS: CampaignLevelConfig[] = [
  {
    levelNumber: 1,
    title: 'Level 1: The Wave Arrives',
    subtitle: 'Breadth-First Search (BFS) & FIFO Frontier Dynamics',
    lessonId: 'lesson2',
    description:
      'Face "The Wave" — an enemy driven strictly by Breadth-First Search. It expands through the maze in concentric rings, always finding the path with the fewest steps.',
    enemies: ['bfs'],
    mazeLayout: DEFAULT_MAZE_LAYOUTS.level1_wave,
    mudAllowed: false,
    iceAllowed: false,
    quizQuestions: [
      {
        question: 'What data structure governs the frontier in Breadth-First Search (BFS)?',
        options: [
          'First-In, First-Out (FIFO) Queue',
          'Last-In, First-Out (LIFO) Stack',
          'Priority Queue sorted by heuristic h(n)',
          'Binary Search Tree',
        ],
        correctIndex: 0,
        explanation:
          'BFS systematically expands the shallowest unexpanded node first, which requires a First-In, First-Out (FIFO) queue.',
      },
      {
        question: 'Under what condition is BFS guaranteed to find the optimal (cheapest) solution?',
        options: [
          'Always, under any cost model',
          'Only when all step costs are identical (constant c > 0)',
          'Only when the graph is acyclic (a tree)',
          'When an admissible heuristic function is provided',
        ],
        correctIndex: 1,
        explanation:
          'BFS finds the path with the fewest actions (edges). It is only optimal in terms of total path cost when all action costs are equal.',
      },
    ],
  },
  {
    levelNumber: 2,
    title: "Level 2: The Miser's Toll",
    subtitle: 'Uniform-Cost Search (UCS / Dijkstra) & Cost-Sensitive Navigation',
    lessonId: 'lesson2',
    description:
      'Meet "The Miser" — driven by Uniform-Cost Search. The maze now contains Mud tiles (Cost = 3.0) and Ice superconductor tracks (Cost = 0.5). Notice how The Miser avoids mud even if it means taking a longer route!',
    enemies: ['ucs'],
    mazeLayout: DEFAULT_MAZE_LAYOUTS.level2_miser,
    mudAllowed: true,
    iceAllowed: true,
    quizQuestions: [
      {
        question: 'How does Uniform-Cost Search (UCS) prioritize which node to expand next?',
        options: [
          'Lowest estimated cost to goal h(n)',
          'Lowest accumulated path cost g(n) from the root',
          'Greatest depth in the search tree',
          'Arbitrary pseudo-random selection',
        ],
        correctIndex: 1,
        explanation:
          'UCS expands nodes in order of non-decreasing path cost g(n) using a Priority Queue.',
      },
      {
        question: 'Why does BFS fail to find the optimal path in a maze with Mud and Ice tiles?',
        options: [
          'BFS cannot handle cycles in a graph',
          'BFS minimizes step count, ignoring the higher cost of traversing mud',
          'BFS has exponential time complexity',
          'BFS requires an admissible heuristic',
        ],
        correctIndex: 1,
        explanation:
          'BFS only counts the number of edge hops; it treats a mud tile (cost 3) identical to an ice tile (cost 0.5), which leads to expensive sub-optimal paths.',
      },
    ],
  },
  {
    levelNumber: 3,
    title: 'Level 3: Down the Rabbit Hole',
    subtitle: 'Depth-First Search (DFS) & LIFO Winding Traps',
    lessonId: 'lesson2',
    description:
      'Face "The Plunger" — driven by Depth-First Search. Watch it dive deep down dead-end corridors and take bizarre winding routes. You can easily outsmart it by tricking it into deep branches!',
    enemies: ['dfs'],
    mazeLayout: DEFAULT_MAZE_LAYOUTS.level3_plunger,
    mudAllowed: false,
    iceAllowed: false,
    quizQuestions: [
      {
        question: 'Why is standard Depth-First Search (DFS) not optimal?',
        options: [
          'Because it uses excessive memory O(b^d)',
          'Because it may return the first deep path found rather than the shortest',
          'Because it cannot find a solution in finite graphs',
          'Because it requires precomputing heuristics',
        ],
        correctIndex: 1,
        explanation:
          'DFS commits to exploring the deepest branch first. As soon as it encounters any goal state, it returns that path immediately, even if a much shorter path existed on an alternate shallow branch.',
      },
      {
        question: 'What is the space complexity of Depth-First Search with branching factor b and maximum depth m?',
        options: ['O(b * m) linear memory', 'O(b^m) exponential memory', 'O(m^2)', 'O(1) constant'],
        correctIndex: 0,
        explanation:
          'DFS only needs to store the single path from the root to the leaf along with remaining unexpanded siblings, resulting in O(b * m) space complexity.',
      },
    ],
  },
  {
    levelNumber: 4,
    title: "Level 4: The Gambler's Trap",
    subtitle: 'Greedy Best-First Search & Heuristic Local Minima',
    lessonId: 'lesson3',
    description:
      'Enter "The Gambler" — driven purely by heuristic evaluation h(n). It sprints toward you aggressively, but notice what happens when a U-shaped wall stands between you: it gets trapped in dead ends!',
    enemies: ['greedy'],
    mazeLayout: DEFAULT_MAZE_LAYOUTS.level4_gambler,
    mudAllowed: false,
    iceAllowed: false,
    quizQuestions: [
      {
        question: 'What node does Greedy Best-First Search expand next?',
        options: [
          'Node with lowest f(n) = g(n) + h(n)',
          'Node estimated to be closest to the goal, evaluating only h(n)',
          'Node with lowest accumulated cost g(n)',
          'The shallowest node in the tree',
        ],
        correctIndex: 1,
        explanation:
          'Greedy best-first search expands the node that appears to be closest to the goal according to the heuristic function h(n), ignoring the path cost g(n).',
      },
      {
        question: 'Why can Greedy Best-First Search get trapped or take suboptimal detours around U-shaped walls?',
        options: [
          'Because it does not keep an explored set',
          'Because h(n) measures straight-line distance, pulling the agent into an enclosed pocket',
          'Because it is an uninformed search algorithm',
          'Because it has O(1) time complexity',
        ],
        correctIndex: 1,
        explanation:
          'As the agent approaches the back of a U-shaped barrier, straight-line heuristic distance h(n) decreases, tricking the algorithm into entering the cul-de-sac before backtracking.',
      },
    ],
  },
  {
    levelNumber: 5,
    title: "Level 5: The Strategist's Gambit",
    subtitle: 'A* Search & Admissible Heuristic Optimality',
    lessonId: 'lesson3',
    description:
      'Encounter "The Strategist" — driven by A* search evaluating f(n) = g(n) + h(n). It combines the cost-awareness of The Miser with the goal-directed focus of The Gambler, guaranteeing the optimal path!',
    enemies: ['astar'],
    mazeLayout: DEFAULT_MAZE_LAYOUTS.level5_strategist,
    mudAllowed: true,
    iceAllowed: true,
    quizQuestions: [
      {
        question: 'For A* tree search to guarantee finding the optimal solution, the heuristic h(n) must be:',
        options: [
          'Admissible (never overestimates the true remaining cost to goal)',
          'Inadmissible (overestimates cost to encourage speed)',
          'Monotonically decreasing to zero',
          'Strictly equal to 0 for all states',
        ],
        correctIndex: 0,
        explanation:
          'An admissible heuristic never overestimates the cost to reach the goal (h(n) <= h*(n)). This ensures A* never discards or delays the true optimal path.',
      },
      {
        question: 'In graph search, what stronger condition guarantees that A* never needs to reopen a closed node?',
        options: [
          'Consistency / Monotonicity (h(n) <= c(n, a, n\') + h(n\'))',
          'Strict convexity',
          'Linear independence',
          'Finite branching factor',
        ],
        correctIndex: 0,
        explanation:
          'Consistency (the triangle inequality) ensures that f(n) values are non-decreasing along any path, so when a node is expanded in graph search, the optimal path to that node is already discovered.',
      },
    ],
  },
  {
    levelNumber: 6,
    title: 'Level 6: The Grand Convergence',
    subtitle: 'Full Multi-Agent Arena with all 5 Algorithms',
    lessonId: 'lesson3',
    description:
      'The ultimate challenge: All 5 search algorithms hunt you simultaneously across the grand labyrinth! Use your knowledge of their distinct behaviors, strengths, and failure modes to survive.',
    enemies: ['bfs', 'ucs', 'dfs', 'greedy', 'astar'],
    mazeLayout: DEFAULT_MAZE_LAYOUTS.arcade_arena,
    mudAllowed: true,
    iceAllowed: true,
    quizQuestions: [
      {
        question: 'Which of the following correctly orders the algorithms by theoretical optimality?',
        options: [
          'A* (with admissible h) & UCS are optimal; BFS is optimal for uniform cost; DFS & Greedy are not optimal',
          'DFS & Greedy are optimal; BFS is not',
          'All 5 algorithms are guaranteed to find the cheapest path',
          'Only BFS is optimal under all conditions',
        ],
        correctIndex: 0,
        explanation:
          'A* (with admissible h) and UCS always find the cheapest cost path. BFS finds the path with the fewest steps. DFS and Greedy prioritize other criteria and are not optimal.',
      },
      {
        question: 'If you want to trick an enemy into taking a longer path, which enemy is most vulnerable to being deceived by terrain cost?',
        options: [
          'The Wave (BFS) — because it ignores terrain cost and steps blindly through mud',
          'The Miser (UCS) — because it calculates exact costs',
          'The Strategist (A*) — because it is optimal',
          'None of them',
        ],
        correctIndex: 0,
        explanation:
          'BFS only counts step hops, so it willingly waddles through high-cost mud corridors where you can easily evade it or outrun it along ice superconductor routes!',
      },
    ],
  },
];

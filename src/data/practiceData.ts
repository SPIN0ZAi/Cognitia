import type { QuizQuestion } from '../types/course';

export const PRACTICE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    lessonId: 'lesson-1',
    chapterId: 'what-is-ai',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'According to John McCarthy and the modern rational-agent perspective, which of the following best defines an intelligent agent?',
    options: [
      'A machine that successfully fools human interrogators in an unrestricted conversational imitation test.',
      'An entity that perceives its environment through sensors and chooses actions that maximize expected performance given its percept history.',
      'A digital electronic computer running non-algorithmic quantum simulations of biological human brain tissue.',
      'A neural network trained exclusively with backpropagation on massive multimodal internet datasets.',
    ],
    correctAnswer: 1,
    explanation:
      'As introduced in Lesson 1 (Slide 10, 15) and Lesson 2 (Slide 5, 7), a rational agent is defined by its ability to perceive through sensors, process through an agent program, and select actions via actuators that maximize expected utility/performance given the percept sequence observed to date.',
    slideRef: { lessonId: 'lesson-1', slideNumber: 15 },
  },
  {
    id: 'q2',
    lessonId: 'lesson-1',
    chapterId: 'history-of-ai',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'In the historical timeline of AI, what major breakthrough occurred in 1943 that laid the foundations for the connectionist paradigm?',
    options: [
      'John McCarthy coined the term "Artificial Intelligence" at the Dartmouth conference.',
      'Warren McCulloch and Walter Pitts formulated the first mathematical model of an artificial neuron.',
      'Alan Turing published "Computing Machinery and Intelligence" introducing the imitation game.',
      'Bernard Widrow and Ted Hoff developed the ADALINE neural network.',
    ],
    correctAnswer: 1,
    explanation:
      'In 1943, Warren McCulloch and Walter Pitts introduced the first mathematical model of an artificial neuron (Lesson 1, Slide 18), featuring binary inputs, summation, and a threshold activation function.',
    slideRef: { lessonId: 'lesson-1', slideNumber: 18 },
  },
  {
    id: 'q3',
    lessonId: 'lesson-1',
    chapterId: 'current-controversies',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'The NIST AI Risk Management Framework (RMF) organizes responsible AI engineering into which four continuous lifecycle functions?',
    options: [
      'Design, Train, Test, and Deploy.',
      'Govern, Map, Measure, and Manage.',
      'Perceive, Reason, Act, and Learn.',
      'Identify, Prevent, Sanitize, and Archive.',
    ],
    correctAnswer: 1,
    explanation:
      'As presented in Lesson 1 (Slide 46), the NIST AI Risk Management Framework establishes four core functions: Govern (ownership and rules), Map (context and harms), Measure (quality, bias, and security), and Manage (safeguards, monitoring, and response).',
    slideRef: { lessonId: 'lesson-1', slideNumber: 46 },
  },
  {
    id: 'q4',
    lessonId: 'lesson-2',
    chapterId: 'search-problems-formulation',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'Which of the following is NOT one of the six formal components required to specify an AI state-space search problem?',
    options: [
      'Successor function (Transition model)',
      'Hardware execution clock speed (CPU architecture)',
      'Goal test predicate',
      'Path cost function g(s)',
    ],
    correctAnswer: 1,
    explanation:
      'The six mandatory components of any formal search problem (Lesson 2, Slide 24) are: 1. State space, 2. Initial state, 3. Actions, 4. Successor function, 5. Goal test, and 6. Path cost. Hardware speed is an execution detail, not a problem component.',
    slideRef: { lessonId: 'lesson-2', slideNumber: 24 },
  },
  {
    id: 'q5',
    lessonId: 'lesson-2',
    chapterId: 'searching-for-solutions',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'Why is pure Tree-Search vulnerable to infinite execution loops even in finite state spaces, and how does Graph-Search resolve this?',
    options: [
      'Tree-Search uses a LIFO queue while Graph-Search uses a priority queue.',
      'Tree-Search can repeatedly expand loopy/redundant paths because it lacks memory of visited states; Graph-Search maintains an explored set (closed list).',
      'Tree-Search only tests for the goal at leaf nodes; Graph-Search tests for the goal at the root node.',
      'Tree-Search requires an admissible heuristic while Graph-Search requires a consistent heuristic.',
    ],
    correctAnswer: 1,
    explanation:
      'In state spaces with cycles or reversible actions (like going Arad -> Timisoara -> Arad), Tree-Search generates infinite trees because it does not remember previously visited states. Graph-Search adds an explored set (closed list) to ensure states are never expanded more than once (Lesson 2, Slides 46–47).',
    slideRef: { lessonId: 'lesson-2', slideNumber: 47 },
  },
  {
    id: 'q6',
    lessonId: 'lesson-2',
    chapterId: 'uninformed-search-strategies',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'Under what precise condition is Breadth-First Search (BFS) guaranteed to return an optimal solution?',
    options: [
      'Always, under any step cost distribution.',
      'Only when the branching factor b is infinite.',
      'Only when all action step costs are identical (or a non-decreasing function of depth).',
      'Only when implemented with a priority queue ordered by g(n).',
    ],
    correctAnswer: 2,
    explanation:
      'BFS expands the shallowest node first. The shallowest goal is the cheapest goal ONLY when every action incurs identical cost. If step costs vary, a deeper goal may have lower cumulative path cost, causing BFS to return a suboptimal path (Lesson 2, Slide 57, 59).',
    slideRef: { lessonId: 'lesson-2', slideNumber: 57 },
  },
  {
    id: 'q7',
    lessonId: 'lesson-2',
    chapterId: 'uninformed-search-strategies',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'Suppose a search tree has uniform branching factor b = 10, and the shallowest goal is located at depth d = 5. How many total nodes are generated in the worst case by (a) Iterative Deepening Search (IDS), and (b) Breadth-First Search (BFS)?',
    options: [
      'IDS: 123,450 nodes; BFS: 111,110 nodes.',
      'IDS: 1,000,000 nodes; BFS: 100,000 nodes.',
      'IDS: 50,000 nodes; BFS: 111,110 nodes.',
      'IDS: 123,450 nodes; BFS: 1,234,500 nodes.',
    ],
    correctAnswer: 0,
    explanation:
      'From Lesson 2 (Slide 73):\nN(IDS) = (d)b + (d-1)b^2 + (d-2)b^3 + ... + (1)b^d = (5)(10) + (4)(100) + (3)(1000) + (2)(10000) + (1)(100000) = 50 + 400 + 3,000 + 20,000 + 100,000 = 123,450.\nN(BFS) = 10 + 100 + 1000 + 10000 + 100000 = 111,110.\nNotice that IDS generates only ~11% more nodes than BFS, while saving exponential amounts of memory!',
    slideRef: { lessonId: 'lesson-2', slideNumber: 73 },
  },
  {
    id: 'q8',
    lessonId: 'lesson-2',
    chapterId: 'uninformed-search-strategies',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'What is the primary memory advantage of Depth-First Tree Search over Breadth-First Search?',
    options: [
      'DFS has logarithmic time complexity.',
      'DFS space complexity is linear in maximum depth: O(b * m), storing only the current path and unexpanded siblings.',
      'DFS never generates leaf nodes.',
      'DFS stores all generated nodes in a priority queue.',
    ],
    correctAnswer: 1,
    explanation:
      'DFS tree search only needs to store the current branch from root to leaf, plus unexpanded siblings at each level. Its space complexity is O(b * m) — linear in depth — compared to BFS which requires exponential memory O(b^(d+1)) (Lesson 2, Slide 66).',
    slideRef: { lessonId: 'lesson-2', slideNumber: 66 },
  },
  {
    id: 'q9',
    lessonId: 'lesson-3',
    chapterId: 'informed-search-foundations',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'What is the fundamental mathematical constraint that MUST hold for every valid heuristic function h(n) at a goal node G?',
    options: [
      'h(G) = 1',
      'h(G) = infinity',
      'h(G) = 0',
      'h(G) = g(G)',
    ],
    correctAnswer: 2,
    explanation:
      'As stated on Lesson 3 (Slide 10): Constraint: If n is a goal node, h(n) = 0. The estimated remaining cost to reach the goal from the goal itself must be zero.',
    slideRef: { lessonId: 'lesson-3', slideNumber: 10 },
  },
  {
    id: 'q10',
    lessonId: 'lesson-3',
    chapterId: 'greedy-best-first-search',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'In the route finding problem from Arad to Bucharest, what path does Greedy Best-First search return, and why is it suboptimal compared to A*?',
    options: [
      'Greedy returns Arad -> Timisoara -> Lugoj (cost 229 km).',
      'Greedy returns Arad -> Sibiu -> Fagaras -> Bucharest (cost 450 km); A* returns Arad -> Sibiu -> Rimnicu Vilcea -> Pitesti -> Bucharest (cost 418 km).',
      'Greedy returns Arad -> Zerind -> Oradea -> Bucharest (cost 550 km).',
      'Both Greedy and A* return the exact same 418 km path because straight-line distance is consistent.',
    ],
    correctAnswer: 1,
    explanation:
      'Greedy expands Fagaras because its straight-line distance to Bucharest is lower (176 km vs Rimnicu\'s 193 km), ignoring accumulated edge costs and producing a 450 km path. A* balances past cost g(n) with h(n) and discovers the true optimal 418 km path via Rimnicu Vilcea and Pitesti (Lesson 3, Slides 20, 33).',
    slideRef: { lessonId: 'lesson-3', slideNumber: 20 },
  },
  {
    id: 'q11',
    lessonId: 'lesson-3',
    chapterId: 'astar-search-algorithm',
    type: 'multiple-choice',
    difficulty: 'Exam-Level',
    question:
      'In the formal proof that A* Tree-Search is optimal with an admissible heuristic, which mathematical inequality ensures that an unexpanded node n on the path to optimal goal G is selected before a suboptimal goal G_SO?',
    options: [
      'f(n) <= C* < f(G_SO)',
      'f(n) >= f(G_SO) > C*',
      'g(n) == h(n)',
      'h(n) > h*(n)',
    ],
    correctAnswer: 0,
    explanation:
      'From Lesson 3 (Slide 37): Suboptimal goal G_SO has f(G_SO) = g(G_SO) > C*. For any node n on the path to optimal goal G, by admissibility f(n) <= g(n) + h*(n) = C*. Since f(n) <= C* < f(G_SO), we have f(n) < f(G_SO). Since A* always extracts the node with minimal f, node n will always be expanded before G_SO.',
    slideRef: { lessonId: 'lesson-3', slideNumber: 37 },
  },
  {
    id: 'q12',
    lessonId: 'lesson-3',
    chapterId: 'astar-search-algorithm',
    type: 'multiple-choice',
    difficulty: 'Exam-Level',
    question:
      'A heuristic h(n) is consistent (monotonic) if h(n) <= c(n, a, n\') + h(n\'). What is the direct consequence of this property on the evaluation function f(n)?',
    options: [
      'f(n) is strictly zero along all optimal paths.',
      'f(n) is non-decreasing along any path (f(n\') >= f(n)).',
      'f(n) decreases exponentially as the agent approaches the goal.',
      'f(n) equals the depth of node n.',
    ],
    correctAnswer: 1,
    explanation:
      'From Slide 1 / Lesson 3 (Slide 39): f(n\') = g(n\') + h(n\') = g(n) + c(n, a, n\') + h(n\'). Since c(n, a, n\') + h(n\') >= h(n) by consistency, f(n\') >= g(n) + h(n) = f(n). Thus f(n) never decreases along any search path.',
    slideRef: { lessonId: 'lesson-3', slideNumber: 39 },
  },
  {
    id: 'q13',
    lessonId: 'lesson-3',
    chapterId: 'astar-search-algorithm',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'If an admissible heuristic is NOT consistent, what modification must be made to A* Graph-Search to guarantee optimality on finite graphs?',
    options: [
      'Discard all duplicate states immediately upon generation.',
      'Implement the node reopening rule: if a cheaper path to an already-closed state is found (g_new < g_best), remove it from explored and re-insert into open.',
      'Switch the frontier queue from a Priority Queue to a FIFO queue.',
      'Multiply all heuristic values by a constant factor greater than 2.',
    ],
    correctAnswer: 1,
    explanation:
      'As detailed on Lesson 3 (Slide 43), when h is admissible but inconsistent, a state may be closed prematurely via a suboptimal path. The reopening rule checks if g_new < g_best(s\'); if so, it updates cost and re-opens the closed node into the frontier.',
    slideRef: { lessonId: 'lesson-3', slideNumber: 43 },
  },
  {
    id: 'q14',
    lessonId: 'lesson-3',
    chapterId: 'heuristic-functions-and-8puzzle',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'In the 8-puzzle, why does Manhattan distance (h2) dominate misplaced tiles (h1)?',
    options: [
      'Because h2 is faster to compute in hardware than h1.',
      'Because every misplaced tile is at least 1 grid step away from its goal, meaning |x - x*| + |y - y*| >= 1 for every misplaced tile, so h2(n) >= h1(n) for all states.',
      'Because h1 is not admissible, whereas h2 is admissible.',
      'Because h2 includes the blank space in its summation.',
    ],
    correctAnswer: 1,
    explanation:
      'A tile that is out of place contributes 1 to h1. That same tile must have a Manhattan distance of at least 1 (often 2, 3, or 4) to reach its goal position. Therefore, for all configurations, h2(n) >= h1(n). Since both are admissible, h2 dominates h1 and expands fewer nodes (Lesson 3, Slide 49).',
    slideRef: { lessonId: 'lesson-3', slideNumber: 49 },
  },
  {
    id: 'q15',
    lessonId: 'lesson-3',
    chapterId: 'heuristic-functions-and-8puzzle',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'In the empirical 8-puzzle benchmark table from the lecture slides, at solution depth d = 24, how many nodes are generated by A*(h1) versus A*(h2)?',
    options: [
      'A*(h1): 39,135 nodes; A*(h2): 1,641 nodes.',
      'A*(h1): 1,641 nodes; A*(h2): 39,135 nodes.',
      'A*(h1): 227 nodes; A*(h2): 73 nodes.',
      'A*(h1): 3,644,035 nodes; A*(h2): 10 nodes.',
    ],
    correctAnswer: 0,
    explanation:
      'From Lesson 3 (Slide 48): At depth d = 24, A*(h1) generates 39,135 nodes (b* = 1.48), whereas A*(h2) generates only 1,641 nodes (b* = 1.26). This demonstrates the dramatic practical advantage of a dominating heuristic.',
    slideRef: { lessonId: 'lesson-3', slideNumber: 48 },
  },
  {
    id: 'q16',
    lessonId: 'lesson-4',
    chapterId: 'optimal-decisions-minimax',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'Under what precise conditions is the standard Minimax algorithm guaranteed to be optimal for player MAX?',
    options: [
      'It is unconditionally optimal against any opponent, even if the opponent plays completely random or erratic moves.',
      'It is optimal if and only if the opponent (MIN) also plays optimally according to the minimax decision rule.',
      'It is optimal only if the game tree depth is an odd integer.',
      'It is optimal only when the heuristic evaluation function is consistent and admissible.',
    ],
    correctAnswer: 1,
    explanation:
      'As stated on Lesson 4 (Slide 26): Minimax is complete if the game tree is finite, and optimal "...if the opponent plays optimally." If the opponent plays suboptimally, Minimax may not exploit their mistakes as aggressively as an opponent-modeling strategy, but it still guarantees at least the minimax utility value.',
    slideRef: { lessonId: 'lesson-4', slideNumber: 26 },
  },
  {
    id: 'q17',
    lessonId: 'lesson-4',
    chapterId: 'alphabeta-pruning',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'With perfect move ordering (best moves examined first), what is the effective time complexity of Alpha-Beta pruning, and what practical implication does this have on search depth?',
    options: [
      'O(b * m), reducing exponential complexity to polynomial time.',
      'O(b^(m/2)), which effectively doubles the search depth achievable within the same compute budget compared to standard Minimax O(b^m).',
      'O((b/2)^m), reducing the branching factor by half but keeping depth identical.',
      'O(m^b), inverting the base and exponent.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 4 (Slide 44): With perfect move ordering, alpha-beta pruning achieves a time complexity of O(b^(m/2)). Because the exponent is divided by 2, an alpha-beta search can explore twice as deep (2d) as standard minimax can in the same amount of time.',
    slideRef: { lessonId: 'lesson-4', slideNumber: 44 },
  },
  {
    id: 'q18',
    lessonId: 'lesson-4',
    chapterId: 'stochastic-games-expectiminimax',
    type: 'conceptual-match',
    difficulty: 'Exam-Level',
    question:
      'In deterministic games with Minimax, applying any strictly increasing monotonic transformation f(u) to leaf utilities preserves the optimal move. Why does this property FAIL in stochastic games evaluated with Expectiminimax ("Values Matter")?',
    options: [
      'Because dice rolls violate the transitive property of real numbers.',
      'Because expected values are weighted linear combinations: ∑ P(r) * f(u_r) is generally NOT equal to f(∑ P(r) * u_r) unless f is strictly linear. Non-linear monotonic transformations can invert the relative order of expected payoffs.',
      'Because chance nodes can only have integer probabilities.',
      'Because alpha-beta pruning cannot run on trees with more than two plies.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 4 (Slide 57 "Values matter"): In Expectiminimax, values represent expected utilities. Linear transformations preserve expected value decisions (positive affine invariance), but arbitrary order-preserving monotonic transformations (e.g. squaring or scaling specific outcomes as in Slide 57 from [2, 3, 1, 4] to [20, 30, 1, 400]) change the expectation and can flip the optimal decision from a1 to a2.',
    slideRef: { lessonId: 'lesson-4', slideNumber: 57 },
  },
  {
    id: 'q19',
    lessonId: 'lesson-4',
    chapterId: 'proposed-problems-and-exam-solutions',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'In UCLM Proposed Problem #1 (Slide 61), MAX (O) evaluates a Tic-Tac-Toe board using Eval(s) = (open lines for O) - (open lines for X). For the board with X at top-center (row 0, col 1) and O at center (row 1, col 1), what is Eval(s)?',
    options: [
      'Eval(s) = 0',
      'Eval(s) = 2  (Lines for O: central row, right diagonal, left diagonal = 3; Lines for X: upper row = 1; 3 - 1 = 2)',
      'Eval(s) = +1000',
      'Eval(s) = -2',
    ],
    correctAnswer: 1,
    explanation:
      'From Lesson 4 (Slide 61): MAX (O) has 3 open lines passing through (1,1): central row, main diagonal, and anti-diagonal (its central column is blocked by X). MIN (X) has 1 open line: upper row (its central column is blocked by O). Therefore: Eval(s) = 3 - 1 = 2.',
    slideRef: { lessonId: 'lesson-4', slideNumber: 61 },
  },
  {
    id: 'q20',
    lessonId: 'lesson-4',
    chapterId: 'appendix-monte-carlo-tree-search',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'In Monte Carlo Tree Search (MCTS), what does the UCT selection formula UCT(v) = Q(v)/N(v) + C * sqrt(ln(N(parent)) / N(v)) balance, and which child does MCTS choose during the Selection phase?',
    options: [
      'It balances Alpha and Beta cutoffs; it chooses the child with the smallest alpha.',
      'It balances Exploitation (observed win rate Q/N) and Exploration (bonus for infrequently visited children); it chooses the child with the largest UCT value.',
      'It balances memory space and call stack depth; it chooses the shallowest child.',
      'It balances player 1 and player 2 utilities; it chooses the median child.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 4 (Slide 65): The first term Q(v)/N(v) is exploitation (favoring high observed win rates), while the second term C * sqrt(ln(N_parent) / N_v) is exploration (favoring less-explored actions). MCTS always selects the child maximizing UCT(v).',
    slideRef: { lessonId: 'lesson-4', slideNumber: 65 },
  },
];

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
  // ==========================================
  // LESSON 5: REINFORCEMENT LEARNING
  // ==========================================
  {
    id: 'q21',
    lessonId: 'lesson-5',
    chapterId: 'stochastic-worlds-and-markov',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'What constitutes the Markov property in a Markov Decision Process (MDP)?',
    options: [
      'The agent must store the full history of past states in memory to choose actions.',
      'The transition probability to the next state s\' and reward r depends exclusively on the current state s and action a, independent of previous history: P(s\' | s, a, s_{t-1}, ...) = P(s\' | s, a).',
      'The transition matrix must always have zero probability along its main diagonal.',
      'All rewards in the environment must be deterministic positive integers.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 5 (Slide 15): The Markov property states that future states depend only upon the current state and action, making past state history completely conditionally independent given s_t.',
    slideRef: { lessonId: 'lesson-5', slideNumber: 15 },
    hints: [
      'Think about whether history matters if you already know where you currently are.',
      'P(s\' | s, a) is memoryless.',
    ],
  },
  {
    id: 'q22',
    lessonId: 'lesson-5',
    chapterId: 'bellman-equations-and-value-iteration',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'In the official UCLM Two-Stage Betting MDP (Coins Problem), what is the optimal expected utility U*(s0) with discount factor γ = 1.0?',
    options: [
      '30.00 €',
      '34.35 €',
      '25.50 €',
      '40.00 €',
    ],
    correctAnswer: 1,
    explanation:
      'In the UCLM official exercise sheet: At s_c (after guessing correctly), U*(s_c) = 48.75 €. At s_w (after guessing wrong), U*(s_w) = 19.95 €. At initial state s0, choosing Coin 2 with P(win)=0.5 gives: U*(s0) = 0.5 * 48.75 + 0.5 * 19.95 = 24.375 + 9.975 = 34.35 €.',
    slideRef: { lessonId: 'lesson-5', slideNumber: 78 },
    hints: [
      'Recall the resolution sheet: Coin 2 at s0 gives a 50/50 chance between s_c and s_w.',
      'Expected value is 0.5 * 48.75 + 0.5 * 19.95.',
    ],
  },
  {
    id: 'q23',
    lessonId: 'lesson-5',
    chapterId: 'q-learning-and-sarsa',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'Why does off-policy Q-learning learn the risky 13-step cliff edge path in Cliff Walking, while on-policy SARSA learns the longer 17-step safe route?',
    options: [
      'Q-learning updates using max_{a\'} Q(s\', a\') assuming optimal future greedy actions, ignoring ε-greedy exploratory cliff falls; SARSA updates using the actual action a\' taken under the exploratory ε-greedy policy.',
      'SARSA runs exclusively in deterministic environments, whereas Q-learning requires stochastic transitions.',
      'Q-learning cannot handle negative rewards, while SARSA converts all rewards to absolute values.',
      'SARSA utilizes an artificial neural network, whereas Q-learning uses a table.',
    ],
    correctAnswer: 0,
    explanation:
      'Lesson 5 (Slide 70-74): Q-learning is off-policy because its TD target uses max_{a\'} Q(s\', a\') (evaluating the optimal greedy policy regardless of what the agent actually does next). SARSA is on-policy because it updates with the action a_{t+1} chosen by its exploratory policy, factoring the catastrophic penalty of occasional random cliff falls into edge states.',
    slideRef: { lessonId: 'lesson-5', slideNumber: 72 },
    hints: [
      'Look at the update formulas: Q-learning uses max Q(s\', a\'); SARSA uses Q(s\', a\').',
      'On-policy means the target policy matches the behavior policy.',
    ],
  },
  // ==========================================
  // LESSON 6: COMBINATORIAL OPTIMIZATION
  // ==========================================
  {
    id: 'q24',
    lessonId: 'lesson-6',
    chapterId: 'state-as-solution-vs-paths',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'Why is A* search structurally unsuited for pure combinatorial optimization problems (e.g. antenna placement, graph coloring)?',
    options: [
      'Because A* cannot run on digital computers.',
      'In combinatorial optimization, the solution is the configuration state itself, not a path of actions. A* searches path trees and requires storing an exponential open list in memory O(b^d).',
      'Because combinatorial problems have continuous floating-point variables.',
      'Because A* only works when all edge costs are negative.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 6 (Slide 4-8): In path-based problems (navigation, 8-puzzle), the goal is the sequence of actions. In combinatorial optimization, we only care about finding an optimal configuration c in S. Path history is meaningless, and constructing search trees leads to combinatorial explosion.',
    slideRef: { lessonId: 'lesson-6', slideNumber: 6 },
    hints: [
      'Do you care how an antenna was placed first, or only where they all end up?',
      'Memory footprint of A* is exponential in path depth.',
    ],
  },
  {
    id: 'q25',
    lessonId: 'lesson-6',
    chapterId: 'canonical-problems-and-encodings',
    type: 'conceptual-match',
    difficulty: 'Intermediate',
    question:
      'In the Boolean Satisfiability problem, what critical algorithmic advantage does the Max-SAT formulation provide over traditional decision SAT (Slide 24)?',
    options: [
      'Max-SAT proves P = NP in polynomial time.',
      'Decision SAT presents a flat, binary step landscape (0 or 1) offering zero gradient to guide search; Max-SAT counts satisfied clauses, providing a continuous informative gradient f(c) = sum(C_i).',
      'Max-SAT eliminates all exponential variables from the formula.',
      'Decision SAT cannot represent CNF clauses with more than 2 literals.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 6 (Slide 24): SAT evaluation is a flat plateau (0 for unsatisfied, 1 for satisfied), so local search wanders blindly. Max-SAT transforms this into an optimization landscape where each satisfied clause increases f(c), creating an informative hill for heuristics to climb.',
    slideRef: { lessonId: 'lesson-6', slideNumber: 24 },
    hints: [
      'How does an algorithm know if a guess is close to satisfying a formula?',
      'Count how many clauses are true.',
    ],
  },
  {
    id: 'q26',
    lessonId: 'lesson-6',
    chapterId: 'two-processor-balancing',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'In the official UCLM Two-Processor Balancing Problem (Slide 54-55) with jobs [8, 7, 6, 5, 4], fixing Job 1 to Processor 0 (c1 = 0) breaks complement symmetry. How many configurations must be evaluated?',
    options: [
      '32 configurations',
      '16 configurations',
      '64 configurations',
      '8 configurations',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 6 (Slide 54-55): The total configuration space is 2^5 = 32. Because swapping all 0s and 1s gives the exact same workload balance, fixing c1 = 0 eliminates half the symmetric configurations: 32 / 2 = 16.',
    slideRef: { lessonId: 'lesson-6', slideNumber: 54 },
    hints: [
      '2^5 is 32. Fixing 1 bit leaves 2^4 configurations.',
      '2^4 = 16.',
    ],
  },
  // ==========================================
  // LESSON 7: LOCAL SEARCH & HILL CLIMBING
  // ==========================================
  {
    id: 'q27',
    lessonId: 'lesson-7',
    chapterId: 'three-pathologies',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'According to Slide 17, why does Hill Climbing fail on a Plateau, and what is the standard remedy?',
    options: [
      'Because the computer runs out of memory; the remedy is upgrading RAM.',
      'All neighbors have identical scores f(x\') = f(x) giving zero gradient; the remedy is allowing sideways moves with a cap to prevent infinite loops.',
      'All neighbors have worse scores; the remedy is terminating the program.',
      'The step size is too large; the remedy is dividing by 2.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 7 (Slide 17): On a plateau, no neighbor strictly improves f(x). Standard Hill Climbing halts immediately. Allowing sideways moves lets the search cross flat regions, with a limit (e.g. 100 sideways moves) to prevent infinite cycles.',
    slideRef: { lessonId: 'lesson-7', slideNumber: 17 },
    hints: [
      'If terrain is completely flat, gradient is zero.',
      'A cap prevents moving back and forth forever.',
    ],
  },
  {
    id: 'q28',
    lessonId: 'lesson-7',
    chapterId: 'escape-metaheuristics',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'In Simulated Annealing (minimization), current cost is f(x) = 15. A candidate neighbor has f(x\') = 18. If temperature T = 3.0, what is the probability P(accept x\') rounded to two decimals?',
    options: [
      '0.37',
      '0.82',
      '0.05',
      '1.00',
    ],
    correctAnswer: 0,
    explanation:
      'Lesson 7 (Slide 49-50): Δ = f(x\') - f(x) = 18 - 15 = 3. Since Δ > 0 (worsening move), P(accept) = exp(-Δ / T) = exp(-3 / 3.0) = exp(-1) ≈ 0.367879... which rounds to 0.37.',
    slideRef: { lessonId: 'lesson-7', slideNumber: 50 },
    hints: [
      'Compute Δ = 18 - 15 = 3.',
      'exp(-3 / 3) = exp(-1) = 1 / e ≈ 1 / 2.718 ≈ 0.37.',
    ],
  },
  // ==========================================
  // LESSON 8: GENETIC ALGORITHMS
  // ==========================================
  {
    id: 'q29',
    lessonId: 'lesson-8',
    chapterId: 'selection-mechanisms',
    type: 'calculation',
    difficulty: 'Intermediate',
    question:
      'A population of 4 individuals has fitness values: f1 = 10, f2 = 20, f3 = 30, f4 = 40. Under Fitness Proportional Selection (Roulette Wheel), what is the selection probability p2 for Individual 2?',
    options: [
      '0.20 (20%)',
      '0.25 (25%)',
      '0.50 (50%)',
      '0.10 (10%)',
    ],
    correctAnswer: 0,
    explanation:
      'Lesson 8 (Slide 21): Total population fitness F = 10 + 20 + 30 + 40 = 100. The probability for Individual 2 is p2 = f2 / F = 20 / 100 = 0.20 (20%).',
    slideRef: { lessonId: 'lesson-8', slideNumber: 21 },
    hints: [
      'Sum all 4 fitness values: 10 + 20 + 30 + 40.',
      'Divide f2 by the sum.',
    ],
  },
  {
    id: 'q30',
    lessonId: 'lesson-8',
    chapterId: 'aibo-case-study',
    type: 'multiple-choice',
    difficulty: 'Exam-Level',
    question:
      'In the UCLM research paper on AIBO robot locomotion optimization (Alonso et al.), what primary purpose does the Machine Learning surrogate model serve?',
    options: [
      'It controls the robot\'s wireless network connection.',
      'It predicts candidate fitness and filters out unpromising configurations (Buena, Regular, Mala), avoiding slow, battery-draining physical robot trials.',
      'It replaces the genetic algorithm entirely with linear regression.',
      'It converts the quadruped robot into a wheeled mobile platform.',
    ],
    correctAnswer: 1,
    explanation:
      'UCLM Paper Section 5: Real physical evaluation takes 30 seconds per individual on carpet, which wears motors and drains batteries. The ML surrogate classifies candidates before testing and filters out poor individuals, drastically speeding up convergence.',
    slideRef: { lessonId: 'lesson-8', slideNumber: 'Alonso et al. Sec 5' },
    hints: [
      'Testing on a real robot is slow, noisy, and causes wear.',
      'Predicting speed with ML allows skipping unpromising tests.',
    ],
  },
  // ==========================================
  // LESSON 9: MACHINE LEARNING FOUNDATIONS
  // ==========================================
  {
    id: 'q31',
    lessonId: 'lesson-9',
    chapterId: 'overfitting-and-underfitting',
    type: 'multiple-choice',
    difficulty: 'Foundation',
    question:
      'A machine learning model achieves 0.01% error on its training dataset, but suffers 45% error when deployed on unseen test data. What is this phenomenon called, and what does it indicate about model complexity?',
    options: [
      'Underfitting (High Bias); the model is too simple.',
      'Overfitting (High Variance); the model is excessively complex and memorized noise in the training set.',
      'Data leakage; the test set was mixed with the training set.',
      'Optimal generalization; training loss is nearly zero.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 9 (Slide 22): Overfitting occurs when a high-capacity model fits the idiosyncratic noise of the training data rather than the underlying generative distribution, leading to near-zero training error but terrible test generalization.',
    slideRef: { lessonId: 'lesson-9', slideNumber: 22 },
    hints: [
      'Low train error + high test error = High Variance.',
      'The model memorized rather than learned.',
    ],
  },
  {
    id: 'q32',
    lessonId: 'lesson-9',
    chapterId: 'train-val-test-split',
    type: 'multiple-choice',
    difficulty: 'Intermediate',
    question:
      'Why is it critical to maintain an independent Validation set separate from both the Training set and the Test set?',
    options: [
      'The validation set is used to adjust neural network weights via gradient descent.',
      'The validation set is used for hyperparameter tuning and model selection; the test set remains untouched to provide an unbiased final estimate of real-world performance.',
      'The validation set is discarded immediately after data collection.',
      'Federal law requires three copies of every database.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 9 (Slide 38): If hyperparameters are tuned directly on the test set, information leaks from the test set into the model decisions ("data leakage"). The validation set guides model tuning, preserving the test set as a pristine final benchmark.',
    slideRef: { lessonId: 'lesson-9', slideNumber: 38 },
    hints: [
      'Tuning on the test set causes test data leakage.',
      'Train = weights, Val = hyperparameters, Test = final report card.',
    ],
  },
  // ==========================================
  // LESSON 10: SUPERVISED CLASSIFICATION
  // ==========================================
  {
    id: 'q33',
    lessonId: 'lesson-10',
    chapterId: 'knn-mechanics',
    type: 'calculation',
    difficulty: 'Intermediate',
    question:
      'Given 2D query point Q(2, 3) and three training points: A(2, 1) [Red], B(5, 3) [Blue], C(2, 6) [Red]. Using Euclidean distance and k = 1, what is the predicted class for Q?',
    options: [
      'Class Red (Closest neighbor is A with distance d = 2.0)',
      'Class Blue (Closest neighbor is B with distance d = 3.0)',
      'Class Red (Closest neighbor is C with distance d = 3.0)',
      'Voting Tie',
    ],
    correctAnswer: 0,
    explanation:
      'Lesson 10 (Slide 10): Distance to A: sqrt((2-2)^2 + (3-1)^2) = sqrt(4) = 2.0. Distance to B: sqrt((2-5)^2 + (3-3)^2) = sqrt(9) = 3.0. Distance to C: sqrt((2-2)^2 + (3-6)^2) = sqrt(9) = 3.0. The closest neighbor is A (d=2.0), whose label is Red.',
    slideRef: { lessonId: 'lesson-10', slideNumber: 10 },
    hints: [
      'Compute Euclidean distance: sqrt(dx^2 + dy^2).',
      'For A: dx=0, dy=2 -> d=2.',
    ],
  },
  {
    id: 'q34',
    lessonId: 'lesson-10',
    chapterId: 'confusion-matrix-and-metrics',
    type: 'calculation',
    difficulty: 'Exam-Level',
    question:
      'In a medical test of 1000 patients, 10 patients actually have cancer. A model diagnoses 20 patients as positive: 8 of them truly have cancer (TP = 8), while 12 are healthy (FP = 12). What is the model\'s Recall (Sensitivity)?',
    options: [
      '0.40 (40%)',
      '0.80 (80%)',
      '0.99 (99%)',
      '0.08 (8%)',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 10 (Slide 51-54): Total actual positive cases = 10. The model caught 8 (TP = 8) and missed 2 (FN = 2). Recall = TP / (TP + FN) = 8 / (8 + 2) = 8 / 10 = 0.80 (80.0%).',
    slideRef: { lessonId: 'lesson-10', slideNumber: 52 },
    hints: [
      'Recall is TP / (total actual positives).',
      'Total sick people is 10; TP is 8.',
    ],
  },
  {
    id: 'q35',
    lessonId: 'lesson-10',
    chapterId: 'classification-metrics-formulas',
    type: 'multiple-choice',
    difficulty: 'Exam-Level',
    question:
      'What is the "Accuracy Paradox" in machine learning, and why does it occur in highly imbalanced datasets?',
    options: [
      'A model with 100% accuracy cannot be saved to disk.',
      'A trivial model predicting the majority class for all instances can achieve 99% accuracy on a dataset with 1% positives, despite having 0% recall and completely failing to detect any targets of interest.',
      'Precision and Recall must always equal each other.',
      'Accuracy decreases whenever more training data is provided.',
    ],
    correctAnswer: 1,
    explanation:
      'Lesson 10 (Slide 58): In severe class imbalance (e.g. rare fraud or disease), negative cases dominate the denominator (TP + TN) / Total. A dummy model predicting negative for everyone achieves very high accuracy while providing zero real-world utility.',
    slideRef: { lessonId: 'lesson-10', slideNumber: 58 },
    hints: [
      'Imagine 999 healthy patients and 1 sick patient.',
      'If the doctor tells everyone they are healthy, accuracy is 99.9%, but the sick patient is missed.',
    ],
  },
];

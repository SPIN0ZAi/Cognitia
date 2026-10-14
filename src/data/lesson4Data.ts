import type { LessonData } from '../types/course';

export const LESSON_4_DATA: LessonData = {
  id: 'lesson-4',
  number: 4,
  title: 'Adversarial Search: Games & Decisions Against Enemy Agents',
  subtitle: 'Game theory, Minimax, Alpha-Beta pruning, imperfect real-time decisions, stochastic games, and Monte Carlo Tree Search (MCTS)',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 67,
  overview:
    'Explores multi-agent competitive environments where agents have conflicting goals. Formulates two-player zero-sum deterministic games under perfect information, establishes the Minimax algorithm and its formal recursive definitions, and develops Alpha-Beta (α-β) pruning to cut the search exponent in half from O(b^m) to O(b^(m/2)). Examines resource-constrained real-time decision making with depth cutoff tests and weighted linear heuristic evaluation functions, along with search pathologies like the horizon effect and beam search forward pruning. Extends the framework to stochastic games via chance nodes and Expectiminimax, proving why monotonic scale transformations alter stochastic decisions ("values matter"). Concludes with formal solutions to UCLM exam problems (Tic-Tac-Toe depth-3 evaluation and NIM matchstick game) and a comprehensive study of Monte Carlo Tree Search (MCTS, UCT, AlphaGo/AlphaZero).',
  prerequisites: [
    'Formal problem formulation and search spaces (Lesson 2)',
    'Heuristic functions and informed search evaluation (Lesson 3)',
    'Probability theory, expected values, and recursive algorithm analysis',
  ],
  learningObjectives: [
    'Classify games within the 2x2 taxonomy matrix: Deterministic vs Stochastic × Perfect vs Imperfect Information.',
    'Formally define a deterministic two-player zero-sum game using the tuple (S_0, Player, Actions, Result, Terminal-Test, Utility).',
    'Calculate and trace the Minimax values on game trees, proving why the optimal solution is a contingent strategy rather than a static sequence of actions.',
    'Execute Alpha-Beta pruning by maintaining α (MAX bound) and β (MIN bound), identifying exact cutoff points where α ≥ β, and explaining the critical role of move ordering.',
    'Design weighted linear heuristic evaluation functions Eval(s) = ∑ w_i f_i(s) for real-time cutoffs and diagnose the horizon effect.',
    'Trace Expectiminimax on stochastic game trees with chance nodes, and prove why non-linear monotonic transformations alter optimal decisions ("values matter").',
    'Solve the UCLM exam problems: Tic-Tac-Toe line-counting evaluation with depth-3 α-β search, and NIM matchstick optimal play.',
    'Explain the 4 phases of Monte Carlo Tree Search (Selection with UCT, Expansion, Simulation/Rollout, Backpropagation) and compare MCTS against Alpha-Beta search.',
  ],
  chapters: [
    {
      id: 'introduction-to-adversarial-search',
      number: 1,
      title: 'Introduction to Adversarial Search & Games',
      slideRange: 'Slides 1–12',
      description:
        'Competitive multi-agent environments, game taxonomy, historical milestones from Checkers to Deep Blue and AlphaGo, and formal game formulation.',
      sections: [
        {
          id: 'competitive-environments-and-contingent-strategies',
          title: 'Competitive Environments & Contingent Strategies',
          slideRef: { lessonId: 'lesson-4', slideNumber: 7, note: 'Adversarial search and games' },
          summary:
            'When two agents have conflicting goals, actions depend on the opponent’s response. Solutions must be contingent strategies rather than fixed action sequences.',
          content: `
### What Is Adversarial Search? (Slide 7)

In single-agent search (Lessons 2 and 3), the environment is passive: the agent plans a fixed path from initial state $S_0$ to a goal state $G$, confident that executing those actions will reach the goal undisturbed.

In **adversarial search** (commonly known as **games**):
1. **Competitive Environment**: Two or more agents operate in the environment with **conflicting utility functions**. The gain of one player corresponds to the loss of the other.
2. **Dynamic Unpredictability**: The state reached by applying an action depends on the **response chosen by the opponent**.
3. **Contingent Strategy**: Because the opponent is active and unpredictable, the solution to an adversarial search problem is **not a single sequence of moves**, but a **strategy**:
   $$\\text{Strategy } \\pi: \\text{Specifies an optimal move for every possible response the opponent might make.}$$
4. **Severe Time Constraints**: Real games enforce strict turn timers (e.g., chess clocks). Because searching the entire game tree is impossible, agents must find high-quality approximations under limited time.
          `,
          keyTakeaways: [
            'Adversarial search models environments with conflicting goals between competing agents.',
            'The solution is a contingent strategy tree, not a fixed sequence of actions.',
            'Time limits force agents to approximate rather than search to terminal game ends.',
          ],
        },
        {
          id: 'history-of-ai-game-playing',
          title: 'Milestones in AI Game Playing: From Checkers to AlphaGo',
          slideRef: { lessonId: 'lesson-4', slideNumber: 4, note: 'Artificial game playing history' },
          summary:
            'A historical overview of landmark AI victories: Arthur Samuel’s checkers, Deep Blue defeating Kasparov in 1996/1997, and AlphaGo defeating human champions in 2016.',
          content: `
### Historical Landmarks in Computer Game Playing (Slides 4–5)

Games have served as the "drosophila" (fruit fly) of Artificial Intelligence research since the 1950s:

* **Checkers (Damas)**:
  * **1950**: Arthur Samuel developed the first learning checkers program on the IBM 701, pioneering rote learning and evaluation function weighting.
  * **1994**: Jonathan Schaeffer’s program **Chinook** defeated human world champion Marion Tinsley, ending a 40-year undefeated streak.
  * **2007**: Schaeffer's team announced that checkers had been **mathematically solved**: with perfect play from both sides, the game is guaranteed to end in a draw! (State space $\\approx 5 \\times 10^{20}$).
* **Chess (Ajedrez)**:
  * **1996–1997**: IBM’s **Deep Blue** defeated reigning World Chess Champion Garry Kasparov in a 6-game regulation match.
  * **2002**: Fritz tied with Vladimir Kramnik on an ordinary desktop PC.
  * **2006**: Deep Fritz defeated Kramnik 4–2, definitively cementing computer superiority over human grandmasters.
* **Go (Weiqi)**:
  * Until 2016, Go was considered decades away from computer mastery due to its colossal branching factor ($b > 250-300$) and lack of clean positional evaluation heuristics.
  * **2016**: DeepMind’s **AlphaGo** defeated 18-time world champion Lee Sedol 4–1, combining Monte Carlo Tree Search (MCTS) with deep convolutional neural networks.

---

### Technical Architecture of Deep Blue (Slide 5)
How did Deep Blue achieve grandmaster victory?
* **Hardware Scale**: 30 IBM RS/6000 parallel processors coordinating **480 custom VLSI chess chips**.
* **Search Throughput**: Searched **$126 \\times 10^6$ nodes per second**, with a peak burst speed of **$330 \\times 10^6$ nodes/second**.
* **Depth Reached**: Generated $30 \\times 10^9$ positions per move, reaching an average depth of **14 plies** (and up to **40 plies** along tactical forced lines).
* **Core Engine**: Alpha-Beta search combined with **Iterative Deepening** and null-move forward pruning.
* **Evaluation Function**: 8,000 distinct hand-crafted features coupled with an endgame pattern database containing $7 \\times 10^5$ grandmaster positions.
          `,
          keyTakeaways: [
            'Checkers was solved in 2007 by Jonathan Schaeffer (proven draw with perfect play).',
            'Deep Blue defeated Kasparov using 480 custom VLSI chips searching up to 330 million nodes/sec.',
            'AlphaGo conquered Go in 2016 by replacing hand-crafted heuristics with deep neural networks and MCTS.',
          ],
        },
        {
          id: 'taxonomy-of-games',
          title: 'Taxonomy of Games: Information & Determinism',
          slideRef: { lessonId: 'lesson-4', slideNumber: 8, note: 'Types of games 2x2 matrix' },
          summary:
            'Games are classified by whether states are fully observable (perfect vs imperfect information) and whether action outcomes are known (deterministic vs chance).',
          content: `
### The 2×2 Game Taxonomy Matrix (Slide 8)

Games in AI are classified along two fundamental environmental axes:

| | **Deterministic** | **Chance (Stochastic)** |
|---|---|---|
| **Perfect Information** (Fully Observable) | **Chess, Checkers, Go, Othello, Tic-Tac-Toe** | **Backgammon, Monopoly** |
| **Imperfect Information** (Partially Observable) | **Battleship (Hundir la flota)** | **Poker, Scrabble, Bridge** |

### Key Characteristic Dimensions (Slide 9):
1. **Perfect vs Imperfect Information**:
   * **Perfect**: Players can observe the complete state of the board at all times (Chess, Go).
   * **Imperfect**: Crucial state information is hidden from the agent, such as opponent cards or secret fleet placements (Poker, Battleship). Requires reasoning over **belief states**.
2. **Deterministic vs Non-Deterministic (Stochastic)**:
   * **Deterministic**: An action in state $s$ produces a completely known, certain successor state $s'$ with probability 1.0 (Chess).
   * **Stochastic**: Actions involve random elements such as dice rolls, card drawing, or coin tosses (Backgammon, Monopoly).
3. **Turn-Taking (Alternating)**:
   * Agents take turns sequentially: MAX moves, then MIN moves, then MAX moves, until terminal states.
4. **Zero-Sum (Constant-Sum)**:
   * The utilities of all players sum to zero (or a constant value) at any terminal state:
     $$\\sum_{p} \\text{Utility}(s, p) = 0 \\quad \\implies \\quad \\text{Utility}_{\\text{MAX}}(s) = -\\text{Utility}_{\\text{MIN}}(s)$$
   * Pure competition: One player's advantage is mathematically identical to the opponent's disadvantage.
          `,
          keyTakeaways: [
            'Perfect info = fully observable; Imperfect info = hidden cards/pieces.',
            'Deterministic = fixed outcome; Stochastic = dice, shuffling, chance.',
            'Zero-sum = utilities sum to 0; pure conflict with no win-win outcomes.',
          ],
        },
        {
          id: 'formal-deterministic-game-formulation',
          title: 'Formal Elements of a Deterministic Game',
          slideRef: { lessonId: 'lesson-4', slideNumber: 10, note: 'Deterministic game elements' },
          summary:
            'A deterministic game is formally formalized as a 6-tuple: Initial state, Player function, Actions, Transition model, Terminal test, and Utility function.',
          content: `
### Formal Definition of a Deterministic Game (Slide 10)

A deterministic game between two players (**MAX** and **MIN**) is formally specified by six components:

1. **Initial State ($S_0$)**:
   The starting board setup and an indication of who moves first.
2. **$\\text{Player}(s)$**:
   A function returning which player's turn it is to move in state $s$ (typically MAX or MIN).
3. **$\\text{Actions}(s)$**:
   Returns the set of legal moves available in state $s$.
4. **$\\text{Result}(s, a)$**:
   The **transition model**, specifying the state resulting from player $\\text{Player}(s)$ taking action $a$ in state $s$.
5. **$\\text{Terminal-Test}(s)$**:
   A boolean predicate returning \`true\` if the game is over (terminal state), and \`false\` if the game continues.
6. **$\\text{Utility}(s, p)$** (Payoff / Objective Function):
   Defines the final numeric payoff awarded to player $p$ when the game ends in terminal state $s$.
   * In Tic-Tac-Toe: $+1$ (win for MAX), $-1$ (win for MIN), $0$ (draw).
   * In Chess: $+1$ (white wins), $-1$ (black wins), $0$ (stalemate/draw).

> **Convention**: MAX always moves first and seeks to **maximize** the utility. MIN moves second and seeks to **minimize** the utility for MAX.
          `,
          keyTakeaways: [
            'Deterministic games consist of S_0, Player(s), Actions(s), Result(s,a), Terminal-Test(s), and Utility(s,p).',
            'MAX seeks to maximize utility; MIN seeks to minimize utility.',
            'Terminal states have fixed numerical payoffs defined by the utility function.',
          ],
        },
        {
          id: 'game-tree-vs-search-tree',
          title: 'Game Tree vs. Search Tree',
          slideRef: { lessonId: 'lesson-4', slideNumber: 11, note: 'Game tree vs search tree' },
          summary:
            'The game tree is the theoretical construct of all possible states (362,880 for Tic-Tac-Toe, 10^40 for chess). The search tree is the operational portion evaluated in real time.',
          content: `
### The Full Game Tree (Slide 11–12)

The **Game Tree** is a complete, theoretical graph where:
* The **root node** represents the initial board configuration $S_0$.
* **Edges** represent legal moves taken by the active player.
* **Nodes** are arranged in alternating levels (plies):
  * **Level 0 (Root)**: MAX to move.
  * **Level 1**: MIN to move.
  * **Level 2**: MAX to move.
  * ...
* **Leaf nodes** represent terminal board configurations where $\\text{Terminal-Test}(s) = \\text{true}$.

#### Combinatorial Explosion of Game Trees:
* **Tic-Tac-Toe (Tres en raya)**:
  * Maximum depth $m = 9$.
  * Total tree nodes: $9! = 362,880$ nodes (relatively small, entirely computable).
* **Chess**:
  * Average branching factor $b \\approx 35$.
  * Average game length $m \\approx 100$ plies.
  * Game tree size: $b^m \\approx 35^{100} > 10^{154}$ nodes! (More than the number of atoms in the observable universe $\\approx 10^{80}$).

### The Search Tree (Slide 12)
> A **Search Tree** is a tree *superimposed* on the full theoretical game tree. It examines only enough nodes to allow the agent to determine the single best move to make in the current state within allocated computational time.
          `,
          keyTakeaways: [
            'A game tree contains every possible sequence of moves to terminal states.',
            'Tic-Tac-Toe has 9! = 362,880 nodes; Chess has over 10^40 reachable positions.',
            'A search tree is an operational subset evaluated to make the next decision.',
          ],
        },
      ],
    },
    {
      id: 'optimal-decisions-minimax',
      number: 2,
      title: 'Optimal Decisions & The Minimax Algorithm',
      slideRange: 'Slides 13–26',
      description:
        'Minimax value definition, mathematical formulation, complete recursive algorithm pseudocode, 2-ply trace, multiplayer extension, and complexity properties.',
      sections: [
        {
          id: 'optimal-strategy-concept',
          title: 'The Concept of an Optimal Strategy',
          slideRef: { lessonId: 'lesson-4', slideNumber: 15, note: 'Optimal strategy against infallible opponent' },
          summary:
            'Against an optimal opponent, the agent must choose moves that guarantee the best possible outcome regardless of what the opponent plays.',
          content: `
### Infallible Opponents & Game-Theoretic Optimality (Slide 15)

In single-agent search, the optimal path is a sequence of actions $a_1, a_2, \\dots, a_k$ leading directly to a goal state.

In adversarial games:
* The opponent’s objective is to **prevent the agent from reaching a winning state**.
* We assume the opponent is **infallible** (rational, perceptive, and playing with optimal strategy).
* **Definition of Optimal Strategy**:
  > An **Optimal Strategy** leads to outcomes that are *at least as good* as any other strategy when playing against an infallible opponent.

If the opponent makes a mistake or plays sub-optimally, an optimal strategy does even better!
          `,
          keyTakeaways: [
            'Adversarial planning assumes the opponent plays infallibly.',
            'An optimal strategy guarantees the highest possible guaranteed payoff against optimal play.',
            'Sub-optimal opponent play only increases the agent’s final payoff.',
          ],
        },
        {
          id: 'minimax-value-and-formulation',
          title: 'The Minimax Value: Mathematical Formulation',
          slideRef: { lessonId: 'lesson-4', slideNumber: 19, note: 'Minimax value definition and equation' },
          summary:
            'The Minimax value of a state represents its expected utility under optimal play by both sides, recursively computed as max for MAX and min for MIN.',
          content: `
### Definition of the Minimax Value (Slide 19)

> The **Minimax value** of a node corresponds to the utility of being in that state, assuming that **both players play optimally** from that point until the end of the game.

Given a game tree, the optimal move can be computed by propagating values from the terminal leaves back up to the root:
* **MAX** chooses the action that leads to the state with the **maximum** minimax value.
* **MIN** chooses the action that leads to the state with the **minimum** minimax value.

### The Formal Piecewise Formula (Slide 19):

$$\\text{Minimax}(s) = \\begin{cases} \\text{Utility}(s) & \\text{if } \\text{Terminal-Test}(s) \\\\[6pt] \\displaystyle \\max_{a \\in \\text{Actions}(s)} \\text{Minimax}(\\text{Result}(s, a)) & \\text{if } \\text{Player}(s) = \\text{MAX} \\\\[6pt] \\displaystyle \\min_{a \\in \\text{Actions}(s)} \\text{Minimax}(\\text{Result}(s, a)) & \\text{if } \\text{Player}(s) = \\text{MIN} \\end{cases}$$
          `,
          keyTakeaways: [
            'Minimax value = backed-up utility assuming optimal play by both players.',
            'Leaves obtain their values directly from the Utility function.',
            'MAX takes the maximum child value; MIN takes the minimum child value.',
          ],
        },
        {
          id: 'minimax-pseudocode-and-trace',
          title: 'The Minimax Algorithm: Pseudocode & 2-Ply Trace',
          slideRef: { lessonId: 'lesson-4', slideNumber: 21, note: 'Minimax algorithm pseudocode' },
          summary:
            'Detailed recursive pseudocode for Minimax-Decision, Max-Value, and Min-Value, illustrated with a full trace on the canonical 2-ply lecture tree.',
          content: `
### Minimax Algorithm Pseudocode (Slide 21)

The algorithm consists of three mutually recursive functions:

\`\`\`python
def MINIMAX_DECISION(state):
    """Returns the optimal action for player MAX in current state."""
    best_action = None
    v = -infinity
    for a in Actions(state):
        succ_val = MIN_VALUE(Result(state, a))
        if succ_val > v:
            v = succ_val
            best_action = a
    return best_action

def MAX_VALUE(state):
    """Calculates maximum utility for player MAX."""
    if Terminal_Test(state):
        return Utility(state)
    v = -infinity
    for a in Actions(state):
        v = max(v, MIN_VALUE(Result(state, a)))
    return v

def MIN_VALUE(state):
    """Calculates minimum utility for player MIN."""
    if Terminal_Test(state):
        return Utility(state)
    v = +infinity
    for a in Actions(state):
        v = min(v, MAX_VALUE(Result(state, a)))
    return v
\`\`\`

---

### Step-by-Step Canonical Tree Trace (Slides 17–20)

Consider the 2-ply game tree from lecture slides 17–20:
* Root **A** (MAX) has 3 candidate moves: $a_1, a_2, a_3$ leading to states **B, C, D** (MIN).
* Under state **B**, MIN can choose between three outcomes with terminal utilities $\\{3, 12, 8\\}$:
  $$\\text{Minimax}(B) = \\min(3, 12, 8) = \\mathbf{3} \\quad (\\text{action } b_1)$$
* Under state **C**, MIN can choose between three outcomes with terminal utilities $\\{2, 4, 6\\}$:
  $$\\text{Minimax}(C) = \\min(2, 4, 6) = \\mathbf{2} \\quad (\\text{action } c_1)$$
* Under state **D**, MIN can choose between three outcomes with terminal utilities $\\{14, 5, 2\\}$:
  $$\\text{Minimax}(D) = \\min(14, 5, 2) = \\mathbf{2} \\quad (\\text{action } d_3)$$
* Now player **MAX** at root node **A** evaluates the three alternatives:
  $$\\text{Minimax}(A) = \\max(\\text{Minimax}(B), \\text{Minimax}(C), \\text{Minimax}(D)) = \\max(3, 2, 2) = \\mathbf{3}$$

**Conclusion**: MAX chooses action $\\mathbf{a_1}$, because it guarantees a minimum utility of 3, whereas $a_2$ and $a_3$ would allow MIN to hold MAX to a utility of only 2!
          `,
          keyTakeaways: [
            'Minimax-Decision calls Max-Value and Min-Value recursively.',
            'Depth-first search backs up values from leaf utilities up to the root.',
            'MAX picks the branch with the highest backed-up minimum value.',
          ],
        },
        {
          id: 'multiplayer-games-and-alliances',
          title: 'Multiplayer Games (N > 2) & Alliances',
          slideRef: { lessonId: 'lesson-4', slideNumber: 24, note: 'Multiplayer minimax' },
          summary:
            'Extending minimax to 3+ players requires utility vectors <vA, vB, vC>. Each player maximizes their own coordinate, giving rise to tactical alliances.',
          content: `
### Extending Minimax to Multiplayer Games (Slides 24–25)

Can Minimax be extended beyond two players? Yes, with two essential modifications:

1. **Utility Vectors**:
   Instead of a single scalar utility, each terminal state produces an $N$-element vector:
   $$\\mathbf{v} = \\langle v_A, v_B, v_C \\rangle$$
   where $v_i$ is the payoff awarded to player $i$.
2. **Player-Specific Maximization**:
   At each decision node, the player whose turn it is chooses the child node that maximizes **their own coordinate** in the vector:
   * When **Player A** moves, choose child maximizing $v_A$.
   * When **Player B** moves, choose child maximizing $v_B$.
   * When **Player C** moves, choose child maximizing $v_C$.

---

### Step-by-Step Multiplayer Trace (Slide 25)
In the 3-player tree (A, B, C):
* At node **X**, it is **Player C's** turn. C compares two terminal vectors:
  $$\\text{Left: } (1, 2, 6) \\quad \\text{vs} \\quad \\text{Right: } (4, 2, 3)$$
  Player C examines the 3rd component ($v_C$): $6 > 3$. Player C chooses $(1, 2, 6)$.
* At node **Y**, it is **Player B's** turn. B compares:
  $$\\text{Left: } (-1, 5, 2) \\quad \\text{vs} \\quad \\text{Right: } (5, 4, 5)$$
  Player B examines the 2nd component ($v_B$): $5 > 4$. Player B chooses $(-1, 5, 2)$.

### The Emergence of Alliances (Slide 24)
Unlike strict 2-player zero-sum games, multiplayer games allow **alliances**: two weaker players can tacitly cooperate against a dominant player to prevent them from winning, shifting the dynamics from pure calculation to negotiation and game-theoretic equilibrium.
          `,
          keyTakeaways: [
            'Multiplayer games use utility vectors <vA, vB, vC>.',
            'Each player maximizes their own specific coordinate in the vector.',
            'Dynamic alliances emerge when players cooperate against a common leader.',
          ],
        },
        {
          id: 'minimax-properties-and-complexity',
          title: 'Properties & Complexity of Minimax',
          slideRef: { lessonId: 'lesson-4', slideNumber: 26, note: 'Minimax properties' },
          summary:
            'Minimax is complete for finite trees, optimal against optimal opponents, and runs in O(b^m) time with O(bm) space. Infeasible for large games without pruning.',
          content: `
### Theoretical Properties of Minimax (Slide 26)

| Property | Status | Mathematical Explanation |
|---|---|---|
| **Completeness** | **Yes** | Complete if the game tree is **finite** (no infinite cyclic repetitions). |
| **Optimality** | **Yes** | Guaranteed optimal **if the opponent plays optimally**. |
| **Search Strategy** | **Depth-First** | Traverses tree to leaf nodes recursively before backing up values. |
| **Time Complexity** | **$O(b^m)$** | Must examine all branches at depth $m$ with branching factor $b$. |
| **Space Complexity** | **$O(bm)$** | $O(bm)$ if generating all legal moves at each node; $O(m)$ if generating actions one by one. |

### The Exponential Reality: Why Raw Minimax Fails in Practice
* In Chess: $b \\approx 35$, $m \\approx 100$ plies $\\implies 35^{100} \\approx 10^{154}$ operations.
* Even at Deep Blue's speed of 300 million nodes per second, evaluating the tree would take $> 10^{138}$ centuries!
* **Conclusion**: We cannot examine every node. We must either:
  1. **Prune branches** that cannot affect the outcome (**Alpha-Beta Pruning**).
  2. **Cut off search early** using heuristic evaluation (**Heuristic Minimax**).
          `,
          keyTakeaways: [
            'Minimax is complete and optimal against optimal opponents.',
            'Time complexity is O(b^m); space complexity is O(bm).',
            'Combinatorial explosion requires pruning or early depth cutoffs.',
          ],
        },
      ],
    },
    {
      id: 'alphabeta-pruning',
      number: 3,
      title: 'Alpha-Beta (α-β) Pruning',
      slideRange: 'Slides 27–44',
      description:
        'Motivation, α and β bounding parameters, interval logic, complete algorithm, canonical walkthrough, and move ordering impact.',
      sections: [
        {
          id: 'alphabeta-intuition-and-principle',
          title: 'The Alpha-Beta Pruning Principle',
          slideRef: { lessonId: 'lesson-4', slideNumber: 28, note: 'From minimax to alpha-beta' },
          summary:
            'Alpha-beta pruning eliminates branches that cannot influence the final root decision, returning the exact same move as minimax while evaluating vastly fewer nodes.',
          content: `
### Why Alpha-Beta Pruning? (Slide 28)

The fundamental bottleneck of Minimax is its exponential complexity $O(b^m)$.
Can we eliminate the exponent? No.
**Can we cut the exponent in half? YES!**

> **Alpha-Beta Pruning Principle**:
> Cuts (prunes) branches on the game tree that **cannot possibly influence the final decision**. It returns the **exact same move as full Minimax**, but avoids examining irrelevant subtrees.

With optimal move ordering, Alpha-Beta pruning explores only:
$$O(b^{m/2}) = O\\left((\\sqrt{b})^m\\right)$$
This effectively **doubles the search depth** an agent can reach in the same amount of time! For example, in chess, searching depth 12 instead of depth 6 transforms an amateur program into an international master.
          `,
          keyTakeaways: [
            'Alpha-Beta returns the exact same decision as Minimax with 0 loss of accuracy.',
            'Cuts search complexity from O(b^m) to O(b^(m/2)) under optimal ordering.',
            'Doubles the effective search depth reachable within fixed time budgets.',
          ],
        },
        {
          id: 'alpha-and-beta-parameters',
          title: 'Parameters α and β: Interval Bounding Logic',
          slideRef: { lessonId: 'lesson-4', slideNumber: 32, note: 'Alpha and beta parameters' },
          summary:
            'α is the best (highest) value found so far for MAX; β is the best (lowest) value found so far for MIN. Pruning occurs whenever α ≥ β.',
          content: `
### What Do α and β Mean? (Slide 32)

Alpha-Beta pruning tracks two bounding parameters along the search path from the root:

* **$\\mathbf{\\alpha}$ (Alpha)**:
  * The value of the **best (highest-utility) choice** found so far at any choice point along the path for **MAX**.
  * Initially: $\\alpha = -\\infty$.
  * Only updated by **MAX** nodes: $\\alpha \\leftarrow \\max(\\alpha, v)$.
* **$\\mathbf{\\beta}$ (Beta)**:
  * The value of the **best (lowest-utility) choice** found so far at any choice point along the path for **MIN**.
  * Initially: $\\beta = +\\infty$.
  * Only updated by **MIN** nodes: $\\beta \\leftarrow \\min(\\beta, v)$.

### The Pruning Rule (Slides 29 & 33):
The backed-up value at any point must lie within the open interval $(\\alpha, \\beta)$:
$$\\mathbf{\\text{If } \\alpha \\ge \\beta, \\quad \\text{PRUNE THE REMAINING SUCCESSORS!}}$$

#### Why Does Pruning Work?
* Suppose MAX at an ancestor node already has a guaranteed move scoring $\\alpha = 3$.
* Now we are exploring a MIN node. MIN finds a child with value $2$. Since MIN will pick the lowest value, this MIN node's value will be $\\le 2$ (so $\\beta \\le 2$).
* MAX will never choose this branch because MAX already has a guaranteed $3$.
* Thus, the remaining children of this MIN node can never affect MAX's decision and can be pruned immediately!
          `,
          keyTakeaways: [
            'α = best value for MAX so far (initially -∞, updated by MAX).',
            'β = best value for MIN so far (initially +∞, updated by MIN).',
            'Prune immediately whenever α ≥ β (no overlap between intervals).',
          ],
        },
        {
          id: 'alphabeta-algorithm-pseudocode',
          title: 'The Alpha-Beta Pruning Algorithm',
          slideRef: { lessonId: 'lesson-4', slideNumber: 33, note: 'Alpha-beta algorithm pseudocode' },
          summary:
            'Formal pseudocode for Alpha-Beta-Search, Max-Value(state, α, β), and Min-Value(state, α, β) with cutoff condition α ≥ β.',
          content: `
### Complete Alpha-Beta Pseudocode (Slide 33)

\`\`\`python
def ALPHA_BETA_SEARCH(state):
    """Returns the optimal action for player MAX using alpha-beta pruning."""
    v = MAX_VALUE(state, -infinity, +infinity)
    # Return action a that achieves value v
    for a in Actions(state):
        if MIN_VALUE(Result(state, a), -infinity, +infinity) == v:
            return a

def MAX_VALUE(state, alpha, beta):
    if Terminal_Test(state):
        return Utility(state)
    v = -infinity
    for a in Actions(state):
        v = max(v, MIN_VALUE(Result(state, a), alpha, beta))
        alpha = max(alpha, v)
        if alpha >= beta:
            return v  # Beta cut: MIN will never allow this branch
    return v

def MIN_VALUE(state, alpha, beta):
    if Terminal_Test(state):
        return Utility(state)
    v = +infinity
    for a in Actions(state):
        v = min(v, MAX_VALUE(Result(state, a), alpha, beta))
        beta = min(beta, v)
        if alpha >= beta:
            return v  # Alpha cut: MAX already has a better alternative
    return v
\`\`\`
          `,
          keyTakeaways: [
            'Alpha-Beta passes bounding interval [α, β] down the search tree.',
            'MAX updates α; MIN updates β.',
            'A cutoff returns early as soon as α ≥ β.',
          ],
        },
        {
          id: 'step-by-step-alphabeta-trace',
          title: 'Step-by-Step Walkthrough of Alpha-Beta Pruning',
          slideRef: { lessonId: 'lesson-4', slideNumber: 34, note: 'Step-by-step alpha-beta trace' },
          summary:
            'A complete 7-step visual trace through the canonical lecture tree showing how node C is pruned after evaluating its first child.',
          content: `
### Step-by-Step Canonical Walkthrough (Slides 34–43)

Let us trace $\\alpha$-$\\beta$ pruning on the standard lecture tree:
* **Step 1 (Slide 34)**: Root $A$ initializes $[\\alpha = -\\infty, \\beta = +\\infty]$. Calls child $B$ with $[-\\infty, +\\infty]$.
* **Step 2 (Slides 35–37)**:
  * Child 1 of $B$ returns $3 \\implies B$ value $\\le 3$ ($[\\alpha = -\\infty, \\beta = 3]$).
  * Child 2 of $B$ returns $12$ (ignored by MIN since $12 > 3$).
  * Child 3 of $B$ returns $8$ (ignored by MIN since $8 > 3$).
  * $B$ finishes with value $\\mathbf{3}$.
* **Step 3 (Slide 37)**: Back at root $A$: MAX updates $\\alpha = \\max(-\\infty, 3) = \\mathbf{3}$. Root interval is now $[\\alpha = 3, \\beta = +\\infty]$.
* **Step 4 (Slide 38 - THE CRITICAL PRUNING MOMENT)**:
  * Root $A$ calls child $C$ with $[\\alpha = 3, \\beta = +\\infty]$.
  * The first child of $C$ returns $\\mathbf{2}$.
  * Since $C$ is a MIN node, $\\beta = \\min(+\\infty, 2) = \\mathbf{2}$.
  * Now check the pruning condition:
    $$\\alpha = 3, \\quad \\beta = 2 \\implies \\mathbf{\\alpha \\ge \\beta \\quad (3 \\ge 2) \\implies \\text{PRUNE!}}$$
  * **Result**: The remaining two children of $C$ ($4$ and $6$) are **pruned without being evaluated**!
* **Step 5 (Slides 39–41)**:
  * Root $A$ calls child $D$ with $[\\alpha = 3, \\beta = +\\infty]$.
  * Child 1 of $D$ returns $14 \\implies \\beta = 14$. $\\alpha = 3 < 14$, continue.
  * Child 2 of $D$ returns $5 \\implies \\beta = 5$. $\\alpha = 3 < 5$, continue.
  * Child 3 of $D$ returns $2 \\implies \\beta = 2$. Now $\\alpha \\ge \\beta$, loop finishes.
  * $D$ returns value $2$.
* **Step 6 (Slide 41)**:
  * Root $A$ has evaluated $B(3)$, $C(\\le 2)$, and $D(2)$.
  * Final decision: $\\max(3, \\le 2, 2) = \\mathbf{3}$, choosing move $\\mathbf{a_1}$.

**Savings**: 2 out of 9 terminal evaluations eliminated (22% savings on just a 2-ply tree; exponential savings on deeper trees).
          `,
          keyTakeaways: [
            'Leaf 3 sets root α = 3.',
            'At node C, first child 2 sets β = 2.',
            'Since α (3) ≥ β (2), node C is pruned immediately, skipping leaves 4 and 6.',
          ],
        },
        {
          id: 'move-ordering-and-efficiency',
          title: 'The Critical Role of Move Ordering',
          slideRef: { lessonId: 'lesson-4', slideNumber: 44, note: 'Move ordering in alpha-beta' },
          summary:
            'Pruning effectiveness depends heavily on move ordering. Perfect ordering yields O(b^(m/2)), while worst ordering yields no pruning O(b^m).',
          content: `
### Move Ordering Determines Pruning Power (Slide 44)

The effectiveness of Alpha-Beta pruning is **highly sensitive to the order in which moves are examined**:

1. **Perfect Move Ordering (Best-First)**:
   * If the best move for MAX and MIN is examined first at every level, pruning achieves maximum theoretical efficiency:
     $$\\text{Complexity} = O\\left(b^{m/2}\\right)$$
   * The effective branching factor becomes $\\sqrt{b}$ (e.g., in chess, $\\sqrt{35} \\approx 6$).
2. **Worst Move Ordering (Worst-First)**:
   * If moves are ordered from worst to best, **no branches are pruned**:
     $$\\text{Complexity} = O\\left(b^m\\right) \\quad (\\text{identical to raw Minimax})$$
3. **Random Move Ordering**:
   * On average with random move ordering:
     $$\\text{Complexity} \\approx O\\left(b^{3m/4}\\right)$$

### Practical Move-Ordering Heuristics in Game Engines:
To get close to $O(b^{m/2})$, real engines employ:
* **Killer Move Heuristic**: Moves that caused a cutoff in sibling branches are tried first.
* **Transposition Tables**: Hash tables storing values and best moves for previously seen board states.
* **Iterative Deepening**: Run search to depth $d-1$ first; order moves at depth $d$ using the scores from depth $d-1$.
* **Capture Ordering (MVV-LVA)**: Most Valuable Victim / Least Valuable Attacker (e.g., Pawn takes Queen is tried before Queen takes Pawn).
          `,
          keyTakeaways: [
            'Perfect ordering achieves O(b^(m/2)), effectively doubling search depth.',
            'Worst ordering yields no pruning O(b^m).',
            'Iterative deepening and killer move heuristics order moves effectively in practice.',
          ],
        },
      ],
    },
    {
      id: 'imperfect-real-time-decisions',
      number: 4,
      title: 'Imperfect Real-Time Decisions & Evaluation Functions',
      slideRange: 'Slides 45–51',
      description:
        'Depth cutoffs, heuristic evaluation functions, weighted linear models, the horizon effect, and forward beam search pruning.',
      sections: [
        {
          id: 'cutting-off-search-and-eval',
          title: 'Cutting Off Search: Cutoff-Test & Eval(s)',
          slideRef: { lessonId: 'lesson-4', slideNumber: 47, note: 'Cutting off search' },
          summary:
            'Real-time games replace Terminal-Test with Cutoff-Test(s, d) and Utility with heuristic evaluation function Eval(s).',
          content: `
### Resources Are Limited (Slides 46–47)

Even with Alpha-Beta pruning, searching to the end of a chess game would require depth 80–100 plies—an impossibility.
Shannon (1950) proposed replacing the terminal test with a **heuristic cutoff**:

1. **$\\text{Cutoff-Test}(s, d)$**:
   Returns \`true\` if the search should stop at state $s$ at current search depth $d$ (e.g., $d \\ge d_{\\max}$ or time expired).
2. **$\\text{Eval}(s)$**:
   An evaluation function returning an **estimate of expected utility** from state $s$, exactly analogous to heuristic $h(n)$ in classical informed search.

### Heuristic Minimax Formulation (Slide 47):

$$\\text{H-Minimax}(s, d) = \\begin{cases} \\text{Eval}(s) & \\text{if } \\text{Cutoff-Test}(s, d) \\\\[6pt] \\displaystyle \\max_{a \\in \\text{Actions}(s)} \\text{H-Minimax}(\\text{Result}(s, a), d + 1) & \\text{if } \\text{Player}(s) = \\text{MAX} \\\\[6pt] \\displaystyle \\min_{a \\in \\text{Actions}(s)} \\text{H-Minimax}(\\text{Result}(s, a), d + 1) & \\text{if } \\text{Player}(s) = \\text{MIN} \\end{cases}$$
          `,
          keyTakeaways: [
            'Real-time engines truncate the game tree at fixed depth d.',
            'Cutoff-Test(s, d) replaces Terminal-Test(s).',
            'Eval(s) estimates expected utility at non-terminal cutoff leaves.',
          ],
        },
        {
          id: 'evaluation-function-design',
          title: 'Designing Evaluation Functions: Weighted Linear Models',
          slideRef: { lessonId: 'lesson-4', slideNumber: 48, note: 'Evaluation function design' },
          summary:
            'A good evaluation function preserves terminal rankings, computes rapidly, correlates with winning, and is frequently structured as a weighted linear sum of features.',
          content: `
### Three Principles of Evaluation Function Design (Slide 48)

1. **Order Preservation**:
   Must rank terminal states in the exact same relative order as true utilities (Win > Draw > Loss).
2. **Computational Speed**:
   Must be calculated in microseconds, as it is called millions of times per move.
3. **Correlation with Winning Probability**:
   For non-terminal states, its score must be strongly correlated with the true mathematical probability of winning from that position.

---

### The Weighted Linear Evaluation Function (Slide 48)

The most standard formulation for classical game evaluation functions is a linear combination of numerical features:

$$\\mathbf{\\text{Eval}(s) = w_1 f_1(s) + w_2 f_2(s) + \\dots + w_n f_n(s) = \\sum_{i=1}^n w_i f_i(s)}$$

Where:
* $f_i(s)$ is a numerical feature extracted from state $s$ (e.g., piece count, piece mobility, pawn structure).
* $w_i$ is the empirical weight assigned to feature $i$.

#### Example: Classical Chess Material Weights:
* Pawn ($f_1$): weight $w_1 = +1$
* Knight ($f_2$): weight $w_2 = +3$
* Bishop ($f_3$): weight $w_3 = +3$
* Rook ($f_4$): weight $w_4 = +5$
* Queen ($f_5$): weight $w_5 = +9$
* Positional features: center control ($+0.4$), king safety ($+0.8$), passed pawn advance ($+0.5$).
          `,
          keyTakeaways: [
            'Eval must be fast, accurate, and preserve terminal state order.',
            'Weighted linear function: Eval(s) = ∑ w_i f_i(s).',
            'Features measure material balance, mobility, territory, and king safety.',
          ],
        },
        {
          id: 'horizon-effect-and-forward-pruning',
          title: 'Search Pathologies: The Horizon Effect & Forward Pruning',
          slideRef: { lessonId: 'lesson-4', slideNumber: 50, note: 'Horizon effect' },
          summary:
            'The horizon effect occurs when a program delays an unavoidable loss by pushing it beyond the search horizon. Forward pruning discards unpromising moves at generation.',
          content: `
### The Horizon Effect (Slide 50)

> **The Horizon Effect** occurs when the agent is faced with an unavoidable serious loss, but finds delaying moves that push the capture **just beyond the search depth limit (the horizon)**.

#### Concrete Chess Example (Slide 50):
* Black's bishop is trapped and will inevitably be captured by White's rook (a 6-ply forced sequence).
* But Black can deliver a series of pointless, sacrificial checks to White's king with pawns:
  * Move 1: Pawn checks king (White must respond).
  * Move 2: Another pawn checks king (White must respond).
* By inserting these delay checks, the eventual capture of the bishop is pushed from ply 6 to ply 8.
* If the engine only searches to depth 7, it evaluates the position at the horizon and concludes: *"I saved the bishop!"*
* In reality, the bishop is still lost, and Black has now thrown away pawns for nothing!
* **Remedy: Quiescence Search**: Continue searching past the depth cutoff for "non-quiescent" positions (captures, checks) until a quiet state is reached.

---

### Forward Pruning & Beam Search (Slide 51)
* **Forward Pruning**: Discarding some moves immediately at node expansion without searching them at all.
* **Beam Search**: At each ply, expand only the $k$ most promising moves according to an evaluation heuristic.
* **Risk**: Pruning a line that initially looks quiet but contains a brilliant tactical sacrifice.
          `,
          keyTakeaways: [
            'Horizon effect: delaying unavoidable losses with useless checks pushes them beyond depth d.',
            'Quiescence search resolves the horizon effect by continuing captures to quiet states.',
            'Forward pruning and beam search restrict the branching factor but risk pruning winning moves.',
          ],
        },
      ],
    },
    {
      id: 'stochastic-games-expectiminimax',
      number: 5,
      title: 'Stochastic Games & Expectiminimax',
      slideRange: 'Slides 52–58',
      description:
        'Randomness in games, Chance nodes, Expectiminimax mathematical formulation, scale-sensitivity theorem ("Values Matter"), and TD-Gammon.',
      sections: [
        {
          id: 'chance-nodes-and-stochastic-games',
          title: 'Chance Nodes & Non-Deterministic Games',
          slideRef: { lessonId: 'lesson-4', slideNumber: 53, note: 'Stochastic games' },
          summary:
            'Stochastic games involve unpredictable random events like dice rolls or card draws. Trees represent these using circular Chance Nodes.',
          content: `
### Introducing Randomness: Stochastic Games (Slides 53–54)

Many real-world games incorporate elements of chance:
* **Dice Rolls**: Backgammon, Monopoly, Craps.
* **Card Shuffling / Dealing**: Poker, Blackjack, Bridge.

Because an action produces probabilistic outcomes, the agent cannot construct a standard deterministic game tree. The tree must incorporate **Chance Nodes** (conventionally drawn as circles):
* **Triangles pointing up**: MAX nodes.
* **Circles**: CHANCE nodes (branching on all possible random outcomes with their associated probabilities $P(r)$).
* **Triangles pointing down**: MIN nodes.
          `,
          keyTakeaways: [
            'Stochastic games combine adversarial decisions with random chance events.',
            'Game trees incorporate circular Chance Nodes with transition probabilities P(r).',
            'Examples include Backgammon (dice), Monopoly (dice), and Poker (cards).',
          ],
        },
        {
          id: 'expectiminimax-formulation-and-trace',
          title: 'Expectiminimax: Value Formulation & Worked Example',
          slideRef: { lessonId: 'lesson-4', slideNumber: 55, note: 'Expectiminimax formula' },
          summary:
            'Expectiminimax calculates the mathematical expected value over chance outcomes, taking max at MAX nodes and min at MIN nodes.',
          content: `
### Expectiminimax Mathematical Formulation (Slide 55)

In stochastic games, nodes have no definite single minimax value. Instead, we compute the **Expected Value** averaging over all possible outcomes of the chance events:

$$\\text{ExpectiMinimax}(s) = \\begin{cases} \\text{Utility}(s) & \\text{if } \\text{Terminal-Test}(s) \\\\[6pt] \\displaystyle \\max_{a} \\text{ExpectiMinimax}(\\text{Result}(s, a)) & \\text{if } \\text{Player}(s) = \\text{MAX} \\\\[6pt] \\displaystyle \\min_{a} \\text{ExpectiMinimax}(\\text{Result}(s, a)) & \\text{if } \\text{Player}(s) = \\text{MIN} \\\\[6pt] \\displaystyle \\sum_{r} P(r) \\cdot \\text{ExpectiMinimax}(\\text{Result}(s, r)) & \\text{if } \\text{Player}(s) = \\text{CHANCE} \\end{cases}$$

---

### Step-by-Step Worked Calculation (Slide 56)

Consider the stochastic tree from lecture slide 56:
* MAX at root $A$ considers two actions: $a_1$ and $a_2$.
* Action $a_1$ leads to chance node $ch_1$:
  * With probability $P(B) = 0.9$, reaches state $B$ (where MIN forces utility $2$).
  * With probability $P(C) = 0.1$, reaches state $C$ (where MIN forces utility $3$).
  $$\\text{ExpectiMinimax}(ch_1) = 0.9 \\times 2 + 0.1 \\times 3 = 1.8 + 0.3 = \\mathbf{2.1}$$
* Action $a_2$ leads to chance node $ch_2$:
  * With probability $P(D) = 0.9$, reaches state $D$ (where MIN forces utility $1$).
  * With probability $P(E) = 0.1$, reaches state $E$ (where MIN forces utility $4$).
  $$\\text{ExpectiMinimax}(ch_2) = 0.9 \\times 1 + 0.1 \\times 4 = 0.9 + 0.4 = \\mathbf{1.3}$$
* Root MAX compares the two expected payoffs:
  $$\\text{ExpectiMinimax}(A) = \\max(2.1, 1.3) = \\mathbf{2.1} \\implies \\text{Choose } \\mathbf{a_1}$$
          `,
          keyTakeaways: [
            'Expectiminimax averages child values weighted by probabilities at Chance nodes.',
            'MAX picks the action with the maximum expected utility.',
            'Slide 56 calculation: ch1 = 2.1 vs ch2 = 1.3 -> MAX selects a1.',
          ],
        },
        {
          id: 'values-matter-theorem',
          title: 'The "Values Matter" Theorem: Scale Sensitivity in Stochastic Games',
          slideRef: { lessonId: 'lesson-4', slideNumber: 57, note: 'Values matter theorem' },
          summary:
            'In deterministic games, any monotonic transformation preserves optimal moves. In stochastic games, non-linear monotonic transformations can change the optimal move!',
          content: `
### The Fundamental Difference: Deterministic vs. Stochastic Scaling (Slide 57)

In deterministic Minimax:
* If we apply **any strictly monotonic (order-preserving) transformation** $f(u)$ to utilities (e.g., $u' = u^3$ or $u' = \\log(u)$), the relative ordering of leaves does not change.
* Therefore, **the optimal move chosen by Minimax remains completely identical**.

### The "Values Matter" Theorem for Stochastic Games:
> **Theorem**: In stochastic games, monotonic order-preserving transformations on leaf utilities **CAN CHANGE THE OPTIMAL MOVE**!
> Only **positive affine transformations** ($u' = c_1 u + c_2$ with $c_1 > 0$) are guaranteed to preserve optimal Expectiminimax decisions.

---

### Mathematical Proof by Counterexample (Slide 57):
Consider the slide 56 tree with original utilities $(2, 3, 1, 4)$:
* Under original values:
  * $\\text{ExpectiMinimax}(ch_1) = 0.9(2) + 0.1(3) = \\mathbf{2.1}$
  * $\\text{ExpectiMinimax}(ch_2) = 0.9(1) + 0.1(4) = \\mathbf{1.3}$
  * Best move: $\\mathbf{a_1}$ ($2.1 > 1.3$).

Now apply the order-preserving monotonic transformation:
$$2 \\to 20, \\quad 3 \\to 30, \\quad 1 \\to 1, \\quad 4 \\to 400$$
(Notice that $1 < 2 < 3 < 4$ and $1 < 20 < 30 < 400$, so the relative order is strictly preserved!)

Recalculate expected values under transformed utilities:
* $\\text{ExpectiMinimax}(ch_1) = 0.9(20) + 0.1(30) = 18 + 3 = \\mathbf{21}$
* $\\text{ExpectiMinimax}(ch_2) = 0.9(1) + 0.1(400) = 0.9 + 40 = \\mathbf{40.9}$

**Look at what happened**:
$$\\mathbf{40.9 > 21 \\implies \\text{Optimal move has FLIPPED to } a_2!}$$

**Profound AI Consequence**: In stochastic domains, evaluation functions cannot merely rank states ordinal-wise; they must represent **true cardinal von Neumann-Morgenstern utilities** (reflecting exact risk preferences)!
          `,
          keyTakeaways: [
            'In deterministic Minimax, monotonic scaling never changes the move.',
            'In stochastic Expectiminimax, non-linear monotonic scaling CAN CHANGE the optimal move.',
            'Only positive affine transformations (u\' = c1*u + c2, c1 > 0) preserve decisions.',
          ],
        },
      ],
    },
    {
      id: 'proposed-problems-and-exam-solutions',
      number: 6,
      title: 'Proposed Problems & Exam Solutions',
      slideRange: 'Slides 59–62',
      description:
        'Formal solutions to UCLM proposed exam exercises: Tic-Tac-Toe depth-3 Alpha-Beta evaluation and the Game of NIM matchstick analysis.',
      sections: [
        {
          id: 'exam-problem-1-tictactoe-alphabeta',
          title: 'Problem 1: Tic-Tac-Toe Depth-3 Alpha-Beta with Line-Counting Evaluation',
          slideRef: { lessonId: 'lesson-4', slideNumber: 61, note: 'Proposed Problem #1 Tic-Tac-Toe' },
          summary:
            'Solving the slide 61 exam exercise: evaluate a Tic-Tac-Toe board state to depth 3 using alpha-beta pruning and the lines-possible evaluation function.',
          content: `
### Problem Statement (Slide 61)

Consider the Tic-Tac-Toe game in the following position. It is the turn of **MAX** (using symbol **O**):

\`\`\`
  . | X | .
 -----------
  . | O | .
 -----------
  . | . | .
\`\`\`
* Player MAX = **O** (located at center: row 1, col 1).
* Player MIN = **X** (located at top middle: row 0, col 1).

The machine uses **Minimax with Alpha-Beta pruning to depth 3**.
**Evaluation Function $\\text{Eval}(s)$**:
* State where MAX wins: $+1000$
* Terminal state where MIN wins: $-1000$
* Terminal state tie: $0$
* Non-terminal:
  $$\\text{Eval}(s) = (\\text{Possible lines MAX could complete}) - (\\text{Possible lines MIN could complete})$$

---

### Step-by-Step Formal Solution:

#### 1. Evaluation of Current Root State:
* **Lines MAX (O) can still complete** (lines containing no X):
  * Central row: $(1,0), (1,1), (1,2)$ (has O, no X) $\\to 1$
  * Main diagonal (left-to-right): $(0,0), (1,1), (2,2)$ (has O, no X) $\\to 1$
  * Anti-diagonal (right-to-left): $(0,2), (1,1), (2,0)$ (has O, no X) $\\to 1$
  * Central column has X at $(0,1)$, so MAX cannot complete it!
  * Total lines for O = **3**.
* **Lines MIN (X) can still complete** (lines containing no O):
  * Top row: $(0,0), (0,1), (0,2)$ (has X, no O) $\\to 1$
  * Central column has O, diagonal has O, central row has O.
  * Total lines for X = **1**.
* Root Evaluation: $\\mathbf{\\text{Eval}(S_0) = 3 - 1 = +2}$.

#### 2. Candidate Moves for MAX (O) at Depth 1:
MAX has 7 available empty cells:
1. **Corner Moves** (e.g., $(0,0)$):
   * Placing O at $(0,0)$ blocks X's top row!
   * X now has 0 possible lines remaining.
   * O now commands: top-left to bottom-right diagonal, left column $(0,0),(1,0),(2,0)$, and center row.
   * $\\text{Eval} = 4 - 0 = \\mathbf{+4}$.
2. **Edge Moves** (e.g., $(1,0)$):
   * Placing O at $(1,0)$ creates left column threat, but leaves top row open for X.
   * $\\text{Eval} = 3 - 1 = \\mathbf{+2}$.

#### 3. Depth-3 Search & Alpha-Beta Cutoffs:
* MAX explores move to corner $(0,0)$.
* MIN (X) must respond at depth 2. MIN's best defensive move is $(2,2)$ to block O's diagonal.
* At depth 3, O explores follow-up moves, finding guaranteed evaluation $+3$ or $+4$.
* Alpha-Beta sets $\\alpha = 4$. When examining inferior edge branches that yield $\\le 2$, $\\alpha \\ge \\beta$ prunes them immediately.

**Final Answer**: The machine chooses the **corner move $(0,0)$** (or symmetric corner $(0,2)$), maximizing prospective line completions while simultaneously blocking opponent lines.
          `,
          keyTakeaways: [
            'Evaluation counts lines unblocked by opponent pieces.',
            'Initial state Eval = 3 lines (O) - 1 line (X) = +2.',
            'Corner move (0,0) is optimal, blocking X\'s top row and expanding O\'s lines to 4.',
          ],
        },
        {
          id: 'exam-problem-2-nim-matchstick-game',
          title: 'Problem 2: The Game of NIM & Minimax Strategy Analysis',
          slideRef: { lessonId: 'lesson-4', slideNumber: 62, note: 'Proposed Problem #2 NIM' },
          summary:
            'Solving the slide 62 exam exercise: formal rules of NIM, game tree formulation, and complete Minimax tree derivation for situations A (2, 2) and B (3, 2).',
          content: `
### Problem Statement (Slide 62)

> **Rules of NIM**:
> In one move, a player may remove **any number of matches (at least 1)**, but only from a **single row**.
> Players alternate turns.
> **Misère Play (slide version)**: You **WIN** if you leave the **LAST match** for the other player (the player forced to take the last match LOSES).

**Task**: Using Minimax with a complete game tree to terminal states, obtain the optimal strategy starting from:
* **Situation A**: Two rows of 2 matches each: $\\mathbf{(2, 2)}$ (\`|| / ||\`).
* **Situation B**: Row 1 with 3 matches, Row 2 with 2 matches: $\\mathbf{(3, 2)}$ (\`||| / ||\`).

---

### Formal Minimax Analysis:

#### Situation A: Starting State $(2, 2)$
* Player 1 (MAX) can make 3 distinct moves:
  1. Remove 1 match from Row 1 $\\to (1, 2)$
  2. Remove 2 matches from Row 1 $\\to (0, 2)$
  3. (Removing from Row 2 is symmetric).

Let us trace each branch:
* **Branch 1: MAX plays to $(0, 2)$**:
  * MIN faces $(0, 2)$. MIN can remove 1 match, leaving $(0, 1)$!
  * Now MAX faces $(0, 1)$ and is **forced to take the last match**, losing the game!
  * $\\implies \\text{Utility} = \\mathbf{-1}$ for MAX.
* **Branch 2: MAX plays to $(1, 2)$**:
  * MIN faces $(1, 2)$. MIN has options:
    * MIN takes 2 from Row 2 $\\to (1, 0)$. Now MAX is left with 1 match and loses!
    * So MIN will pick $(1, 0)$, forcing MAX to take the last match.
    * $\\implies \\text{Utility} = \\mathbf{-1}$ for MAX.

**Conclusion for Situation A**: State $(2, 2)$ is a **losing position for the first player**! With optimal play, Player 2 (MIN) always wins!

---

#### Situation B: Starting State $(3, 2)$
* Player 1 (MAX) has candidate moves:
  1. Take 1 from Row 1 $\\to (2, 2)$
  2. Take 2 from Row 1 $\\to (1, 2)$
  3. Take 3 from Row 1 $\\to (0, 2)$
  4. Take 1 from Row 2 $\\to (3, 1)$
  5. Take 2 from Row 2 $\\to (3, 0)$

* **Winning Move for MAX**:
  * MAX transitions to state $\\mathbf{(2, 2)}$ by taking 1 match from Row 1!
  * As proven in Situation A, $(2, 2)$ is a guaranteed loss for whoever moves next (which is now MIN)!
  * Whatever MIN does from $(2, 2)$, MAX has a counter-strategy guaranteeing victory:
    * If MIN takes 2 leaving $(2, 0)$, MAX takes 1 leaving $(1, 0)$ $\\implies$ MIN takes the last match and loses!
    * If MIN takes 1 leaving $(2, 1)$, MAX takes 2 leaving $(0, 1)$ $\\implies$ MIN takes the last match and loses!

**Conclusion for Situation B**:
$$\\mathbf{\\text{Optimal Move for MAX: Remove 1 match from Row 1, leaving } (2, 2).}$$
MAX guarantees victory ($+1$) against any opponent play.
          `,
          keyTakeaways: [
            'In misère NIM, the player left with 1 single match loses.',
            'State (2, 2) is a second-player win (terminal utility -1 for first player).',
            'From (3, 2), MAX\'s optimal move is removing 1 match to force MIN into (2, 2).',
          ],
        },
      ],
    },
    {
      id: 'appendix-monte-carlo-tree-search',
      number: 7,
      title: 'Appendix: Monte Carlo Tree Search (MCTS)',
      slideRange: 'Slides 63–67',
      description:
        'When Alpha-Beta becomes impractical, Monte Carlo rollouts, the 4 phases of MCTS, UCT exploration/exploitation formula, Alpha-Beta vs MCTS synthesis, and AlphaZero.',
      sections: [
        {
          id: 'when-alphabeta-fails-and-mc-idea',
          title: 'When Alpha-Beta Fails: The Classical Monte Carlo Idea',
          slideRef: { lessonId: 'lesson-4', slideNumber: 63, note: 'When alpha-beta becomes impractical' },
          summary:
            'Alpha-beta fails when branching factor is massive (Go b=250) or static evaluation functions are unreliable. Monte Carlo estimates position values through fast simulated rollouts.',
          content: `
### Why Does Alpha-Beta Fail in Go? (Slide 63)

Alpha-Beta pruning works brilliantly when two conditions hold:
1. The **branching factor is manageable** ($b \\approx 35$ in chess).
2. A **reliable hand-crafted evaluation function** can accurately score non-terminal positions.

In the game of **Go**:
* The branching factor is massive: **$b \\approx 200 - 250$ legal moves per turn**. The search horizon collapses to only 3–4 plies.
* Static patterns in Go are globally interdependent: a single stone played across the board can radically change the life-or-death status of a group 20 tiles away. Hand-crafted evaluation functions were historically catastrophic failures.

### The Classical Monte Carlo Idea (Slide 63)
If a position cannot be scored with a static formula, how can we estimate its value?
> **Monte Carlo Rollout Principle**:
> Estimate the value of a position by playing many fast simulated random games (**playouts** or **rollouts**) from that position until a terminal result is reached.
> The percentage of simulated games won provides an **unbiased sample estimate** of the position’s true win probability!
          `,
          keyTakeaways: [
            'Go has b ≈ 250 and resists static evaluation functions, defeating Alpha-Beta.',
            'Monte Carlo evaluates positions by simulating complete games (rollouts) to the end.',
            'The fraction of rollout wins estimates the true winning probability.',
          ],
        },
        {
          id: 'four-phases-of-mcts',
          title: 'The Four Phases of MCTS & The UCT Selection Rule',
          slideRef: { lessonId: 'lesson-4', slideNumber: 64, note: 'The four phases of MCTS' },
          summary:
            'MCTS iteratively executes 4 phases: Selection (via UCT balance of exploitation and exploration), Expansion, Simulation (rollout), and Backpropagation.',
          content: `
### The 4 Phases of One MCTS Iteration (Slides 64–66)

Each node $v$ in an MCTS tree stores:
* $N(v)$: Total number of times node $v$ has been visited.
* $Q(v)$: Accumulated total reward / win count obtained through node $v$.

One iteration repeats four distinct phases:
1. **Selection (Slide 64)**:
   Starting at root $S_0$, traverse down the tree by repeatedly choosing the child node that maximizes the **Tree Policy** (typically **UCT**) until reaching a node that has unexpanded children.
2. **Expansion**:
   Choose one unvisited action from the current node and add a new child node to the search tree with initial statistics $N=0, Q=0$.
3. **Simulation (Rollout)**:
   From the newly added node, execute a simulation using a fast default policy (e.g., random moves or lightweight heuristics) until reaching a terminal game state with outcome $R \\in \\{0, 1\\}$.
4. **Backpropagation**:
   Propagate the simulation outcome $R$ up the entire selected trajectory back to the root:
   $$N(v) \\leftarrow N(v) + 1, \\quad Q(v) \\leftarrow Q(v) + R$$

When the computational time or simulation budget is exhausted, the agent chooses the **most visited action ($N(v)$)** at the root!

---

### The UCT Selection Rule (Slide 65)

How should the agent select child nodes during Phase 1?
It faces the fundamental **Multi-Armed Bandit Dilemma**:
* **Exploitation**: Choose moves that have historically scored high win rates.
* **Exploration**: Choose moves that have rarely been tried in case they hide superior tactics.

The definitive solution is **UCT (Upper Confidence Bounds applied to Trees)**:

$$\\mathbf{\\text{UCT}(v) = \\underbrace{\\frac{Q(v)}{N(v)}}_{\\text{Exploitation (Win Rate)}} + \\underbrace{C \\sqrt{\\frac{\\ln N(\\text{parent}(v))}{N(v)}}}_{\\text{Exploration (Uncertainty)}}}$$

* **Exploitation Term**: Observed mean win rate (favors successful moves).
* **Exploration Term**: Increases with parent visits and decreases with node visits (favors rarely visited moves).
* **Constant $C$**: Controls exploration balance ($C = \\sqrt{2}$ in classical UCB1).
* **Asymmetric Search**: MCTS grows deeply along promising tactical variations while remaining shallow along poor lines.
          `,
          keyTakeaways: [
            '4 phases: Selection (UCT), Expansion, Simulation (Rollout), Backpropagation.',
            'UCT formula balances exploitation (win rate Q/N) and exploration (sqrt(ln N_parent / N)).',
            'Search tree grows asymmetrically, focusing compute on promising branches.',
          ],
        },
        {
          id: 'alphabeta-vs-mcts-comparison-and-alphazero',
          title: 'Alpha-Beta vs. MCTS Synthesis & Deep Neural Networks',
          slideRef: { lessonId: 'lesson-4', slideNumber: 67, note: 'MCTS and alpha-beta comparison' },
          summary:
            'Direct comparison between Alpha-Beta and MCTS across 6 core criteria, concluding with AlphaGo and AlphaZero deep neural network policy/value integration.',
          content: `
### Direct Comparison: Alpha-Beta vs. MCTS (Slide 67)

| Dimension | **Alpha-Beta Search** | **Monte Carlo Tree Search (MCTS)** |
|---|---|---|
| **Position Estimate** | Uses static terminal utilities or depth cut-off heuristic $\\text{Eval}(s)$. | Uses sampled rollout outcomes or learned neural value networks. |
| **Search Shape** | Explores uniformly to depth limit $d$, pruned by $(\\alpha, \\beta)$ bounds. | Builds highly **asymmetric trees** concentrated on promising lines. |
| **Stopping Early** | Must complete full depth $d$ (usually via iterative deepening). | **Anytime algorithm**: can halt at any millisecond and return current best. |
| **Theoretical Guarantee** | Exact optimal decision for the searched depth. | Converges asymptotically to minimax optimality as $N \\to \\infty$. |
| **Typical Strength** | Forced tactical lines, chess endgames, strong mathematical heuristics. | Huge branching factors, complex evaluation games (Go). |
| **Typical Weakness** | Suffers combinatorial explosion when $b$ is large. | Blind to narrow tactical traps unless visited by rollouts. |

---

### MCTS with Deep Neural Networks: AlphaGo & AlphaZero (Slide 67)

In 2016–2017, DeepMind unified MCTS with deep reinforcement learning:
* **Policy Network $P(a|s)$**: Replaced uniform random move selection in Phase 1 and Phase 2 with a trained probability prior, focusing search only on the top 3–5 human-level moves.
* **Value Network $V(s)$**: Replaced slow random rollouts in Phase 3 with a direct neural network evaluation estimate $V(s) \\in [-1, +1]$.
* **AlphaZero**: Learned entirely through self-play reinforcement learning from scratch without human opening books, mastering Chess, Shogi, and Go to superhuman levels in under 24 hours.
          `,
          keyTakeaways: [
            'Alpha-Beta uses depth limits and bounds; MCTS builds asymmetric trees using rollouts.',
            'MCTS is an anytime algorithm that converges asymptotically to the optimal action.',
            'AlphaZero merges MCTS with dual policy-value neural networks, eliminating random rollouts.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'ex-l4-1',
      title: 'Exercise 1: Tic-Tac-Toe Depth-3 Alpha-Beta Search',
      slideRef: { lessonId: 'lesson-4', slideNumber: 61, note: 'Proposed Problem #1' },
      problemStatement:
        'Consider the Tic-Tac-Toe game in the following state where it is the turn of MAX (using symbol O): X at (0, 1) and O at (1, 1). Using Minimax with Alpha-Beta pruning to depth 3, determine which move MAX will choose using the evaluation function: Eval(s) = (lines MAX could complete) - (lines MIN could complete), with Win = +1000, Loss = -1000, Tie = 0.',
      formalization: {
        stateSpace: '3x3 grid with cells in {empty, X, O}.',
        initialState: 'O at (1, 1) [center], X at (0, 1) [top-middle].',
        actions: 'Place symbol O in any unoccupied cell: {(0,0), (0,2), (1,0), (1,2), (2,0), (2,1), (2,2)}.',
        goalTest: 'Any 3 matching symbols horizontally, vertically, or diagonally.',
      },
      solutionExplanation:
        '1. In the initial state, O can complete 3 lines (center row, main diagonal, anti-diagonal) and X can complete 1 line (top row), yielding Eval(S_0) = 3 - 1 = +2.\n2. When MAX tests placing O at corner (0,0), this simultaneously blocks X\'s top row (reducing X lines to 0) while opening the left column for O. This yields an immediate evaluation of 4 - 0 = +4.\n3. Tracing Alpha-Beta to depth 3: corner (0,0) establishes an alpha bound of 4. Edge moves (1,0) and (2,1) only achieve evaluation 2, and are pruned or rejected by MAX.\n4. Therefore, MAX chooses corner move (0,0).',
      hasInteractiveTool: true,
      interactiveToolId: 'tictactoe-minimax-simulator',
    },
    {
      id: 'ex-l4-2',
      title: 'Exercise 2: The Game of NIM & Complete Minimax Strategy Tree',
      slideRef: { lessonId: 'lesson-4', slideNumber: 62, note: 'Proposed Problem #2 NIM' },
      problemStatement:
        'In the Game of NIM, players alternate turns removing any number of matches from a single row. Under misère rules, the player who leaves the LAST match for the opponent WINS (taking the last match loses). Using Minimax with a complete game tree, determine the optimal strategy and winning positions starting from: Situation A: (2, 2) and Situation B: (3, 2).',
      formalization: {
        stateSpace: 'Tuples (r1, r2) of remaining matches in each row.',
        initialState: 'Situation A: (2, 2); Situation B: (3, 2).',
        actions: 'Remove k matches from row r where 1 <= k <= r.',
        goalTest: 'Sum of matches == 0 (last match taken loses).',
      },
      solutionExplanation:
        '1. Situation A (2, 2): MAX has two distinct moves: leave (0, 2) or leave (1, 2). If MAX leaves (0, 2), MIN leaves (0, 1) forcing MAX to take the last match. If MAX leaves (1, 2), MIN leaves (1, 0) forcing MAX to take the last match. Thus, state (2, 2) is a guaranteed loss for the first player (Utility = -1).\n2. Situation B (3, 2): MAX can transition to (2, 2) by removing 1 match from Row 1. Since (2, 2) is a guaranteed loss for whoever moves next (now MIN), MAX wins! MAX\'s optimal move is removing 1 match from Row 1 to leave (2, 2).',
      hasInteractiveTool: true,
      interactiveToolId: 'nim-game-simulator',
    },
  ],
};

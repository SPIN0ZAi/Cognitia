import type { LessonData } from '../types/course';

export const LESSON_3_DATA: LessonData = {
  id: 'lesson-3',
  number: 3,
  title: 'Heuristic Search: Informed Search',
  subtitle: 'Domain knowledge, Greedy Best-First, A* search, admissibility & consistency proofs, and heuristic design',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 55,
  overview:
    'Explores how domain-specific knowledge transforms exponential brute-force searches into directed, efficient algorithmic exploration. Covers heuristic functions $h(n)$ derived from relaxed problems, the Greedy Best-First search strategy, and the definitive $A^*$ search algorithm combining actual path cost $g(n)$ and heuristic estimate $h(n)$. Features complete formal mathematical proofs of $A^*$ optimality under admissibility for trees and consistency (monotonicity) for graphs. Analyzes heuristic quality via dominance, the effective branching factor $b^*$, pattern databases, and a unified spectrum of all search algorithms.',
  prerequisites: [
    'Formal search problem formulation and graph search mechanics (Lesson 2)',
    'Priority queues and Dijkstra shortest path algorithm',
    'Mathematical induction and proof techniques',
  ],
  learningObjectives: [
    'Design admissible heuristic functions by formalizing relaxed versions of problems.',
    'Trace Greedy Best-First search and identify why local greediness causes suboptimality and tree-search incompleteness.',
    'Implement and trace $A^*$ search on real-world graphs, maintaining priority queue ordering by $f(n) = g(n) + h(n)$.',
    'Formally prove the theorem: If $h(n)$ is admissible, $A^*$ Tree-Search is guaranteed to be optimal.',
    'Formally prove the theorem: Consistency implies monotonicity of $f(n)$ ($f(n\') \\ge f(n)$) and guarantees $A^*$ Graph-Search optimality without node reopening.',
    'Calculate and evaluate heuristic quality using dominance relations and the Effective Branching Factor $b^*$.',
    'Solve the Pancake Sorting Problem (UCS & $A^*$) and the 8-puzzle greedy search exercise.',
  ],
  chapters: [
    {
      id: 'informed-search-foundations',
      number: 1,
      title: 'Introduction to Informed (Heuristic) Search',
      slideRange: 'Slides 5–11',
      description:
        'The role of problem-specific information, the heuristic function h(n), deriving heuristics from relaxed problems, and the evaluation function f(n).',
      sections: [
        {
          id: 'why-heuristics',
          title: 'The Need for Heuristics: Escaping Blind Search',
          slideRef: { lessonId: 'lesson-3', slideNumber: 6, note: 'Informed search vs uninformed search' },
          summary:
            'Uninformed search only knows if a state is a goal; informed search uses domain knowledge to determine which frontier node is most promising.',
          content: `
### The Inefficiency of Blind Search

In Lesson 2, uninformed search strategies (BFS, UCS, DFS, DLS, IDS) found solutions by expanding nodes blindly and checking them against the goal test. While complete, their computational cost grows exponentially:
* In the 8-puzzle, an exhaustive search would examine approximately $3^{22} \\approx 3.1 \\times 10^{10}$ states to find a 22-step solution!
* In the 15-puzzle, the state space explodes to $10^{13}$ states.

> **Informed (Heuristic) Search Strategies** use **problem-specific information** beyond the bare problem definition to guide the search towards the most promising regions of the state space.

### Spatial Intuition (Slides 7–8)
Imagine navigating a complex maze. Blind search explores every hallway uniformly. An informed agent uses a **compass** or a **straight-line distance vector** to the exit. Even though walls block direct straight-line movement, prioritizing moves that reduce straight-line distance dramatically reduces the number of dead ends explored.
          `,
          keyTakeaways: [
            'Uninformed search expands nodes without knowing how close they are to the goal.',
            'Informed search uses problem-specific knowledge to prioritize the most promising nodes.',
            'Heuristic guidance collapses exponential search spaces into manageable paths.',
          ],
        },
        {
          id: 'heuristic-definition-and-relaxed-problems',
          title: 'The Heuristic Function h(n) & Relaxed Problems',
          slideRef: { lessonId: 'lesson-3', slideNumber: 9, note: 'Heuristic function and relaxed problems' },
          summary:
            'h(n) estimates the cheapest cost from state in n to the goal. Admissible heuristics are systematically derived by relaxing problem constraints.',
          content: `
### Formal Definition of the Heuristic Function (Slide 10)

The information about the problem is formalized in the definition of a **heuristic function**, denoted $h(n)$:

$$h(n) = \\text{estimated cost of the cheapest path from the state in node } n \\text{ to a goal state.}$$

#### The Fundamental Goal Constraint:
$$\\text{If } n \\text{ is a goal node, then } \\mathbf{h(n) = 0.}$$

### Deriving Heuristics from "Relaxed Problems" (Slide 9)
How do AI engineers invent good heuristics? The most powerful general method is **problem relaxation**:
> A problem with fewer restrictions on actions is called a **relaxed problem**.  
> **Theorem**: The cost of an optimal solution to a relaxed problem is an **admissible heuristic** for the original problem.

#### Concrete Examples:
1. **Euclidean Plane Navigation**: In a maze or road network, the physical roads and walls restrict movement. If we *relax* the problem by removing all walls and roads, the shortest distance between two points is simply the **Straight-Line Distance (SLD)**:
   $$h(n) = \\sqrt{(x_n - x_G)^2 + (y_n - y_G)^2}$$
2. **Travel Time**: If cost is time, we relax traffic constraints and divide distance by maximum possible speed:
   $$h(n) = \\frac{\\text{Distance to goal}}{\\text{Max speed}}$$
3. **8-Puzzle Tile Movement**:
   - If we relax the rule that tiles can only slide into the adjacent empty space, and allow any tile to move directly to its destination in 1 move, we get **$h_1$: Misplaced Tiles**.
   - If we relax the rule that tiles cannot pass through other tiles, allowing each tile to slide along the grid lines independently, we get **$h_2$: Manhattan Distance**.
          `,
          keyTakeaways: [
            '$h(n)$ estimates remaining cost to the goal; $h(G) = 0$ for any goal.',
            'Heuristics are mathematically derived by solving relaxed (less constrained) versions of the problem.',
            'Solutions to relaxed problems can never exceed true costs, guaranteeing optimism.',
          ],
        },
        {
          id: 'evaluation-function',
          title: 'The Evaluation Function f(n)',
          slideRef: { lessonId: 'lesson-3', slideNumber: 11, note: 'Evaluation function f(n)' },
          summary:
            'f(n) estimates the total cost of the best solution through n, decomposing into past cost g(n) and future estimate h(n).',
          content: `
### Decomposing Path Cost

In informed search, nodes are selected for expansion based on an **evaluation function** $f(n)$:

$$f(n) = g(n) + h(n)$$

\`\`\`
  [ Start ] ------------ g(n) ------------> [ Node n ] - - - - h(n) - - - -> [ Goal ]
   (Root)          (Known Path Cost)                       (Estimated Cost)
  |__________________________________________________________________________|
                                   f(n)
\`\`\`

* **$g(n)$**: The **real, exact cost** incurred along the path from the root (start state) to current node $n$.
* **$h(n)$**: The **estimated cost** of the cheapest remaining path from node $n$ to the closest goal state.
* **$f(n)$**: The **estimated total cost** of the cheapest complete solution passing through node $n$.

### Unified Algorithmic Framework (Slide 11)
All graph search algorithms share the exact same priority-queue exploration engine as Uniform-Cost Search, differing only in their evaluation function $f(n)$:
* If $f(n) = g(n) \\implies$ **Uniform-Cost Search (UCS)** (pure past cost).
* If $f(n) = h(n) \\implies$ **Greedy Best-First Search** (pure estimated future cost).
* If $f(n) = g(n) + h(n) \\implies$ **$A^*$ Search** (balanced past and future cost).
          `,
          keyTakeaways: [
            '$g(n)$ is historical path cost; $h(n)$ is estimated remaining cost.',
            '$f(n) = g(n) + h(n)$ estimates total path cost through node $n$.',
            'UCS, Greedy, and A* are unified by their choice of evaluation function.',
          ],
        },
      ],
    },
    {
      id: 'greedy-best-first-search',
      number: 2,
      title: 'Greedy Best-First Search',
      slideRange: 'Slides 12–21',
      description:
        'Expanding the node expected to be closest to the goal: f(n) = h(n). Full Romania trace, failure to achieve optimality, and tree-search loop traps.',
      sections: [
        {
          id: 'greedy-mechanics-and-romania-trace',
          title: 'Greedy Best-First Mechanics & Romania Route Trace',
          slideRef: { lessonId: 'lesson-3', slideNumber: 13, note: 'Greedy best-first search on Romania' },
          summary:
            'Expands the frontier node with minimal h(n). Tracing Arad to Bucharest step-by-step illustrates rapid convergence but suboptimal paths.',
          content: `
### How Greedy Best-First Works (Slides 13–20)

* **Evaluation Function**: $f(n) = h(n)$.
* **Fringe Management**: Priority Queue ordered in ascending order of heuristic value $h(n)$.
* **Why "Greedy"?**: At every step, it makes the locally optimal choice that appears closest to the goal, ignoring how much cost was already spent to get there.

---

### Step-by-Step Execution Trace: Arad to Bucharest (Slides 16–20)
Using the straight-line distances to Bucharest:

\`\`\`
Straight-Line Distance Table to Bucharest:
Arad: 366      Sibiu: 253      Fagaras: 176      Pitesti: 100
Zerind: 374    Timisoara: 329  Rimnicu: 193      Bucharest: 0
\`\`\`

1. **Step 0 (Slide 16)**:
   * Frontier: $\\{ \\text{Arad}(h=366) \\}$.
   * Expanded: $\\emptyset$.
2. **Step 1 (Slide 17)**:
   * Extract **Arad** ($h=366$). Expand successors:
     - Zerind ($h=374$)
     - Timisoara ($h=329$)
     - Sibiu ($h=253$)
   * Frontier: $\\{ \\mathbf{\\text{Sibiu}(253)}, \\text{Timisoara}(329), \\text{Zerind}(374) \\}$.
3. **Step 2 (Slide 18)**:
   * Extract **Sibiu** ($h=253$) — lowest $h$. Expand successors:
     - Arad ($h=366$)
     - Oradea ($h=380$)
     - Fagaras ($h=176$)
     - Rimnicu Vilcea ($h=193$)
   * Frontier: $\\{ \\mathbf{\\text{Fagaras}(176)}, \\text{Rimnicu}(193), \\text{Timisoara}(329), \\dots \\}$.
4. **Step 3 (Slide 19)**:
   * Extract **Fagaras** ($h=176$) — lowest $h$. Expand successors:
     - Sibiu ($h=253$)
     - Bucharest ($h=0$)
   * Frontier: $\\{ \\mathbf{\\text{Bucharest}(0)}, \\text{Rimnicu}(193), \\dots \\}$.
5. **Step 4 (Slide 20)**:
   * Extract **Bucharest** ($h=0$). Goal test succeeds! Search terminates.

### Solution Found:
$$\\text{Arad} \\xrightarrow{140} \\text{Sibiu} \\xrightarrow{99} \\text{Fagaras} \\xrightarrow{211} \\text{Bucharest}$$
$$\\text{Total Road Cost} = 140 + 99 + 211 = \\mathbf{450\\text{ km}}$$
          `,
          keyTakeaways: [
            'Greedy search reaches Bucharest in only 3 expansions (Arad $\\to$ Sibiu $\\to$ Fagaras $\\to$ Bucharest).',
            'Solution path cost is 450 km.',
            'Greedy prioritizes Fagaras ($h=176$) over Rimnicu Vilcea ($h=193$), completely missing the cheaper route via Pitesti!',
          ],
        },
        {
          id: 'greedy-properties-and-flaws',
          title: 'Properties & Fatal Flaws of Greedy Best-First',
          slideRef: { lessonId: 'lesson-3', slideNumber: 21, note: 'Greedy best-first properties and summary' },
          summary:
            'Greedy best-first is NOT optimal, and its tree-search version is NOT complete because it can become trapped in infinite loops.',
          content: `
### Critical Property Analysis (Slide 21)

| Property | Tree-Search Version | Graph-Search Version |
|---|---|---|
| **Complete?** | **NO** (Can become trapped in infinite loops) | **YES** (On finite state spaces with visited state checking) |
| **Optimal?** | **NO** | **NO** |
| **Time Complexity** | $O(b^m)$ (where $m$ is max depth) | $O(b^m)$ (vastly reduced with good $h$) |
| **Space Complexity** | $O(b^m)$ (keeps all nodes in memory) | $O(b^m)$ |

### Why is Tree Greedy Not Complete? (The Loop Trap)
Consider searching from **Iasi** to **Fagaras**:
* From Iasi, the successor **Neamt** has a lower straight-line distance than other options.
* From Neamt, the only neighbor is Iasi.
* Because Tree-Search does not keep an explored list, the algorithm endlessly oscillates:
  $$\\text{Iasi} \\to \\text{Neamt} \\to \\text{Iasi} \\to \\text{Neamt} \\to \\dots$$
  The search enters an infinite loop and never reaches Fagaras!

### Why is Greedy Suboptimal?
As proven in our trace, Greedy chose the 450 km path via Fagaras because Fagaras looked closer to Bucharest in a straight line ($h=176$ vs Rimnicu's $193$). It ignored the high edge cost ($211$ km from Fagaras to Bucharest), missing the optimal path via Rimnicu Vilcea and Pitesti (**418 km**).
          `,
          keyTakeaways: [
            'Greedy tree-search is incomplete due to potential infinite loops (e.g., Iasi $\\leftrightarrow$ Neamt).',
            'Greedy search is non-optimal because it ignores accumulated path cost $g(n)$.',
            'Time and space complexity are $O(b^m)$ in the worst case.',
          ],
        },
      ],
    },
    {
      id: 'astar-search-algorithm',
      number: 3,
      title: 'A* Search: Algorithm, Optimality, and Admissibility Proof',
      slideRange: 'Slides 22–44',
      description:
        'f(n) = g(n) + h(n), complete Romania execution trace, admissibility definition, formal mathematical proof of tree optimality, consistency/monotonicity proof, and node reopening in graph search.',
      sections: [
        {
          id: 'astar-mechanics-and-romania-trace',
          title: 'A* Mechanics & Complete Romania Route Trace',
          slideRef: { lessonId: 'lesson-3', slideNumber: 27, note: 'A* search execution on Romania' },
          summary:
            'A* evaluates nodes by f(n) = g(n) + h(n). Detailed numerical trace demonstrating how A* finds the optimal 418 km path.',
          content: `
### The A* Evaluation Strategy

$A^*$ avoids the blind exploration of UCS and the short-sighted errors of Greedy by balancing both:
$$f(n) = g(n) + h(n)$$

---

### Step-by-Step Execution Trace: Arad to Bucharest (Slides 27–33)

1. **Step 0 (Slide 27)**:
   * Frontier: $\\{ \\text{Arad}: g=0, h=366 \\implies \\mathbf{f = 366} \\}$.
2. **Step 1 (Slide 28)**:
   * Expand **Arad** ($f=366$):
     - Zerind: $g=75, h=374 \\implies f = 449$
     - Timisoara: $g=118, h=329 \\implies f = 447$
     - Sibiu: $g=140, h=253 \\implies \\mathbf{f = 393}$
   * Frontier: $\\{ \\mathbf{\\text{Sibiu}(393)}, \\text{Timisoara}(447), \\text{Zerind}(449) \\}$.
   * *Decision: Extract Sibiu (lowest $f$).*
3. **Step 2 (Slide 29)**:
   * Expand **Sibiu** ($f=393$):
     - Arad: $g=140+140=280, h=366 \\implies f = 646$
     - Oradea: $g=140+151=291, h=380 \\implies f = 671$
     - Fagaras: $g=140+99=239, h=176 \\implies f = 415$
     - Rimnicu Vilcea: $g=140+80=220, h=193 \\implies \\mathbf{f = 413}$
   * Frontier: $\\{ \\mathbf{\\text{Rimnicu}(413)}, \\text{Fagaras}(415), \\text{Timisoara}(447), \\text{Zerind}(449), \\dots \\}$.
   * *Decision: Extract Rimnicu Vilcea ($f=413 < 415$)! Notice how $A^*$ favors Rimnicu over Fagaras!*
4. **Step 3 (Slide 30)**:
   * Expand **Rimnicu Vilcea** ($f=413$):
     - Craiova: $g=220+146=366, h=160 \\implies f = 526$
     - Sibiu: $g=220+80=300, h=253 \\implies f = 553$
     - Pitesti: $g=220+97=317, h=100 \\implies \\mathbf{f = 417}$
   * Frontier: $\\{ \\mathbf{\\text{Fagaras}(415)}, \\text{Pitesti}(417), \\text{Timisoara}(447), \\dots \\}$.
   * *Decision: Extract Fagaras ($f=415 < 417$).*
5. **Step 4 (Slide 31)**:
   * Expand **Fagaras** ($f=415$):
     - Sibiu: $g=239+99=338, h=253 \\implies f = 591$
     - Bucharest: $g=239+211=450, h=0 \\implies \\mathbf{f = 450}$
   * Frontier: $\\{ \\mathbf{\\text{Pitesti}(417)}, \\text{Timisoara}(447), \\text{Bucharest}_{\\text{Fagaras}}(450), \\dots \\}$.
   * **Crucial Moment**: A goal node (Bucharest via Fagaras, $f=450$) is now in the frontier! But $A^*$ does NOT stop, because Pitesti has a lower estimated cost ($f=417 < 450$)!
6. **Step 5 (Slide 32)**:
   * Expand **Pitesti** ($f=417$):
     - Bucharest: $g=317+101=418, h=0 \\implies \\mathbf{f = 418}$
     - Craiova: $g=317+138=455, h=160 \\implies f = 615$
     - Rimnicu: $g=317+97=414, h=193 \\implies f = 607$
   * Frontier: $\\{ \\mathbf{\\text{Bucharest}_{\\text{Pitesti}}(418)}, \\text{Timisoara}(447), \\text{Bucharest}_{\\text{Fagaras}}(450), \\dots \\}$.
7. **Step 6 (Slide 33)**:
   * Extract **Bucharest** ($f=418$). Goal test succeeds! Search halts.

### Optimal Solution:
$$\\text{Arad} \\xrightarrow{140} \\text{Sibiu} \\xrightarrow{80} \\text{Rimnicu Vilcea} \\xrightarrow{97} \\text{Pitesti} \\xrightarrow{101} \\text{Bucharest}$$
$$\\text{Optimal Cost } C^* = \\mathbf{418\\text{ km}}$$
          `,
          keyTakeaways: [
            'A* expands nodes in order of increasing $f(n) = g(n) + h(n)$.',
            'A* does NOT terminate when a goal is added to the frontier; it terminates ONLY when a goal is extracted.',
            'A* successfully avoids the 450 km trap, discovering the true optimal 418 km path.',
          ],
        },
        {
          id: 'admissibility-and-proof-of-optimality',
          title: 'Admissibility & Formal Proof of A* Tree Optimality',
          slideRef: { lessonId: 'lesson-3', slideNumber: 36, note: 'Admissibility definition and Theorem proof' },
          summary:
            'A heuristic is admissible if it never overestimates the true cost. Complete mathematical proof that A* Tree-Search is optimal.',
          content: `
### Definition of Admissibility (Slide 36)

Let $h^*(n)$ be the true, actual minimal cost to reach the closest goal from node $n$:
> A heuristic function $h(n)$ is **admissible** if and only if:
> $$\\forall n, \\quad \\mathbf{h(n) \\le h^*(n)}$$

An admissible heuristic is **optimistic**: it always thinks the goal is closer or cheaper than it actually is.
* Because $g(n)$ is the exact cost to reach $n$, a direct consequence is:
  $$f(n) = g(n) + h(n) \\le g(n) + h^*(n) = \\text{true cost of optimal path through } n.$$
  Therefore, **$f(n)$ never overestimates the true cost of a solution along the path through $n$**.

---

### Theorem: Optimality of A* Tree-Search (Slide 37)
> **Theorem**: If $h(n)$ is admissible, then the **Tree-Search** version of $A^*$ is **guaranteed to be optimal**.

#### Formal Mathematical Proof:
1. Let $G$ be an optimal goal node with path cost $g(G) = C^*$.
2. Let $G_{SO}$ be a suboptimal goal node generated during the search, such that $g(G_{SO}) > C^*$.
3. Because both $G$ and $G_{SO}$ are goal nodes, by definition of heuristic functions:
   $$h(G) = 0 \\quad \\text{and} \\quad h(G_{SO}) = 0$$
4. Therefore, their evaluation functions equal their path costs:
   $$f(G_{SO}) = g(G_{SO}) + h(G_{SO}) = g(G_{SO}) > C^*$$
5. Now consider any unexpanded node $n$ on the frontier that lies on the optimal path from the root to optimal goal $G$.
6. By admissibility of $h$, $h(n) \\le h^*(n)$. Therefore:
   $$f(n) = g(n) + h(n) \\le g(n) + h^*(n) = C^*$$
7. Combining our inequalities:
   $$f(n) \\le C^* < f(G_{SO}) \\implies \\mathbf{f(n) < f(G_{SO})}$$
8. Because $A^*$ always extracts the node with the **minimum** $f$-value from the frontier, node $n$ will strictly be selected for expansion before $G_{SO}$.
9. This holds for every intermediate node along the path to $G$, and finally for optimal goal $G$ itself (where $f(G) = C^* < f(G_{SO})$).
10. Therefore, optimal goal $G$ will be selected and returned before $G_{SO}$ can ever be extracted. $\\blacksquare$
          `,
          keyTakeaways: [
            'Admissibility means $h(n) \\le h^*(n)$ (never overestimates).',
            'Suboptimal goals have $f(G_{SO}) > C^*$.',
            'Nodes on the path to the optimal goal have $f(n) \\le C^* < f(G_{SO})$, guaranteeing they are expanded first.',
          ],
        },
        {
          id: 'consistency-and-monotonicity',
          title: 'Consistency (Monotonicity) & The Triangle Inequality',
          slideRef: { lessonId: 'lesson-3', slideNumber: 39, note: 'Consistency definition and proof' },
          summary:
            'A heuristic is consistent if h(n) <= c(n, a, n\') + h(n\'). Proof that consistency makes f(n) non-decreasing and guarantees graph optimality without reopening.',
          content: `
### Definition of Consistency / Monotonicity (Slide 39 & Standalone Proof Slide)

Admissibility guarantees optimality for Tree-Search. But does admissibility guarantee optimality for **Graph-Search**? **NO!** In Graph-Search, once a state is placed in the explored set, standard graph search never expands it again. If an admissible heuristic causes an suboptimal path to reach a state first, it could be closed with a suboptimal cost.

To guarantee optimality in Graph-Search without reopening closed states, the heuristic must satisfy **Consistency** (also known as **Monotonicity**):

> A heuristic $h(n)$ is **consistent** if, for every node $n$ and every successor $n'$ generated by any action $a$:
> $$\\mathbf{h(n) \\le c(n, a, n\') + h(n\')}$$
> where $c(n, a, n')$ is the step cost of transitioning from $n$ to $n'$.

This is the geometric **Triangle Inequality**: the estimated cost from $n$ directly to the goal can never exceed the cost of stepping to $n'$ plus the estimated cost from $n'$ to the goal.

\`\`\`
            n
           / \\
c(n, a, n')   \\  h(n)
         /     \\
        v       v
       n' ----> Goal
          h(n')
\`\`\`

---

### Mathematical Proof: Consistency Implies Non-Decreasing $f(n)$
Let's develop the formal derivation from Slide 1:
1. By definition: $f(n') = g(n') + h(n')$.
2. Since $g(n') = g(n) + c(n, a, n')$, substituting yields:
   $$f(n') = g(n) + c(n, a, n') + h(n')$$
3. By consistency, $c(n, a, n') + h(n') \\ge h(n)$. Adding $g(n)$ to both sides:
   $$g(n) + c(n, a, n') + h(n') \\ge g(n) + h(n)$$
4. Recognizing that the left side is $f(n')$ and the right side is $f(n)$:
   $$\\mathbf{f(n\') \\ge f(n)}$$

> **Conclusion**: If $h$ is consistent, the evaluation function $f(n)$ is **monotonically non-decreasing along any path**.

### Fundamental Theorems:
1. **Consistency Implies Admissibility**: Every consistent heuristic is automatically admissible. (The converse is not always true).
2. **Optimality of A* Graph-Search**: If $h(n)$ is consistent, the Graph-Search version of $A^*$ is **optimal** without needing to reopen closed nodes.
          `,
          keyTakeaways: [
            'Consistency satisfies the triangle inequality: $h(n) \\le c(n, a, n\') + h(n\')$.',
            'If $h$ is consistent, $f(n\') \\ge f(n)$ (non-decreasing along any path).',
            'Consistency guarantees that the first time a state is expanded in graph search, its path is already optimal.',
          ],
        },
        {
          id: 'contours-and-node-reopening',
          title: 'Search Contours & A* with Node Reopening',
          slideRef: { lessonId: 'lesson-3', slideNumber: 40, note: 'Contours in state space and node reopening rule' },
          summary:
            'Concentric circles of UCS vs directed ellipses of A*. When h is admissible but inconsistent, graph search requires the node reopening rule.',
          content: `
### Contours in the State Space (Slides 40–41)
Because $f(n)$ is non-decreasing along any path, we can visualize the search frontier as expanding **isocost contours**:
* **Uniform-Cost Search**: Contours are **concentric circles** centered around the start state ($g = 80, 120, 180$). UCS expands in all directions equally.
* **$A^*$ Search**: Contours are **deformed ellipses / directed bands** stretched towards the goal. $A^*$ only expands nodes inside contours where $f(n) \\le C^*$, pruning all states outside the optimal band!

---

### A* Graph Search with Node Reopening (Slides 43–44)

What if an engineer designs a heuristic that is **admissible but NOT consistent**?
In standard graph search (Lesson 2), once a state enters \`explored\`, it is discarded if generated again. But with an inconsistent heuristic, a cheaper path to an already-closed state might be discovered later!

#### The Reopening Rule (Slide 43):
The explored set stores the best path cost found so far for every state: $g_{\\text{best}}(s)$.
When a successor $n'$ with state $s'$ is generated:
1. Compute $g_{\\text{new}} = g(n) + c(n, a, n')$.
2. If $g_{\\text{new}} \\ge g_{\\text{best}}(s')$, discard the new path.
3. If $g_{\\text{new}} < g_{\\text{best}}(s')$:
   - Update its parent pointer and recorded cost.
   - If $s'$ was already in the explored set (closed), **remove it from explored and re-insert it into the frontier queue!** (Reopening the node).

#### Theorem on Reopening:
On finite graphs with non-negative action costs, **node reopening makes an admissible heuristic sufficient for optimality**. Consistency is still preferable because it eliminates the runtime overhead of repeated node expansions.
          `,
          keyTakeaways: [
            'UCS expands concentric circular contours; A* expands directed elliptical contours toward the goal.',
            'Admissible but inconsistent heuristics can reach states first via suboptimal paths.',
            'Node reopening restores optimality by moving closed states back to the open frontier when cheaper paths are found.',
          ],
        },
      ],
    },
    {
      id: 'heuristic-functions-and-8puzzle',
      number: 4,
      title: 'Heuristic Functions, Dominance & 8-Puzzle Analysis',
      slideRange: 'Slides 45–55',
      description:
        '8-puzzle heuristics h1 and h2, dominance relations, Effective Branching Factor b*, pattern databases, and the unified taxonomy of search.',
      sections: [
        {
          id: 'eight-puzzle-heuristics-and-dominance',
          title: '8-Puzzle Heuristics & The Concept of Dominance',
          slideRef: { lessonId: 'lesson-3', slideNumber: 46, note: 'Heuristics in 8-puzzle: h1 vs h2 and dominance' },
          summary:
            'Comparing h1 (misplaced tiles) and h2 (Manhattan distance). h2 dominates h1, guaranteeing fewer node expansions.',
          content: `
### Two Standard Heuristics for the 8-Puzzle (Slide 46)

Consider a sample board:
\`\`\`
Sample State:           Goal State:
[ 7  2  4 ]             [ 1  2  3 ]
[ 5  _  6 ]     --->    [ 4  5  6 ]
[ 8  3  1 ]             [ 7  8  _ ]
\`\`\`

#### 1. $h_1$ (Number of Misplaced Tiles):
Counts how many numbered tiles are not in their target goal position (excluding the blank):
* Tiles out of place: 7, 4, 5, 8, 3, 1 (total 6 tiles) $\\implies \\mathbf{h_1 = 7}$ (in slide example configuration).
* **Admissibility**: Every misplaced tile must be moved at least once. Therefore $h_1(n) \\le h^*(n)$.

#### 2. $h_2$ (Sum of Manhattan Distances):
Computes the sum of horizontal and vertical grid moves required for each numbered tile to reach its target position:
$$h_2(n) = \\sum_{i=1}^8 \\left( |x_i - x_i^*| + |y_i - y_i^*| \\right)$$
* In slide example: $h_2 = 4 + 0 + 3 + 3 + 1 + 1 + 2 + 1 = \\mathbf{15}$.
* **Admissibility**: In the true puzzle, tiles block each other. Manhattan distance assumes each tile can slide freely through others. Since relaxing collisions can only decrease moves, $h_2(n) \\le h^*(n)$.

---

### Dominance Among Heuristics (Slide 49)
> If $h_1$ and $h_2$ are both admissible, and for all nodes $n$:
> $$\\mathbf{h_2(n) \\ge h_1(n)}$$
> then **$h_2$ dominates $h_1$**, and $h_2$ is said to be **more informed** than $h_1$.

#### Consequence of Dominance:
* Every node expanded by $A^*(h_2)$ will also be expanded by $A^*(h_1)$.
* However, $A^*(h_1)$ will expand additional nodes that $A^*(h_2)$ prunes!
* *Trade-off*: Although calculating $h_2$ takes slightly more CPU clock cycles per node than $h_1$, the massive reduction in total node expansions overwhelmingly compensates for it.
          `,
          keyTakeaways: [
            '$h_1$ counts misplaced tiles; $h_2$ sums Manhattan distances.',
            'Both $h_1$ and $h_2$ are admissible.',
            '$h_2$ dominates $h_1$ ($h_2(n) \\ge h_1(n)$), expanding strictly fewer nodes.',
          ],
        },
        {
          id: 'effective-branching-factor',
          title: 'The Effective Branching Factor (b*) & Benchmark Data',
          slideRef: { lessonId: 'lesson-3', slideNumber: 48, note: 'Effective branching factor b* and benchmark table' },
          summary:
            'b* quantifies heuristic quality. A well-designed heuristic achieves b* close to 1. Benchmark comparison across depths 2, 12, and 24.',
          content: `
### Measuring Heuristic Quality: $b^*$ (Slide 48)

How do we scientifically quantify how "good" a heuristic is? We compute its **Effective Branching Factor** $b^*$.
If an algorithm generates a total of $N$ nodes to find a solution at depth $d$, then $b^*$ is the branching factor that a uniform tree of depth $d$ would require to contain $N+1$ nodes:

$$N + 1 = 1 + b^* + (b^*)^2 + (b^*)^3 + \\dots + (b^*)^d$$

* **Ideal Target**: A perfect heuristic that explores directly to the goal with zero backtracking has $\\mathbf{b^* = 1}$.
* Experimental measurements show $b^*$ is fairly constant across difficult instances of a problem, making it an excellent benchmark metric.

---

### Empirical Benchmark Table from UCLM Lectures (Slide 48):

| Depth $d$ | IDS Nodes ($N$) | $A^*(h_1)$ Nodes ($N$) | $A^*(h_2)$ Nodes ($N$) | IDS $b^*$ | $A^*(h_1)$ $b^*$ | $A^*(h_2)$ $b^*$ |
|---|---|---|---|---|---|---|
| **$d = 2$** | 10 | 6 | 6 | 2.45 | 1.69 | 1.79 |
| **$d = 12$** | 3,644,035 | 227 | 73 | 2.78 | 1.42 | **1.24** |
| **$d = 24$** | *(Memory/Time Out)* | 39,135 | **1,641** | — | 1.48 | **1.26** |

Notice the staggering real-world difference at depth 24:
* Uninformed Iterative Deepening completely fails.
* $A^*(h_1)$ generates 39,135 nodes.
* $A^*(h_2)$ generates only **1,641 nodes** — a **24-fold speedup** purely from using a dominating heuristic!
          `,
          keyTakeaways: [
            '$b^*$ is solved via polynomial: $N + 1 = 1 + b^* + \\dots + (b^*)^d$.',
            'A perfect heuristic achieves $b^* = 1$.',
            'At depth 24, $h_2$ reduces generated nodes from 39,135 down to 1,641.',
          ],
        },
        {
          id: 'pattern-databases-and-taxonomy',
          title: 'Pattern Databases & Unified Taxonomy of Search',
          slideRef: { lessonId: 'lesson-3', slideNumber: 50, note: 'Pattern databases and unified search table' },
          summary:
            'Pattern databases store exact subproblem solutions. All search algorithms unify under generalized best-first search.',
          content: `
### Pattern Databases (Slide 50)

Can we construct heuristics that are even more informed than Manhattan distance? Yes, through **Pattern Databases**:
1. Partition the problem into sub-problems (patterns). For example, in the 8-puzzle, consider only tiles $\\{1, 2, 3, 4\\}$ while treating other tiles as wildcards ($*$).
2. Run reverse BFS from the goal state offline to compute and store the **exact shortest distance** to assemble those 4 tiles for every board configuration.
3. At search time, look up the stored cost in $O(1)$ time:
   $$h_1^{(4)} = 3, \\quad h_2^{(4)} = 10$$
4. In the 15-puzzle, combining disjoint pattern databases reduces the number of generated nodes by a **factor of 1,000**!

---

### The Grand Unified Taxonomy of Search (Slide 52)
The defining insight of modern state space search is that **every search algorithm studied in this course is an instance of Generalized Best-First Search**, differing solely in how it evaluates frontier priority:

| Algorithm | Evaluation Formula $f(n)$ | Theoretical Characteristic |
|---|---|---|
| **Breadth-First Search (BFS)** | $f(n) = \\text{depth}(n)$ | Shallowest level first |
| **Depth-First Search (DFS)** | $f(n) = -\\text{depth}(n)$ (inverse depth) | Deepest branch first |
| **Uniform-Cost Search (UCS)** | $f(n) = g(n)$ | Cheapest accumulated path first |
| **Greedy Best-First** | $f(n) = h(n)$ | Smallest estimated future distance first |
| **$A^*$ Search** | $f(n) = g(n) + h(n)$ | Balanced past cost and future estimate |
          `,
          keyTakeaways: [
            'Pattern databases store exact solution costs for abstracted sub-problems.',
            'BFS, DFS, UCS, Greedy, and A* are all instances of Best-First Search.',
            'The choice of $f(n)$ dictates the exploration behavior of the agent.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'ex-l3-1',
      title: 'Exercise 1: The Pancake Sorting Problem',
      slideRef: { lessonId: 'lesson-3', slideNumber: 54, note: 'Proposed exercises: pancake problem' },
      problemStatement:
        'A chef has a stack of numbered pancakes. A spatula is inserted under the $k$-th pancake from the top ($k \\in \\{1, 2, 3\\}$) to flip all pancakes above it. The cost of each flip is the number of flipped pancakes ($k+1$). Initial stack is $(2, 1, 4, 3)$ (with 2 at bottom, 3 on top). Goal is $(4, 3, 2, 1)$ (largest base at bottom). (a) Solve using Uniform-Cost Search. (b) Design an admissible heuristic and solve using $A^*$. (Tie-break: choose the more recently created node).',
      formalization: {
        stateSpace: 'Permutations of $(p_1, p_2, p_3, p_4) \\in S_4$. Total $4! = 24$ states.',
        initialState: '$(2, 1, 4, 3)$ (where 2 is index 1/bottom, 3 is index 4/top)',
        actions:
          'Flip from pos 1 (cost 4, reverses all 4); Flip from pos 2 (cost 3, reverses top 3); Flip from pos 3 (cost 2, reverses top 2).',
        goalTest: '$(4, 3, 2, 1)$',
        pathCost: 'Sum of flipped pancake counts.',
      },
      solutionExplanation:
        'Applying flip actions from initial state $(2, 1, 4, 3)$:\n- Flip pos 3 (reverses top 2: 4 and 3) $\\to (2, 1, 3, 4)$, step cost 2.\n- Flip pos 2 (reverses top 3: 1, 4, 3) $\\to (2, 3, 4, 1)$, step cost 3.\n- Flip pos 1 (reverses all 4) $\\to (3, 4, 1, 2)$, step cost 4.\n\nDesigning an Admissible Heuristic $h(n)$:\nLet $h(n)$ be the size of the largest pancake that is currently out of place (or number of adjacent non-consecutive pancake pairs). Since fixing an out-of-order pancake requires at least one flip that includes it, $h(n)$ never overestimates true flipping cost.\nWith $A^*$, the optimal path is found by first flipping pos 1 to reverse all 4 pancakes $\\to (3, 4, 1, 2)$ ($g=4$), then flipping pos 2 $\\to (3, 2, 1, 4)$ ($g=7$), and finally flipping pos 1 $\\to (4, 3, 2, 1)$ ($g=11$). Total optimal cost is 11.',
      hasInteractiveTool: true,
      interactiveToolId: 'pancake-simulator',
    },
    {
      id: 'ex-l3-2',
      title: 'Exercise 2: 8-Puzzle Greedy Best-First Trace',
      slideRef: { lessonId: 'lesson-3', slideNumber: 55, note: 'Proposed exercises: 8-puzzle greedy search' },
      problemStatement:
        'Solve the 8-puzzle by Greedy Best-First search from Initial state: [2 8 3; _ 1 4; 7 6 5] to Goal state: [1 2 3; 8 _ 4; 7 6 5]. Cost $g(n) = 1$ per edge. Heuristic $h(n) = h_1(n)$ (number of wrongly located tiles, INCLUDING the gap). Operator evaluation order: Up, Down, Left, Right. Tie-breaking rule: select the older node (FIFO in ties).',
      formalization: {
        initialState: '[2, 8, 3; _, 1, 4; 7, 6, 5]',
        goalTest: '[1, 2, 3; 8, _, 4; 7, 6, 5]',
        actions: 'Up, Down, Left, Right movement of the gap',
      },
      solutionExplanation:
        'Step-by-step evaluation:\n1. Initial state $S_0$: Tiles out of place compared to goal: tile 2 is in pos 1 (goal 2), 8 is in pos 2 (goal 4), 1 is in pos 5 (goal 1), gap is in pos 4 (goal 5). Total wrongly located tiles including gap: $\\mathbf{h_1(S_0) = 4}$.\n2. Operators applied to blank in order {Up, Down, Left, Right}:\n   - Up (blank moves to pos 1, swaps with 2): [ _ 8 3; 2 1 4; 7 6 5]. Wrong tiles: gap, 8, 2, 1 $\\implies h_1 = 4$.\n   - Down (blank moves to pos 7, swaps with 7): [2 8 3; 7 1 4; _ 6 5]. Wrong tiles: 2, 8, 7, 1, gap $\\implies h_1 = 5$.\n   - Right (blank moves to pos 5, swaps with 1): [2 8 3; 1 _ 4; 7 6 5]. Wrong tiles: 2, 8, 1 (gap is now in goal pos 5!) $\\implies \\mathbf{h_1 = 3}$.\n3. The lowest $h_1$ node is Right ($h_1 = 3$). Expand [2 8 3; 1 _ 4; 7 6 5]:\n   - Up (blank swaps with 8): [2 _ 3; 1 8 4; 7 6 5]. Wrong tiles: 2, gap, 1, 8 $\\implies h_1 = 4$.\n   - Left (blank swaps with 1): returns to initial state $\\implies h_1 = 4$.\n   - Down (blank swaps with 6): [2 8 3; 1 6 4; 7 _ 5] $\\implies h_1 = 4$.\n   - Right (blank swaps with 4): [2 8 3; 1 4 _; 7 6 5] $\\implies h_1 = 4$.\n4. All children tie at $h_1 = 4$. Tie-breaking selects the older node from the frontier. Continuing this systematic priority queue trace leads directly to the goal state [1 2 3; 8 _ 4; 7 6 5]!',
      hasInteractiveTool: true,
      interactiveToolId: 'eight-puzzle-exercise2',
    },
  ],
};

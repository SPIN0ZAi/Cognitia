import type { LessonData } from '../types/course';

export const LESSON_7_DATA: LessonData = {
  id: 'lesson-7',
  number: 7,
  title: 'Local Search & Hill-Climbing Variants',
  subtitle:
    'Trajectory-based optimization, neighborhood structures, landscape pathologies, and escaping local optima via RLS, ILS, VNS, and Simulated Annealing',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 62,
  overview:
    'Covers trajectory-based local search algorithms that navigate vast configuration spaces with O(1) memory overhead. Formalizes neighborhood operators N(x) across discrete representations (1-bit flips in Knapsack, 2-opt and node swaps in TSP, recoloring in Graph Coloring). Details the fundamental Hill-Climbing algorithm for maximization and minimization, and dissects its three critical pathologies: local optima, flat plateaus (with capped sideways moves), and diagonal ridges. Explores non-deterministic and stochastic variants, and establishes the four canonical metaheuristic escape strategies: Randomized Local Search (RLS / Random Restarts), Iterated Local Search (ILS with perturbation), Variable Neighbourhood Search (VNS with progressive neighborhood structures), and Simulated Annealing (Metropolis acceptance criterion and geometric cooling). Concludes with full step-by-step traces of official UCLM proposed exam problems on Knapsack and Two-Processor Workload Balancing.',
  prerequisites: [
    'Combinatorial Optimization problem formulation (Lesson 6)',
    'Representation, Evaluation Function, and Optimization Criterion (Lesson 6)',
    'Discrete mathematics and basic probability theory',
  ],
  learningObjectives: [
    'Explain why trajectory-based local search requires minimal O(1) memory compared to tree search.',
    'Formulate neighborhood operators N(x) and compute their exact sizes for binary strings, permutations, and discrete color vectors.',
    'Trace the Hill-Climbing algorithm step by step under steepest ascent and first improvement rules.',
    'Diagnose the three fundamental pathologies of Hill Climbing: local optima, plateaus, and ridges, explaining why greedy single-step lookahead fails on each.',
    'Implement and trace Stochastic Hill Climbing with parameter q governing the exploration/exploitation trade-off.',
    'Formulate the four metaheuristic escape strategies: RLS, ILS, VNS, and Simulated Annealing.',
    'Apply the Metropolis acceptance criterion P(accept) = exp(-Δ / T) for worsening moves and analyze the geometric cooling schedule T ← αT.',
    'Solve official UCLM exam problems: 0/1 Knapsack HC formulation (Slide 61) and Two-Processor Balancing VNS escape (Slide 62).',
  ],
  chapters: [
    {
      id: 'trajectory-search-and-neighborhoods',
      number: 1,
      title: 'Introduction & Neighbourhood Structures',
      slideRange: 'Slides 1–10',
      description:
        'Trajectory-based search mechanics, low memory requirements, formal definition of neighborhood N(x), and operator design for TSP, Knapsack, and Graph Coloring.',
      sections: [
        {
          id: 'trajectory-search-concept',
          title: 'Trajectory-Based Search & O(1) Memory',
          slideRef: { lessonId: 'lesson-7', slideNumber: '4–5' },
          summary: 'Local search evolves a single configuration trajectory with constant memory requirements.',
          content: `### Trajectory-Based Search

Trajectory-based search algorithms evolve a single trajectory of search points across iterations:
$$\\{x_0, x_1, x_2, \\dots, x_k\\}$$

The algorithm performs a local analysis of the search space, evaluating the current environment of configuration $x$ to decide where to transition next.

#### Why Local Search?
- **Extreme Memory Efficiency**: While tree search algorithms ($A^*$, BFS, Branch & Bound) require storing an exponential frontier or open list in memory ($O(b^d)$), local search operates with **$O(1)$ memory**. It only stores the current configuration $x$ and the best-so-far solution $x^*$.
- **Applicability**: Ideal for large combinatorial optimization problems where finding the optimal configuration is required, but the sequence of steps to reach it is irrelevant.`,
          keyTakeaways: [
            'Evolves a single candidate configuration through successive transitions.',
            'Requires minimal O(1) memory, maintaining only the current state and best solution.',
            'Directly suited for pure configuration spaces where path history is irrelevant.',
          ],
        },
        {
          id: 'neighborhood-operators',
          title: 'The Neighbourhood Structure N(x) and Operator Sizing',
          slideRef: { lessonId: 'lesson-7', slideNumber: '6–10' },
          summary: 'Formal definition of N(x) and operator sizing for TSP 2-opt, bit-flips, and graph coloring.',
          content: `### Formal Definition of Neighbourhood (Slide 7)

Given a problem representation space $S$ and a **neighbourhood operator** $op$, the neighbourhood of a configuration $x \\in S$, denoted $N(x)$, is:
$$N(x) = \\{x' \\in S \\mid x' \\text{ can be reached from } x \\text{ by applying } op \\text{ once}\\}$$

#### Sizing Neighborhoods Across Representations (Slide 8–10)
1. **Binary Strings (0/1 Knapsack, Max-SAT)**:
   - Configuration: $x = (x_1, \\dots, x_n) \\in \\{0, 1\\}^n$.
   - Operator: **1-bit flip** (invert variable $x_i$).
   - Neighbourhood size: $|N(x)| = n$.
2. **Permutations (Traveling Salesperson Problem)**:
   - Configuration: $\\pi = (c_1, \\dots, c_n)$.
   - Operator A: **2-opt / Inversion** (cut edges $(i, i+1)$ and $(j, j+1)$ and reconnect). Size: $|N(x)| = \\frac{n(n-1)}{2}$.
   - Operator B: **City Swap** (exchange positions of two cities $\\pi_i$ and $\\pi_j$). Size: $|N(x)| = \\frac{n(n-1)}{2}$.
   - Operator C: **Insertion** (remove city $\\pi_i$ and insert at position $j$). Size: $|N(x)| = n(n-1)$.
3. **Discrete Integer Vectors (Fixed-$r$ Graph Coloring)**:
   - Configuration: $c = (c_1, \\dots, c_n)$ where $c_i \\in \\{1, \\dots, r\\}$.
   - Operator: Change the color of one conflicted vertex to another available color.
   - Size: $|V_{\\text{conflicts}}| \\times (r - 1) \\le n(r - 1)$.`,
          keyTakeaways: [
            'N(x) defines the landscape topology and the adjacent candidate states.',
            '1-bit flip yields size n; TSP 2-opt yields size n(n-1)/2.',
            'The neighborhood operator determines both the landscape smoothness and connectivity.',
          ],
        },
      ],
    },
    {
      id: 'hill-climbing-and-pathologies',
      number: 2,
      title: 'Hill Climbing & Search Pathologies',
      slideRange: 'Slides 11–28',
      description:
        'The greedy Hill-Climbing algorithm, Steepest Ascent vs First Improvement, Local Optima, Plateaus, Ridges, and Stochastic Hill Climbing.',
      sections: [
        {
          id: 'hill-climbing-algorithm',
          title: 'The Hill Climbing Algorithm (Maximization & Minimization)',
          slideRef: { lessonId: 'lesson-7', slideNumber: '13–16' },
          summary: 'Iterative greedy progression to the best local neighbor until no improvement exists.',
          content: `### Hill Climbing Pseudocode (Slide 14)

For a maximization problem:
\`\`\`text
1: function HillClimbing(initialSolution)
2:    currentSolution ← initialSolution
3:    currentScore ← Evaluate(currentSolution)
4:    improves ← True
5:    while improves = True do
6:       improves ← False
7:       neighbours ← GenerateNeighbours(currentSolution)
8:       for each neighbour in neighbours do
9:          score ← Evaluate(neighbour)
10:         if score > currentScore then
11:            currentSolution ← neighbour
12:            currentScore ← score
13:            improves ← True
14:   return currentSolution
\`\`\`

#### Variants of Hill Climbing
- **Steepest Ascent (Best Improvement)**: Exhaustively evaluates all $x' \\in N(x)$ and selects the neighbor maximizing $f(x')$.
- **First Improvement (First Choice)**: Generates neighbors in random order and selects the *very first* neighbor with $f(x') > f(x)$. Saves substantial CPU time when $|N(x)|$ is large.`,
          keyTakeaways: [
            'Hill Climbing greedily moves to improving neighbors until a local peak is reached.',
            'Steepest Ascent tests all neighbors; First Improvement accepts the first that improves.',
            'Guaranteed to terminate on finite discrete spaces, but only guarantees local optimality.',
          ],
        },
        {
          id: 'three-pathologies',
          title: 'The Three Main Pathologies: Local Optima, Plateaus, and Ridges',
          slideRef: { lessonId: 'lesson-7', slideNumber: '17–25' },
          summary: 'Detailed mechanics of how greedy 1-step lookahead gets trapped in landscape traps.',
          content: `### The Three Main Difficulties of Hill Climbing (Slide 17)

All three pathologies stem from a single root cause: **Hill Climbing only looks one step ahead and strictly refuses worsening moves**.

1. **Local Optimum**:
   - No neighbor improves the current score: $\\forall x' \\in N(x), f(x') \\le f(x)$, yet a globally superior state exists elsewhere.
   - The algorithm halts, unable to bridge the intermediate valley.
2. **Plateau**:
   - A flat region where all adjacent configurations have identical scores: $\\forall x' \\in N(x), f(x') = f(x)$.
   - Hill Climbing has no gradient to follow.
   - **Course Remedy (Slide 17)**: Allow **sideways moves** ($f(x') = f(x)$), but cap consecutive sideways moves (e.g., limit of 100) to prevent infinite loops.
3. **Ridge**:
   - A sequence of local peaks where the crest rises diagonally across coordinates.
   - Moving along any single coordinate drops down into a valley. Since the operator only flips one variable at a time, the algorithm halts or makes agonizingly slow progress.`,
          keyTakeaways: [
            'Local Optima trap the search because worse moves are forbidden.',
            'Plateaus have zero gradient; sideways moves must be capped to prevent infinite loops.',
            'Ridges defeat 1-variable operators because diagonal coordination is required.',
          ],
        },
        {
          id: 'stochastic-hill-climbing',
          title: 'Stochastic Hill Climbing (Slide 27–28)',
          slideRef: { lessonId: 'lesson-7', slideNumber: '27–28' },
          summary: 'Balancing exploitation and exploration via random neighbor acceptance.',
          content: `### Stochastic Hill Climbing Algorithm (Slide 28)

Instead of always choosing the best neighbor, Stochastic Hill Climbing introduces a probability parameter $q \\in [0, 1]$:
\`\`\`text
1: function StochasticHillClimbing(initialSolution, q, MaxIters)
2:    currentSolution ← initialSolution
3:    bestSolution ← currentSolution
4:    bestScore ← Evaluate(bestSolution)
5:    for iter ← 1 to maxIters do
6:       neighbours ← GenerateNeighbours(currentSolution)
7:       if Random(0, 1) ≤ q then
8:          currentSolution ← Best(neighbours)
9:       else
10:         currentSolution ← RandomChoice(neighbours)
11:      currentScore ← Evaluate(currentSolution)
12:      if currentScore > bestScore then
13:         bestSolution ← currentSolution
14:         bestScore ← currentScore
15:   return bestSolution
\`\`\`

> **Critical Rule**: Because a random choice may worsen the score, the algorithm **must maintain and return $\\text{bestSolution}$**, not simply the final state!`,
          keyTakeaways: [
            'With probability q, selects the best neighbor; with probability 1-q, selects a random neighbor.',
            'Allows escaping shallow local traps through exploratory random moves.',
            'Must keep track of bestSolution throughout the entire trajectory.',
          ],
        },
      ],
    },
    {
      id: 'escape-metaheuristics',
      number: 3,
      title: 'Metaheuristics for Escaping Local Optima',
      slideRange: 'Slides 29–53',
      description:
        'Four canonical escape strategies: Randomized Local Search (RLS), Iterated Local Search (ILS), Variable Neighbourhood Search (VNS), and Simulated Annealing (SA).',
      sections: [
        {
          id: 'rls-and-ils',
          title: 'Randomized Local Search (RLS) & Iterated Local Search (ILS)',
          slideRef: { lessonId: 'lesson-7', slideNumber: '31–45' },
          summary: 'Restarting from random states (RLS) vs perturbing previous optima (ILS).',
          content: `### Four Strategies for Escaping Local Optima (Slide 31)

When Hill Climbing terminates at a local optimum, metaheuristics apply four distinct escape paradigms:
1. **RLS (Randomized Local Search / Random Restarts)**: Restart Hill Climbing from an entirely new uniformly random configuration.
2. **ILS (Iterated Local Search)**: Perturb the obtained local optimum and restart Hill Climbing from the perturbed state.
3. **VNS (Variable Neighbourhood Search)**: Enlarge or change the neighborhood operator ($N_1, N_2, \\dots, N_k$).
4. **Simulated Annealing (SA)**: Accept worsening moves probabilistically according to the Metropolis criterion.

---

### RLS vs. ILS Comparison
- **RLS (Slide 32)**: Pure diversification. Discovers independent basins of attraction across distant parts of the search space.
- **ILS (Slide 39–40)**: Intensified diversification. Perturbation operator applies a controlled jump ($k$ random moves) to escape the immediate basin without destroying the structural traits of the high-quality solution.`,
          keyTakeaways: [
            'RLS performs independent random restarts across the entire space.',
            'ILS perturbs the previous local optimum to explore adjacent high-quality basins.',
            'Both algorithms retain and return the global best configuration found.',
          ],
        },
        {
          id: 'simulated-annealing-and-metropolis',
          title: 'Simulated Annealing & The Metropolis Criterion',
          slideRef: { lessonId: 'lesson-7', slideNumber: '48–52' },
          summary: 'Probabilistic worsening moves exp(-Δ/T) and geometric cooling schedules.',
          content: `### The Physical Analogy & Metropolis Criterion (Slide 48–49)

In metallurgy, annealing slowly cools molten metal so atoms arrange into a low-energy crystalline lattice. If cooled too fast (quenching), defects freeze in.

#### The Metropolis Acceptance Criterion (Minimization)
For a candidate neighbor $x' \\in N(x)$, define $\\Delta = f(x') - f(x)$:
$$P(\\text{accept } x') = \\begin{cases} 1 & \\text{if } \\Delta \\le 0 \\quad (\\text{improvement}) \\\\ \\exp(-\\Delta / T) & \\text{if } \\Delta > 0 \\quad (\\text{worsening move}) \\end{cases}$$

- If $\\Delta \\le 0$, the move is **always accepted**.
- If $\\Delta > 0$, generate random $u \\sim U(0, 1)$ and accept if $u \\le \\exp(-\\Delta / T)$.

#### Geometric Cooling Schedule (Slide 50–52)
$$T_{t+1} = \\alpha T_t, \\quad 0 < \\alpha < 1 \\quad (\\text{typically } \\alpha \\in [0.85, 0.99])$$

- At each temperature level $T$, $L$ movements are performed.
- **High $T$**: $\\exp(-\\Delta / T) \\approx 1$. Worsening moves are accepted frequently; high exploration.
- **Low $T \\to 0$**: $\\exp(-\\Delta / T) \\to 0$. Worsening moves are almost never accepted; converges to greedy Hill Climbing.`,
          keyTakeaways: [
            'Accepts worse solutions with probability exp(-Δ / T) to escape deep local minima.',
            'High temperature encourages global exploration; low temperature enforces greedy exploitation.',
            'Geometric cooling T ← αT guarantees smooth convergence to local minima basins.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'prop-ex-knapsack-hc',
      title: 'Proposed Problem 1: 0/1 Knapsack with Hill Climbing (Slide 61)',
      slideRef: { lessonId: 'lesson-7', slideNumber: 61 },
      problemStatement:
        'Apply basic Hill Climbing for the 0/1 Knapsack problem with maximum capacity C = 16 kg. Given a set of items with weights and values, formulate: 1) State representation, 2) Neighbourhood operator, 3) Evaluation function. Assume initial state has an empty knapsack.',
      formalization: {
        stateSpace: 'x = (x1, x2, ..., xn) in {0, 1}^n, where xi = 1 if item i is placed in knapsack, 0 otherwise.',
        initialState: 'x0 = (0, 0, ..., 0) (empty knapsack, weight = 0, value = 0).',
        actions: '1-bit flip: invert xi from 0 to 1 or 1 to 0.',
        successorFunction: 'N(x) consists of all n configurations differing by exactly one bit.',
        goalTest: 'Local maximum: no neighbor in N(x) has higher valid evaluated score.',
        pathCost: 'Objective function f(x): total value if sum(w_i * x_i) <= 16, else penalty (or 0).',
      },
      solutionExplanation:
        'Using 1-bit flip, from empty knapsack (0,0,...,0) with weight 0, the algorithm evaluates all single-item inclusions. It greedily adds the item providing highest value (or value/weight) without exceeding 16 kg. Once full or no single item can be added or swapped to improve total value, HC stops at a local optimum.',
      hasInteractiveTool: true,
      interactiveToolId: 'hill-climbing-lab',
    },
    {
      id: 'prop-ex-two-processor-vns',
      title: 'Proposed Problem 2: Two-Processor Workload Balancing & VNS (Slide 62)',
      slideRef: { lessonId: 'lesson-7', slideNumber: 62 },
      problemStatement:
        'Five independent jobs with processing times [8, 7, 6, 5, 4] must be scheduled on two identical processors (P0 and P1). 1) Propose binary representation x in {0, 1}^5. 2) Define objective function minimizing completion time of busiest processor. 3) Define neighborhood N1 (move one job). 4) For x = (1, 0, 1, 0, 0), evaluate all neighbors in N1: is x a local optimum? 5) Define N2 by swapping one job from each processor: can N2 find a better solution? 6) Explain how VNS or Simulated Annealing escapes.',
      formalization: {
        stateSpace: 'x in {0, 1}^5, where xi = 1 if job i assigned to P1, 0 if assigned to P0.',
        initialState: 'x = (1, 0, 1, 0, 0). Workloads: P1 = 8 + 6 = 14h; P0 = 7 + 5 + 4 = 16h.',
        actions: 'N1: flip single bit. N2: swap one job on P0 with one on P1.',
        successorFunction: 'N1 has 5 neighbors. N2 has 2 x 3 = 6 neighbors.',
        goalTest: 'f(x) = max(L0, L1) = 15 (perfect balance since total hours = 30).',
        pathCost: 'f(x) = max(L0(x), L1(x)) = max(sum(ti*(1-xi)), sum(ti*xi)).',
      },
      solutionExplanation:
        'At x=(1,0,1,0,0), f(x)=max(16, 14)=16. Evaluating all 5 neighbors in N1 gives completion times: flip J1 → 24h; flip J2 → 21h; flip J3 → 22h; flip J4 → 19h; flip J5 → 18h. Since all neighbors have f(x) >= 18 > 16, x is a strict local optimum in N1! In N2, swapping J2 (7 on P0) with J3 (6 on P1) yields L0 = 16 - 7 + 6 = 15h, L1 = 14 - 6 + 7 = 15h, achieving f(x) = 15h, which is the global optimum! VNS switches from N1 to N2 upon entrapment, immediately discovering the global optimum.',
      hasInteractiveTool: true,
      interactiveToolId: 'two-processor-vns-lab',
    },
  ],
};

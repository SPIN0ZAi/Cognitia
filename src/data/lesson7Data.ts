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
          content: `### Formal Definition of Neighbourhood & Operator Sizing (Slides 6–10)

Given a problem representation space $S$ and a **neighbourhood operator** $op$, the neighbourhood of a configuration $x \\in S$, denoted $N(x)$, is:
$$N(x) = \\{x' \\in S \\mid x' \\text{ can be reached from } x \\text{ by applying } op \\text{ once}\\}$$

#### Comprehensive Neighborhood Sizing Reference (Slides 8–10):

| Problem Domain | Representation | Operator | Exact Size $|N(x)|$ | Landscape Characteristic |
| :--- | :--- | :--- | :---: | :--- |
| **0/1 Knapsack / Max-SAT** | Binary $x \\in \\{0, 1\\}^n$ | **1-Bit Flip** (invert $x_i$) | $n$ | Hamming hypercube; distance 1 transitions |
| **TSP (Inversion)** | Permutation $\\pi \\in \\Pi_n$ | **2-opt / Segment Reversal** | $\\frac{n(n-1)}{2}$ | Uncrosses intersecting edges; standard for Euclidean TSP |
| **TSP (City Swap)** | Permutation $\\pi \\in \\Pi_n$ | **Node Swap** (exchange $\\pi_i, \\pi_j$) | $\\frac{n(n-1)}{2}$ | Exchanges two individual positions; coarser landscape |
| **TSP (City Insertion)** | Permutation $\\pi \\in \\Pi_n$ | **Insertion** (remove $\\pi_i$ and insert at $j$) | $n(n-1)$ | Asymmetric shifts; double the size of swaps |
| **Graph Coloring** | Integer $c \\in \\{0, \\dots, r-1\\}^k$ | **Recolor Conflicted Vertex** | $|V_{\\text{conf}}| \\times (r-1) \\le k(r-1)$ | Restricted to conflicting vertices to prune wasteful moves |

> 💡 **Landscape Topology Principle**:
> The choice of neighborhood operator defines the **topological connectivity** of the configuration space. An operator that makes small modifications creates smooth landscapes with many gentle local peaks, whereas large-jump operators create rugged landscapes with fewer but wider basins.`,
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
          content: `### The Three Main Pathologies of Hill Climbing (Slides 17–25)

All three pathologies stem from a single structural root cause: **Hill Climbing evaluates only immediate 1-step neighbors and strictly forbids worsening moves**.

| Pathology | Landscape Topology | Mathematical Condition | Greedy HC Behavior | Course Remedy (Slide 17, 21) |
| :--- | :--- | :--- | :--- | :--- |
| **Local Optimum** | Peak surrounded by lower elevations in all directions | $\\forall x' \\in N(x), f(x') < f(x)$ | Halts permanently; cannot cross intermediate valley | RLS (random restarts), ILS (perturbation), Simulated Annealing |
| **Plateau / Shoulder** | Flat elevation zone with zero gradient | $\\forall x' \\in N(x), f(x') = f(x)$ | Wanders aimlessly with zero directional guidance | Allow **sideways moves** ($f(x') = f(x)$), but cap at $M \\le 100$ steps |
| **Diagonal Ridge** | Sequence of peaks rising diagonally across axes | 1-step cardinal moves drop off the crest into valleys | Oscillates back and forth or halts on the spine | Multi-variable moves, diagonal neighborhood operators |

> ⚠️ **UCLM Exam Pitfall: Flat Local Maxima vs. Shoulders (Slide 21)**:
> Students often assume all flat regions are dead ends. In reality, there are two distinct types:
> 1. **Shoulders**: A flat section that eventually breaks out onto an ascending slope. Allowing sideways moves successfully crosses shoulders and reaches higher elevations!
> 2. **Flat Local Maxima**: A plateau that drops off on all sides. Sideways moves on flat local maxima wander aimlessly without improvement. A hard limit (e.g., max 100 consecutive sideways moves) is strictly mandatory to prevent infinite loops.

> 🧗 **The 2D Diagonal Ridge Dilemma (Slide 23–25)**:
> In functions like $f(x_1, x_2)$ with an ascending diagonal crest, an operator that changes only one variable at a time (e.g., $x_1 \\pm \\delta$ or $x_2 \\pm \\delta$) steps off the ridge and into the valley on every move! The greedy climber declares a false local optimum, even though a joint diagonal move $(x_1 + \\delta, x_2 + \\delta)$ would climb smoothly up the spine.

*Experience these three pathologies first-hand in the interactive laboratory below: sculpt custom terrain, trigger sideways moves on shoulders, and navigate the 2D ridge!*`,
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
          content: `### Four Metaheuristic Escape Paradigms (Slides 31–45)

When greedy Hill Climbing halts at a local optimum, metaheuristics apply four distinct escape mechanisms:

| Strategy | Core Mechanism | Diversification Scope | Trajectory Retention | Typical Domain |
| :--- | :--- | :--- | :--- | :--- |
| **RLS (Random Restarts)** | Re-sample $x_0 \\sim U(S)$ uniformly at random | Global uncorrelated | Independent restarts; track $\\text{bestSoFar}$ | Smooth landscapes with many shallow basins |
| **ILS (Iterated Local Search)** | Perturb current optimum: $x' = x^* \\oplus \\text{Perturb}(k)$ | Intermediate basin hop | Chained trajectory across adjacent basins | Combinatorial TSP, scheduling, packing |
| **VNS (Variable Neighbourhood)** | Expand neighborhood operator: $N_1 \\to N_2 \\to \\dots \\to N_k$ | Progressive expansion | Same solution evaluated under larger operators | Two-processor balancing, routing |
| **Simulated Annealing** | Accept worsening moves with probability $\\exp(-\\Delta / T)$ | Temperature-controlled | Continuous single trajectory with stochastic drift | Complex physical models, VLSI chip layout |

#### RLS vs. ILS: Exploration vs. Structural Retention
- **RLS (Slide 32)**: Pure, unguided diversification. Throws away all information learned during previous climbs and starts fresh from a new random coordinate.
- **ILS (Slide 39–40)**: Structured diversification. The perturbation operator makes $k$ random moves to break free from the current attraction basin without destroying the high-quality structural "building blocks" of the candidate.`,
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
          content: `### The Physical Analogy & Metropolis Criterion (Slides 48–52)

In metallurgy, annealing slowly cools molten metal so atoms arrange into an optimal low-energy crystalline lattice. If cooled too abruptly (**quenching**), defects freeze in.

#### The Metropolis Acceptance Criterion (Minimization)
For a candidate neighbor $x' \\in N(x)$, define the energy difference $\\Delta = f(x') - f(x)$:
$$P(\\text{accept } x') = \\begin{cases} 1 & \\text{if } \\Delta \\le 0 \\quad (\\text{improvement}) \\\\ \\exp(-\\Delta / T) & \\text{if } \\Delta > 0 \\quad (\\text{worsening move}) \\end{cases}$$

- If $\\Delta \\le 0$, the move is **always accepted** (100% deterministic improvement).
- If $\\Delta > 0$, generate a uniform random number $u \\sim U[0, 1)$ and accept the worsening move if $u \\le \\exp(-\\Delta / T)$.

#### Worked Numerical Example (Metropolis Mechanics):
Suppose a worsening move increases cost by $\\Delta = +2.5$:
- **Initial high temperature ($T = 10.0$)**:
  $$P(\\text{accept}) = \\exp(-2.5 / 10.0) = \\exp(-0.25) \\approx 0.779 \\quad (77.9\\% \\text{ chance to accept})$$
- **Mid temperature ($T = 2.0$)**:
  $$P(\\text{accept}) = \\exp(-2.5 / 2.0) = \\exp(-1.25) \\approx 0.287 \\quad (28.7\\% \\text{ chance to accept})$$
- **Freezing temperature ($T = 0.5$)**:
  $$P(\\text{accept}) = \\exp(-2.5 / 0.5) = \\exp(-5.0) \\approx 0.0067 \\quad (0.67\\% \\text{ chance to accept})$$
- **Zero limit ($T \\to 0$)**: $P(\\text{accept}) \\to 0$. The algorithm degenerates strictly to greedy Hill Climbing!

#### Geometric Cooling Schedule (Slides 50–52):
$$T_{t+1} = \\alpha T_t, \\quad \\alpha \\in [0.85, 0.99]$$

At each temperature level $T_t$, the algorithm executes $L$ candidate evaluations to reach thermal equilibrium before cooling down.

*Try this in the interactive Simulated Annealing & Metropolis Criterion Lab below: adjust temperature T and observe the live acceptance probability curve!*`,
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

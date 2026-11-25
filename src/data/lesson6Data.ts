import type { LessonData } from '../types/course';

export const LESSON_6_DATA: LessonData = {
  id: 'lesson-6',
  number: 6,
  title: 'Combinatorial Optimization & Metaheuristics Foundations',
  subtitle:
    'Configuration search spaces, problem representation, evaluation functions, NP-hardness, and the balance between intensification and diversification',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 55,
  overview:
    'Explores complex optimization problems where the solution is the state itself (a configuration of decision variables) rather than an action sequence, rendering path-based search algorithms like A* completely inapplicable. Formalizes combinatorial optimization through the triad of Representation, Evaluation Function (Fitness), and Optimization Criterion. Examines canonical case studies: Boolean Satisfiability (SAT vs. Max-SAT and the creation of informational gradients), Graph Coloring with fixed-r formulation, Traveling Salesman Problem (permutations and combinatorial explosion N! / 2N), and real-world parameter configuration in robotics (AIBO and NAO locomotion). Analyzes computational complexity classes (P, NP, NP-complete, NP-hard) and introduces metaheuristics as general-purpose search frameworks governed by the fundamental trade-off between intensification (exploitation) and diversification (exploration). Concludes with the official UCLM proposed exercise on two-processor workload balancing and symmetry reduction.',
  prerequisites: [
    'State space representation and search complexity (Lesson 2)',
    'Heuristic evaluation functions (Lesson 3)',
    'Combinatorics, permutations, and discrete mathematics',
  ],
  learningObjectives: [
    'Identify problems where the solution is a state configuration rather than a path, and explain why A* is structurally unsuited for them.',
    'Formulate combinatorial optimization problems using Representation, Evaluation Function f(c), and Optimization Criterion.',
    'Contrast the flat binary landscape of SAT with the gradual guidance gradient of Max-SAT.',
    'Formulate the fixed-r graph coloring problem as an integer vector and calculate the conflict penalty function.',
    'Calculate the search space size of TSP permutations and distinguish symmetric (N-1)!/2 from asymmetric (N-1)! problem instances.',
    'Classify problems into P, NP, NP-complete, and NP-hard, identifying whether an optimization task requires approximate metaheuristics.',
    'Define metaheuristics and distinguish the three major families: trajectory-based, constructive, and population-based.',
    'Explain the fundamental trade-off between intensification (local exploitation) and diversification (global exploration).',
    'Solve the official UCLM exam problem: two-processor workload balancing, mathematical formulations L0(c) and L1(c), objective evaluation, and symmetry breaking.',
  ],
  chapters: [
    {
      id: 'why-combinatorial-optimization',
      number: 1,
      title: 'Problems of Combinatorial Optimization',
      slideRange: 'Slides 1–12',
      description:
        'When the solution is the state itself, failure of path-based search (A*), and real-world applications in F1 racing, BioBots, and robot gait design.',
      sections: [
        {
          id: 'state-as-solution-vs-paths',
          title: 'The Solution is the State: Why A* Fails',
          slideRef: { lessonId: 'lesson-6', slideNumber: 5, note: 'State as solution vs path to goal' },
          summary:
            'In classical search, algorithms find a sequence of actions from S0 to goal. In combinatorial optimization, the path is irrelevant: the goal is finding a configuration of variables that optimizes an objective.',
          content: `
### The Fundamental Paradigm Shift (Slides 5, 9)

In Lessons 2–4, our algorithms searched for a **path**: a sequence of actions $[a_0, a_1, \\dots, a_k]$ taking the agent from initial state $S_0$ to a recognizable goal state $G$.
$$\\text{Solution } = \\text{Sequence of actions (Path)}$$

In **optimization problems**:
1. **The Solution is Just the State**: A configuration $c = (x_1, x_2, \\dots, x_n)$ representing values assigned to a set of decision variables.
2. **The Path is Irrelevant**: It does not matter what sequence of modifications was made to construct or reach the configuration.
3. **No Recognizable Goal Known in Advance**: We do not possess a goal predicate $\\text{IsGoal}(s)$ to check against. Finding the best configuration **is** the entire problem!

> ⚠️ **UCLM Exam Pitfall**: Students often attempt to apply tree search ($A^*$) to optimization problems. $A^*$ requires a known goal state or goal predicate to compute an admissible heuristic $h(n)$ estimating remaining path cost. In combinatorial optimization, we do not know what the optimal state looks like ahead of time—its objective score $f(c)$ is evaluated directly on the complete configuration. Furthermore, search trees grow to astronomical depths with leaf spaces exceeding $10^{100}$.

| Dimension | Classical Path Search (Lessons 2–4) | Combinatorial Optimization (Lesson 6) |
| :--- | :--- | :--- |
| **Output** | Ordered sequence of actions $[a_0, a_1, \\dots, a_k]$ | A single static configuration $c = (x_1, \\dots, x_n)$ |
| **Goal Criteria** | Predicate $\\text{IsGoal}(s) = \\text{True}$ | Extremize objective function $\\max f(c)$ or $\\min f(c)$ |
| **Heuristic Function** | $h(n)$: Estimates remaining cost to reach goal | $f(c)$: Evaluates absolute quality of candidate |
| **Search Tree Depth** | Path length $d$; pruned by branch-and-bound | Fixed number of variables $n$; leaf count $\\prod |D_i|$ |
| **Primary Algorithms** | BFS, DFS, UCS, $A^*$, IDA* | Hill Climbing, Simulated Annealing, Genetic Algorithms |

#### Why $A^*$ Cannot Be Used (Slide 9):
Suppose we try to formulate parameter optimization as a search tree where each tree level sets one parameter:
* If 100 parameters are discretized into 20 values each, the leaf level contains:
  $$|C| = 20^{100} \\approx 1.27 \\times 10^{130} \\text{ configurations}$$
* Even with an exceptional effective branching factor $b^* = 2$, the tree has $2^{100} \\approx 1.27 \\times 10^{30}$ nodes!
* $A^*$ relies on $h(n)$ estimating the remaining path cost to a known goal state. Here, the evaluation function $f(c)$ measures the quality of a **complete** candidate configuration, not a distance to a goal!
          `,
          keyTakeaways: [
            'In optimization, the solution is the configuration of variables, not the path taken to construct it.',
            'A* cannot be applied because there is no known goal state to estimate distance towards, and the search tree depth has colossal combinatorial size.',
          ],
        },
        {
          id: 'real-world-case-studies',
          title: 'Real-World Case Studies: F1 Racing, BioBots & Bipedal Robots',
          slideRef: { lessonId: 'lesson-6', slideNumber: 6, note: 'Real examples of optimization problems' },
          summary:
            'Examining real optimization domains: Formula 1 car setup (100+ parameters), BioBots reconfigurable organisms (448 polycubes), and NAO bipedal locomotion.',
          content: `
### Real-World Optimization Benchmarks (Slides 6–12, 40–42)

Combinatorial optimization algorithms are deployed whenever system performance depends on complex, coupled configurations rather than finding paths through physical maps.

| Benchmark Case | Domain | Variables $n$ & Domain | Search Space $|C|$ | Evaluation Cost & Simulator |
| :--- | :--- | :--- | :--- | :--- |
| **Formula 1 Setup** | Aerodynamics & Mechanical | 100+ continuous/discrete parameters | Multi-modal continuous | Multi-lap aerodynamic simulation (noisy, slow) |
| **BioBots Organisms** | Synthetic Biology (*PNAS 2020*) | $8 \\times 8 \\times 7 = 448$ voxels $\\in \\{\\text{None}, \\text{Passive}, \\text{Contractile}\\}$ | $3^{448} \\approx 10^{213}$ discrete states | Biophysical finite-element physics engine |
| **NAO Robot Walking** | Bipedal Locomotion (Slides 40–42) | 6 continuous kinematic gait angles | Infinite continuous ($\\mathbb{R}^6$) | Real-world physical test track with sensor timing |

#### Deep Dive 1: Formula 1 Race Car Optimization (Slides 6–8)
* **Goal**: Maximize average lap speed $\\equiv$ minimize total lap time on a specific circuit.
* **Variables**: Over 100 numerical parameters interacting non-linearly: gear ratios, wing aerodynamics, damper stiffness, tire pressures, camber angles, brake balance.
* **Evaluation Challenge**: Evaluating a single setup requires running multi-lap physics simulations that take significant CPU time and exhibit stochastic noise.

#### Deep Dive 2: Designing Reconfigurable Biological Organisms (BioBots) (Slides 10–12)
* Published in *PNAS (2020)* by Kriegman, Blackiston, Levin, and Bongard.
* **Representation**: A 3D polycube structure of size $8 \\times 8 \\times 7 = 448$ discrete voxels.
* **Domain**: Each voxel is assigned one of three tissue types: **None (empty)**, **Passive (scaffold)**, or **Contractile (heart muscle)**.
* **Evaluation**: A biophysical simulator measures the locomotion speed and cargo transport capability of the resulting creature.

#### Deep Dive 3: Bipedal Walking in the NAO Robot (Slides 40–42)
* **Parameters**: 6 continuous kinematic variables: \`singleSupportTime\`, \`stepHeight\`, \`maximumLength\`, \`bodyOffset\`, \`bodyPitchOffset\`, \`CoMHeight\`.
* **Challenge**: Continuous variables yield an **infinite search space**, and every physical evaluation requires the physical robot to walk and measure elapsed time with sensors.
          `,
          keyTakeaways: [
            'Real-world optimization problems involve high dimensions, non-linear parameter couplings, and expensive or noisy evaluations.',
            'BioBots assign 3 tissue types across 448 polycubes to discover novel biological machines.',
          ],
        },
      ],
    },
    {
      id: 'combinatorial-optimization-formulation',
      number: 2,
      title: 'Formalization of Combinatorial Optimization',
      slideRange: 'Slides 13–43',
      description:
        'The 3 core elements: Representation, Evaluation Function, and Optimization Criterion. Canonical benchmarks: SAT, Max-SAT, Graph Coloring, and TSP.',
      sections: [
        {
          id: 'triad-formulation',
          title: 'The Optimization Triad: Representation, Evaluation & Criterion',
          slideRef: { lessonId: 'lesson-6', slideNumber: 20, note: 'Three core elements of optimization' },
          summary:
            'Defining an optimization problem requires specifying Representation (encoding of variables), Evaluation Function f(c) (fitness or score), and Optimization Criterion (min or max).',
          content: `
### The 3 Core Elements of Formulation (Slide 20)

Every optimization problem requires defining:
1. **Representation**:
   The data structure used to codify a candidate solution $c$. Specifies the number of decision variables $n$ and their domain:
   * Binary: $c \\in \\{0, 1\\}^n$
   * Integer: $c \\in \\{0, 1, \\dots, k-1\\}^n$
   * Permutation: $c \\in \\Pi_n$ (ordering of distinct elements)
   * Continuous / Mixed: $c \\in \\mathbb{R}^n$
2. **Evaluation Function $f(c)$**:
   A function $f: C \\to \\mathbb{R}$ that assigns a real number (score, fitness, or cost) measuring configuration quality.
3. **Optimization Criterion**:
   Whether the objective is maximization or minimization:
   $$c^* = \\arg\\max_{c \\in C} f(c) \\qquad \\text{or} \\qquad c^* = \\arg\\min_{c \\in C} f(c)$$
          `,
          keyTakeaways: [
            'All optimization problems consist of: Representation, Evaluation Function f(c), and Optimization Criterion.',
            'The representation determines the size of the search space, the neighborhood structure, and admissible search operators.',
          ],
        },
        {
          id: 'sat-vs-maxsat',
          title: 'SAT vs. Max-SAT: Flat Evaluation vs. Informational Gradients',
          slideRef: { lessonId: 'lesson-6', slideNumber: 25, note: 'SAT and MaxSAT comparison' },
          summary:
            'Comparing SAT and Max-SAT. Both share the exact same binary configuration space {0, 1}^n, but Max-SAT replaces a binary 0/1 step function with a smooth clause-satisfaction gradient.',
          content: `
### SAT vs. Max-SAT: Informational Gradients (Slides 21–27)

Given a Boolean formula in Conjunctive Normal Form (CNF) with $n$ boolean variables and $m$ disjunctive clauses:
$$F = (x_1 \\lor \\neg x_2) \\land (\\neg x_1 \\lor \\neg x_2 \\lor \\neg x_3) \\land (x_1 \\lor x_2) \\dots$$

Both problems share the exact same representation space:
$$c = (x_1, x_2, \\dots, x_n) \\in \\{0, 1\\}^n, \\qquad |C| = 2^n$$

#### How Their Evaluation Functions Differ (Slide 25):

| Feature | Standard SAT (Decision / Step Function) | Max-SAT (Optimization / Gradient) |
| :--- | :--- | :--- |
| **Formula** | $f_{\\text{SAT}}(c) = \\begin{cases} 1 & \\text{if } \\forall i, \\text{clause}_i = 1 \\\\ 0 & \\text{otherwise} \\end{cases}$ | $f_{\\text{MaxSAT}}(c) = \\sum_{i=1}^m \\text{TruthValue}(\\text{clause}_i)$ |
| **Output Domain** | Flat binary step: $\\{0, 1\\}$ | Granular integer gradient: $\\{0, 1, \\dots, m\\}$ |
| **Landscape** | Needle in a haystack; flat zero plain everywhere except solution | Smooth, undulating mountain with slopes guiding local search |
| **Guidance** | Zero gradient. 49/50 clauses satisfied gives $f=0$ (same as 0/50!) | Informative gradient. 49/50 gives $f=49$, rewarding progress |

> 🔬 **The Phase Transition at $\\alpha = m/n \\approx 4.26$ (Slide 27)**:
> In random 3-SAT benchmarks, problem difficulty does **not** scale monotonically with clause count $m$:
> - **Under-constrained ($\\alpha < 4.0$)**: Clauses are sparse. Solutions are abundant; random search quickly finds a satisfying configuration.
> - **Over-constrained ($\\alpha > 4.5$)**: Contradictions abound. Fast refutations and unit propagation quickly prove unsatisfiability.
> - **The Phase Transition ($\\alpha \\approx 4.26$)**: The probability of satisfiability drops precipitously from $\\approx 100\\%$ to $0\\%$. At this razor edge, candidate configurations satisfy nearly all clauses except one or two subtle contradictions. This is where SAT solvers suffer exponential computation spikes!

*Explore this live in the interactive laboratory below: flip variable switches and inspect the gate activation lines and phase transition curve!*
          `,
          keyTakeaways: [
            'SAT and Max-SAT share the identical search space of 2^n binary assignments.',
            'SAT provides a flat needle-in-a-haystack landscape; Max-SAT provides a continuous guidance gradient.',
          ],
        },
        {
          id: 'graph-coloring-formulation',
          title: 'Graph Coloring: Fixed-r Formulation & Penalty Function',
          slideRef: { lessonId: 'lesson-6', slideNumber: 30, note: 'Graph coloring fixed-r formulation' },
          summary:
            'Formulating vertex coloring with a fixed number of colors r as an integer vector c in {0, ..., r-1}^k, minimizing monochromatic edge conflicts.',
          content: `
### Graph Coloring: Fixed-r Combinatorial Formulation (Slides 28–30)

Given an undirected graph $G = (V, E)$ with $k = |V|$ vertices:
* **Vertex Coloring Goal**: Assign colors to vertices such that no two adjacent vertices share the same color.
* **Chromatic Number $\\chi(G)$**: The theoretical minimum number of colors needed for a conflict-free coloring.

#### The Fixed-$r$ Combinatorial Formulation (Slide 30):
* **Representation**: Integer vector $c = (c_0, c_1, \\dots, c_{k-1})$ where $c_i \\in \\{0, 1, \\dots, r-1\\}$. Search space: $|C| = r^k$.
* **Evaluation Function (Penalty of Monochromatic Edges)**:
  $$f(c) = \\sum_{(i, j) \\in E} \\mathbb{I}[c_i = c_j]$$
* **Optimization Criterion**: $c^* = \\arg\\min_{c \\in C} f(c)$.

> 🗺️ **UCLM Regional Benchmark: The Castilla-La Mancha Map**:
> Consider the 5 provinces of Castilla-La Mancha (Albacete, Ciudad Real, Cuenca, Guadalajara, Toledo):
> - **Vertices**: $k=5$ provinces.
> - **Borders (Edges)**: Toledo borders Ciudad Real, Cuenca, and Guadalajara. Ciudad Real borders Toledo, Cuenca, and Albacete. Cuenca borders all four other provinces!
> - **Chromatic Number**: Because Ciudad Real, Toledo, and Cuenca form a mutual 3-clique ($K_3$), the map cannot be colored with $r=2$ colors ($\\chi(G) = 3$).
> - **Combinatorial Space**: For $r=2$, $|C| = 2^5 = 32$ configurations (minimum conflicts $f^* = 1$). For $r=3$, $|C| = 3^5 = 243$ configurations, admitting valid conflict-free colorings ($f^* = 0$).

*Test your own coloring intuition and run the Min-Conflicts local repair solver in the laboratory below!*
          `,
          keyTakeaways: [
            'In fixed-r graph coloring, configuration c is an integer vector with r^k search space.',
            'The evaluation function f(c) counts conflicting edges; f(c*)=0 proves valid coloring.',
          ],
        },
        {
          id: 'traveling-salesman-problem',
          title: 'Traveling Salesman Problem (TSP): Permutations & Combinatorial Explosion',
          slideRef: { lessonId: 'lesson-6', slideNumber: 34, note: 'TSP permutations vs unique tours' },
          summary:
            'Permutation encoding for TSP. Symmetries: starting city (N cyclic shifts) and reversal (2 directions for symmetric TSP) reduce exhaustive search space to (N-1)! / 2.',
          content: `
### The Traveling Salesman Problem (Slides 31–38)

Given $N$ cities and a distance matrix $D: N \\times N$:
* **Representation**: Permutation $P = (c_0, c_1, \\dots, c_{N-1})$ of city indices.
* **Evaluation**: Total closed tour length returning to start:
  $$d_P = \\sum_{i=0}^{N-1} d(c_i, c_{(i+1) \\bmod N})$$

#### Mathematical Derivation of Unique Tours (Slide 34):
1. **Total Permutations**: There are $N!$ distinct ordered sequences.
2. **Cyclic Shift Symmetry**: A closed tour $A \\to B \\to C \\to D \\to A$ can start at any of the $N$ cities: $(A, B, C, D)$, $(B, C, D, A)$, $(C, D, A, B)$, $(D, A, B, C)$. All represent the exact same physical cycle. Dividing by $N$ leaves $(N-1)!$ directed tours.
3. **Reversal Symmetry (Symmetric TSP)**: When distances are symmetric ($d(i, j) = d(j, i)$), traversing the cycle clockwise versus counter-clockwise yields identical length. Dividing by 2 yields:
   $$\\text{Unique Tours} = \\frac{N!}{2N} = \\frac{(N - 1)!}{2}$$

> ⚠️ **UCLM Exam Note**: For **Asymmetric TSP** (ATSP, e.g., one-way streets or flights affected by jet streams, $d(i, j) \\ne d(j, i)$), reversing the direction produces a different physical cost. Therefore, ATSP has $(N - 1)!$ unique tours, NOT $(N - 1)! / 2$!

| $N$ Cities | Permutations $N!$ | Unique Tours $\\frac{(N-1)!}{2}$ | Time at $10^6$ evals/sec |
| :--- | :---: | :---: | :---: |
| 5 | $120$ | $12$ | $< 1$ millisecond |
| 10 | $3,628,800$ | $181,440$ | $0.18$ seconds |
| 20 | $\\approx 2.43 \\times 10^{18}$ | $\\approx 6.08 \\times 10^{16}$ | $\\approx 1,928$ years |
| 100 | $\\approx 9.33 \\times 10^{157}$ | $\\approx 4.67 \\times 10^{155}$ | $\\approx 3 \\times 10^{144}$ years |

Exhaustive search is physically impossible for even moderate instances, proving the absolute necessity of metaheuristic search.
          `,
          keyTakeaways: [
            'Symmetric TSP has (N-1)! / 2 unique physical tours after removing cyclic shifts and reversals.',
            'At N=100 cities, exhaustive search would take 3 x 10^144 years, requiring metaheuristics.',
          ],
        },
      ],
    },
    {
      id: 'metaheuristics-framework',
      number: 3,
      title: 'Heuristics, Metaheuristics & Complexity',
      slideRange: 'Slides 44–53',
      description:
        'Classification into Trajectory, Constructive, and Population-based families; the balance between Intensification and Diversification; P, NP, NP-complete, and NP-hard classes.',
      sections: [
        {
          id: 'heuristics-vs-metaheuristics',
          title: 'Heuristics vs. Metaheuristics & The 3 Algorithmic Families',
          slideRef: { lessonId: 'lesson-6', slideNumber: 45, note: 'Definition of metaheuristic' },
          summary:
            'A heuristic is tailored to a single problem. A metaheuristic is a general search framework adapting representation, evaluation, and operators. Three families: Trajectory, Constructive, Population-based.',
          content: `
### Definitions & The Metaheuristics Taxonomy (Slides 45–49)

* **Heuristic**: A problem-specific rule of thumb (e.g. Nearest Neighbor for TSP, most-constrained-variable in CSP). Fast, but completely bespoke and unable to transfer to different problems.
* **Metaheuristic**: A **general, problem-independent algorithmic framework** providing high-level guidelines for exploring search spaces. To apply a metaheuristic to any arbitrary engineering problem, you only need to specify:
  1. A representation of candidate solutions;
  2. An evaluation function $f(c)$;
  3. Variation operators that generate or modify solutions.

#### The Three Canonical Families of Metaheuristics (Slide 49):

| Family | Working Memory | State Maintained | Solution Assembly | Canonical Examples |
| :--- | :---: | :--- | :--- | :--- |
| **Trajectory-Based** | $O(1)$ | Single point $x_t \\in C$ evolving over iterations | Complete candidate modified locally via neighborhood $N(x)$ | Hill Climbing, Simulated Annealing, Tabu Search, VNS, ILS |
| **Constructive** | $O(n)$ | Partial candidate extended incrementally | Piece-by-piece greedy selection with probabilistic guidance | Ant Colony Optimization (ACO), GRASP |
| **Population-Based** | $O(N)$ | Pool of candidates $P(t) = \\{x_1, \\dots, x_N\\}$ | Complete candidates recombined via crossover & perturbed via mutation | Genetic Algorithms (GA), Evolution Strategies, Particle Swarm |
          `,
          keyTakeaways: [
            'Metaheuristics provide problem-independent algorithmic templates.',
            'Three primary families: Trajectory-based (single point), Constructive (step-by-step build), Population-based (pools of solutions).',
          ],
        },
        {
          id: 'intensification-vs-diversification',
          title: 'Intensification (Exploitation) vs. Diversification (Exploration)',
          slideRef: { lessonId: 'lesson-6', slideNumber: 47, note: 'Intensification vs diversification' },
          summary:
            'Intensification thoroughly explores promising neighborhood basins; Diversification ensures distant unexplored regions are visited to prevent premature convergence.',
          content: `
### The Core Balancing Act: Intensification vs. Diversification (Slides 47–50)

Every effective optimization algorithm must strike a balance between two opposing forces:

| Force | Purpose | Typical Operators / Controls | Failure Mode if Excessive |
| :--- | :--- | :--- | :--- |
| **Intensification (Exploitation)** | Focus search on the immediate neighborhood of known high-quality solutions to climb peaks | Greedy local moves, steepest ascent, small step sizes, low temperature ($T \\to 0$) | **Premature Convergence**: Trapped in suboptimal local basins |
| **Diversification (Exploration)** | Force search across broad, unexplored regions of configuration space to escape local traps | Large mutations, random restarts (RLS), high temperature in Simulated Annealing | **Random Walk**: Computation wasted without refining promising solutions |

> ⚖️ **The Dynamic Shift Principle (Slide 50)**:
> The highest-performing metaheuristics do **not** maintain a static balance. Instead, they begin with **dominant diversification** (exploring broadly to identify multiple high-potential basins across the search landscape) and smoothly shift towards **dominant intensification** (refining and polishing the best discovered candidate to numerical precision). This principle is seen in Simulated Annealing (cooling temperature), Genetic Algorithms (loss of population diversity over generations), and ILS/VNS (alternating perturbation and local climbing).
          `,
          keyTakeaways: [
            'Intensification exploits known good regions; Diversification explores novel regions.',
            'High-performance metaheuristics carefully tune the transition from initial diversification to late intensification.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'ex-6-1',
      title: 'Proposed Exercise: Two-Processor Workload Balancing (Slides 54–55)',
      slideRef: { lessonId: 'lesson-6', slideNumber: 54, note: 'Two processor workload balancing exercise' },
      problemStatement:
        'Five independent jobs with processing times J0=8, J1=7, J2=6, J3=5, J4=4 must be assigned to two identical processors P0 and P1. Binary representation c = (c0, c1, c2, c3, c4), ci = 0 if Ji assigned to P0, 1 if P1. 1. Write L0(c) and L1(c) mathematically. 2. Define objective f(c) to minimize. 3. Evaluate c(1)=(0,1,0,1,0) and c(2)=(0,0,1,0,1). 4. How many configurations? 5. Find optimal configuration and objective value. 6. Explain complement symmetry and how to eliminate it.',
      formalization: {
        stateSpace: 'c ∈ {0, 1}^5, |C| = 2^5 = 32',
        initialState: 'Processing times: [8, 7, 6, 5, 4], Total sum = 30',
        actions: 'Bit flip on job assignment',
        pathCost: 'f(c) = |L0(c) - L1(c)|',
      },
      solutionExplanation:
        '1. L0(c) = ∑ ti(1 - ci), L1(c) = ∑ ti·ci. 2. Objective f(c) = |L0(c) - L1(c)|. 3. For c(1)=(0,1,0,1,0): P0 has {J0,J2,J4} = 8+6+4=18; P1 has {J1,J3} = 7+5=12. f(c(1)) = |18 - 12| = 6. For c(2)=(0,0,1,0,1): P0 has {J0,J1,J3} = 8+7+5=20; P1 has {J2,J4} = 6+4=10. f(c(2)) = |20 - 10| = 10. 4. Total configurations = 2^5 = 32. 5. Optimal sum per processor = 30/2 = 15. E.g. J0+J1 = 8+7 = 15 on P0, J2+J3+J4 = 6+5+4 = 15 on P1. Configuration c* = (0, 0, 1, 1, 1) gives f(c*) = |15 - 15| = 0. 6. Complement c̄ = (1-c0, ..., 1-c4) represents the identical physical partition with processor labels swapped. Symmetry is eliminated by fixing c0 = 0 (Job J0 always on P0), reducing search space from 32 to 16.',
      hasInteractiveTool: true,
      interactiveToolId: 'two-processor-solver',
    },
  ],
};

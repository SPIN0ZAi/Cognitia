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
### Case Study 1: Formula 1 Race Car Optimization (Slides 6–8)
* **Goal**: Maximize average lap speed $\\equiv$ minimize total lap time on a specific circuit.
* **Variables**: Over 100 numerical parameters interacting non-linearly: gear ratios, wing aerodynamics, damper stiffness, tire pressures, camber angles, brake balance.
* **Evaluation Challenge**: Evaluating a single setup requires running multi-lap physics simulations that take significant CPU time and exhibit stochastic noise.

### Case Study 2: Designing Reconfigurable Biological Organisms (BioBots) (Slides 10–12)
* Published in *PNAS (2020)* by Kriegman, Blackiston, Levin, and Bongard.
* **Representation**: A 3D polycube structure of size $8 \\times 8 \\times 7 = 448$ discrete voxels.
* **Domain**: Each voxel is assigned one of three tissue types: **None (empty)**, **Passive (scaffold)**, or **Contractile (heart muscle)**.
* **Evaluation**: A biophysical simulator measures the locomotion speed and cargo transport capability of the resulting creature.

### Case Study 3: Bipedal Walking in the NAO Robot (Slides 40–42)
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
### SAT vs. Max-SAT (Slides 21–27)

Given a Boolean formula in Conjunctive Normal Form (CNF) with $n$ variables and $m$ clauses:
$$F = (x_1 \\lor \\neg x_2) \\land (\\neg x_1 \\lor \\neg x_2 \\lor \\neg x_3) \\land (x_1 \\lor x_2) \\dots$$

Both problems share the exact same representation:
$$c = (x_1, x_2, \\dots, x_n) \\in \\{0, 1\\}^n, \\qquad |C| = 2^n$$

#### How Their Evaluation Functions Differ (Slide 25):
* **Standard SAT (Binary Evaluation)**:
  $$f_{\\text{SAT}}(c) = \\begin{cases} 1 & \\text{if } c \\text{ satisfies all } m \\text{ clauses} \\\\ 0 & \\text{otherwise} \\end{cases}$$
  * *The Needle in a Haystack*: A configuration satisfying 49 out of 50 clauses receives $f=0$, exactly the same score as one satisfying 0 clauses! There is zero gradient to guide search.
* **Max-SAT (Gradual Evaluation)**:
  $$f_{\\text{MaxSAT}}(c) = \\sum_{i=1}^m \\text{TruthValue}(\\text{clause}_i)$$
  * *Smooth Guidance Landscape*: Satisfying 49 clauses ($f=49$) is recognized as substantially better than satisfying 20 clauses ($f=20$). Local search algorithms can follow the gradient toward the optimum!
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
### Graph Coloring (Slides 28–30)

Given an undirected graph $G = (V, E)$ with $k = |V|$ vertices:
* **Vertex Coloring Goal**: Assign colors to vertices such that no two adjacent vertices share the same color.
* **Chromatic Number $\\chi(G)$**: The minimum number of colors needed for a valid coloring.

#### The Fixed-$r$ Combinatorial Formulation (Slide 30):
* **Representation**: Integer vector of length $k$:
  $$c = (c_0, c_1, \\dots, c_{k-1}), \\quad c_i \\in \\{0, 1, \\dots, r-1\\}, \\quad |C| = r^k$$
* **Evaluation Function**: Counts monochromatic edges (conflicts):
  $$f(c) = \\sum_{(i, j) \\in E} \\mathbb{I}[c_i = c_j]$$
* **Optimization Criterion**:
  $$c^* = \\arg\\min_{c \\in C} f(c)$$

#### Interpretation:
* If $f(c^*) = 0$: The graph is validly $r$-colorable!
* To determine the chromatic number $\\chi(G)$, we test descending values of $r$ until no zero-conflict solution can be found.
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
* **Evaluation**: Total tour length returning to start:
  $$d_P = \\sum_{i=0}^{N-1} d(c_i, c_{(i+1) \\bmod N})$$

#### Permutations vs. Unique Geometric Tours (Slide 34):
* There are $N!$ total permutations.
* A tour $A \\to B \\to C \\to D \\to A$ can be written with $N$ different starting cities: $(A, B, C, D)$, $(B, C, D, A)$, etc.
* In **symmetric TSP** ($d(i, j) = d(j, i)$), traversing in reverse represents the identical tour!
$$\\text{Total Unique Tours} = \\frac{N!}{2N} = \\frac{(N - 1)!}{2}$$

| $N$ Cities | Permutations $N!$ | Unique Tours $\\frac{(N-1)!}{2}$ | Time at $10^6$ evals/sec |
|:---|:---:|:---:|:---:|
| 5 | $120$ | $12$ | $< 1$ millisecond |
| 10 | $3,628,800$ | $181,440$ | $0.18$ seconds |
| 20 | $\\approx 2.43 \\times 10^{18}$ | $\\approx 6.08 \\times 10^{16}$ | $\\approx 1,928$ years |
| 100 | $\\approx 9.33 \\times 10^{157}$ | $\\approx 4.67 \\times 10^{155}$ | $\\approx 3 \\times 10^{144}$ years |

Exhaustive search is physically impossible for even moderate instances, proving the necessity of metaheuristics.
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
### Definitions (Slide 45)
* **Heuristic**: Problem-specific rule of thumb (e.g. Nearest Neighbor for TSP). Fast, but does not generalize to other problems.
* **Metaheuristic**: A **general algorithmic framework** that can be instantiated for virtually any optimization problem by specifying:
  1. A representation of candidate solutions;
  2. An evaluation function $f(c)$;
  3. Variation operators that generate or modify solutions.

#### The Three Families of Metaheuristics (Slide 49):
1. **Trajectory-Based**: Starts from a single candidate solution and moves through the search space iteratively along a trajectory (e.g., Hill Climbing, Simulated Annealing, Tabu Search).
2. **Constructive**: Progressively builds a solution element-by-element using problem knowledge and randomness (e.g., Ant Colony Optimization, GRASP).
3. **Population-Based**: Maintains a pool of diverse candidate solutions, recombining and mutating their information to produce superior generations (e.g., Genetic Algorithms, Evolutionary Strategies).
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
### The Core Balancing Act (Slides 47–48, 50)

Every effective optimization algorithm must strike a balance between two opposing forces:

#### 1. Intensification (Exploitation)
* **Definition**: Concentrating search effort around currently promising solutions to refine and climb local peaks.
* **Mechanism**: Small neighborhood modifications, greedy improvements, gradient descent.
* **Risk if excessive**: Premature convergence—the algorithm gets trapped permanently in a mediocre local optimum!

#### 2. Diversification (Exploration)
* **Definition**: Forcing the search to visit distant, unexplored regions of the configuration space.
* **Mechanism**: Random jumps, mutations, high acceptance temperature in annealing, random restarts.
* **Risk if excessive**: Pure random search—the algorithm wastes all its computational budget wandering aimlessly without polishing high-quality candidates.
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

import type { LessonData } from '../types/course';

export const LESSON_8_DATA: LessonData = {
  id: 'lesson-8',
  number: 8,
  title: 'Population-Based Metaheuristics: Genetic Algorithms',
  subtitle:
    'Evolutionary computation, chromosomes, selection operators, crossover, mutation, elitism, and real-world robot locomotion optimization',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 58,
  overview:
    'Explores population-based metaheuristics inspired by Darwinian natural selection. Contrasts single-trajectory local search (Hill Climbing) with population-wide parallel search across distinct regions of configuration space. Formalizes chromosome representation (genotype vs. phenotype), fitness evaluation functions, selection mechanisms (Roulette Wheel / Fitness Proportional, Tournament, and Rank Selection), recombination (1-point, 2-point, uniform crossover), and mutation operators. Analyzes the generational replacement cycle and the mathematical necessity of elitism to guarantee monotonic convergence. Features an authentic case study from published UCLM research: optimizing Sony AIBO quadruped robot locomotion parameters through a hybrid Genetic Algorithm with a Machine Learning surrogate evaluation model.',
  prerequisites: [
    'Combinatorial Optimization problem formulation (Lesson 6)',
    'Local search and landscape pathologies (Lesson 7)',
    'Probability distributions and random sampling',
  ],
  learningObjectives: [
    'Contrast trajectory-based search with population-based evolutionary search.',
    'Distinguish genotype (chromosome encoding) from phenotype (expressed solution candidate).',
    'Calculate selection probabilities under Fitness Proportional (Roulette Wheel) Selection and construct cumulative probability intervals.',
    'Trace Tournament Selection and analyze the impact of tournament size k on selection pressure.',
    'Execute 1-point, 2-point, and uniform crossover operators, tracing offspring gene inheritance.',
    'Formulate bit-flip and swap mutation, establishing standard mutation probability bounds (e.g. pm = 1/L).',
    'Explain the role of elitism in preventing the accidental loss of top-performing candidate solutions.',
    'Analyze the UCLM Sony AIBO robot locomotion optimization paper: gait parameters, physical evaluation noise, and ML surrogate fitness filtering.',
  ],
  chapters: [
    {
      id: 'evolutionary-principles-and-representation',
      number: 1,
      title: 'Biological Foundations & Chromosome Encodings',
      slideRange: 'Slides 1–14',
      description:
        'Biological inspiration, genotypes vs. phenotypes, binary strings, integer vectors, permutations, and initial population generation.',
      sections: [
        {
          id: 'biological-metaphor-and-population',
          title: 'The Darwinian Metaphor & Population-Based Search',
          slideRef: { lessonId: 'lesson-8', slideNumber: '1–6' },
          summary: 'Natural selection, survival of the fittest, and parallel exploration of configuration space.',
          content: `### From Trajectories to Populations

While Hill Climbing (Lesson 7) maintains a **single trajectory** $\\{x_0, x_1, \\dots, x_k\\}$, Genetic Algorithms maintain a **population** of $N$ candidate solutions:
$$P(t) = \\{x_1^t, x_2^t, \\dots, x_N^t\\}$$

#### Biological Mapping
| Biology | Genetic Algorithm |
| :--- | :--- |
| **Individual / Organism** | Candidate solution configuration |
| **Chromosome / Genotype** | Encoded data structure (e.g., bitstring, permutation) |
| **Gene / Allele** | Single decision variable / specific value assigned |
| **Phenotype** | Physical solution decoded into problem domain |
| **Fitness / Environment** | Objective function $f(x)$ evaluating solution quality |
| **Natural Selection** | Selection operator favoring higher fitness individuals |
| **Recombination / Reproduction** | Crossover operator combining traits from two parents |
| **Mutation** | Random perturbation introducing novel genetic diversity |

#### Why Populations?
1. **Parallel Exploration**: Explores multiple diverse basins of attraction simultaneously.
2. **Recombination (Crossover)**: Combines building blocks (sub-solutions) discovered independently by different individuals.
3. **Robustness**: Far less prone to premature entrapment in narrow local peaks compared to single-point search.`,
          keyTakeaways: [
            'Evolves a population of N individuals across discrete generations.',
            'Crossover combines building blocks from different parents.',
            'Explores multiple search space regions in parallel.',
          ],
        },
        {
          id: 'genotype-phenotype-encodings',
          title: 'Chromosome Encodings: Binary, Integer, and Permutations',
          slideRef: { lessonId: 'lesson-8', slideNumber: '7–14' },
          summary: 'Mapping problem variables to chromosomes and avoiding infeasible decodings.',
          content: `### Encodings and Solution Validity

A chromosome is a structured string representing decision variables:
1. **Binary Encoding ($\\{0, 1\\}^L$)**:
   - Canonical representation for knapsack, subset sum, and boolean satisfiability.
   - Example: $x = (1, 0, 1, 1, 0)$ indicates items 1, 3, and 4 are selected.
2. **Integer / Discrete Encoding ($\\{1, \\dots, r\\}^n$)**:
   - Used for fixed-$r$ graph coloring and assignment problems.
   - Example: $c = (2, 1, 3, 2, 1)$ assigns colors to vertices $V_1$ through $V_5$.
3. **Permutation Encoding**:
   - Used for TSP and scheduling where all items must appear exactly once without duplicates.
   - Standard crossover operators on permutations produce duplicate cities; requires specialized operators (e.g., Order Crossover OX, PMX).
4. **Real-Valued / Continuous Encoding**:
   - Directly encodes floating-point parameters (e.g., robot joint angles, neural network weights).`,
          keyTakeaways: [
            'Binary strings suit subset selection; permutations suit ordering problems.',
            'The choice of encoding dictates which crossover and mutation operators are valid.',
          ],
        },
      ],
    },
    {
      id: 'selection-and-genetic-operators',
      number: 2,
      title: 'Selection, Crossover & Mutation Operators',
      slideRange: 'Slides 15–38',
      description:
        'Roulette wheel selection, tournament selection, 1-point, 2-point, and uniform crossover, bit-flip mutation, and elitism.',
      sections: [
        {
          id: 'selection-mechanisms',
          title: 'Selection Mechanisms: Roulette Wheel & Tournament Selection',
          slideRef: { lessonId: 'lesson-8', slideNumber: '15–24' },
          summary: 'Mathematical formulation of fitness proportional selection and tournament selection.',
          content: `### 1. Fitness Proportional (Roulette Wheel) Selection

Each individual $i$ in a population of size $N$ is assigned a selection probability strictly proportional to its fitness $f_i$:
$$P(\\text{select } i) = \\frac{f_i}{\\sum_{j=1}^N f_j}$$

#### Constructing the Roulette Wheel (Exam Step)
1. Calculate total population fitness: $F = \\sum_{j=1}^N f_j$.
2. Compute relative probabilities: $p_i = f_i / F$.
3. Compute cumulative probabilities: $q_i = \\sum_{k=1}^i p_k$ with $q_0 = 0$.
4. Generate uniform random spin $r \\sim U[0, 1)$. Select individual $i$ such that $q_{i-1} \\le r < q_i$.

> **Limitation**: When fitness differences are tiny (e.g., $f_1=1000, f_2=1001$), selection is nearly uniform (weak selection pressure). When one individual dominates ($f_1=1000, f_2=10$), it quickly monopolizes the population, causing premature convergence.

---

### 2. Tournament Selection
1. Randomly sample $k$ individuals from the population with replacement ($k$ is tournament size, typically $k=2$ or $k=3$).
2. The individual with the highest fitness among the $k$ contenders wins the tournament and is selected for reproduction.
- **Selection Pressure**: Easily tuned by adjusting $k$. Larger $k$ increases selection pressure without requiring fitness scaling.`,
          keyTakeaways: [
            'Roulette wheel assigns probability proportional to fitness: P(i) = f(i) / sum(f).',
            'Tournament selection samples k random individuals and chooses the best.',
            'Tournament selection is invariant to linear fitness offsets f(x) + c.',
          ],
        },
        {
          id: 'crossover-and-mutation',
          title: 'Recombination (Crossover) and Mutation Operators',
          slideRef: { lessonId: 'lesson-8', slideNumber: '25–38' },
          summary: '1-point, 2-point, and uniform crossover; bit-flip mutation and the necessity of elitism.',
          content: `### Crossover and Recombination Operators (Slides 25–38)

With probability $p_c$ (typically $p_c \\in [0.6, 0.95]$), two selected parents undergo genetic recombination:

| Operator | Applicable Representation | Mechanism | Key Property |
| :--- | :--- | :--- | :--- |
| **1-Point Crossover** | Binary, Discrete Integer | Single cut point $k$; swap tails | High positional bias (genes at opposite ends separated) |
| **2-Point Crossover** | Binary, Discrete Integer | Two cut points $k_1 < k_2$; swap middle segment | Reduced positional bias; treats chromosome as a ring |
| **Uniform Crossover** | Binary, Discrete Integer | Independent 50/50 coin flip per gene position | Zero positional bias; high distributional disruption |
| **Order Crossover (OX1)** | Permutations (TSP) | Preserves relative order and subset from parents | **Guarantees zero duplicate or missing cities!** |

#### The Order Crossover (OX1) Algorithm for TSP (Exam Crucial):
1. Select two cut points $k_1 < k_2$ at random.
2. Copy the swath of cities between $k_1$ and $k_2$ from Parent 1 directly into Offspring 1 at the identical indices.
3. Starting from index $k_2 + 1$ in Parent 2 (wrapping around cyclically to index 0), collect all remaining cities that are **not already present** in the swath.
4. Insert these cities in order into Offspring 1 starting from index $k_2 + 1$ (wrapping cyclically).
5. Repeat symmetrically with Parent 2 copied into Offspring 2.

---

### Mutation Operators across Representations:
With probability $p_m$ per gene (standard canonical rate: $p_m = 1/L$, where $L$ is chromosome length):
- **Binary**: **Bit-Flip** ($0 \\leftrightarrow 1$).
- **Permutation**: **Swap Mutation** (exchange two distinct city indices), **Inversion Mutation** (reverse an internal subsegment), or **Scramble Mutation** (randomly permute an internal subsegment).

---

### Elitism: Preserving Historical Champions
- In pure generational replacement, stochastic crossover and destructive mutation can accidentally destroy the highest-fitness individual found.
- **Elitism**: Copies the top $e$ individuals ($e \\in \\{1, 2\\}$) into the next generation without modification.
- **Convergence Guarantee**: Elitist Genetic Algorithms guarantee that the best-so-far fitness $f(x^*)$ is **monotonically non-decreasing**:
  $$f(x^*)_{t+1} \\ge f(x^*)_t$$

*Experiment with 1-point, 2-point, uniform, and Order Crossover (OX1) live in the interactive laboratory below!*`,
          keyTakeaways: [
            '1-point and 2-point crossover exchange contiguous blocks of genes.',
            'Mutation rate pm is typically set to 1/L to average one mutation per chromosome.',
            'Elitism guarantees that the best fitness never degrades from generation to generation.',
          ],
        },
      ],
    },
    {
      id: 'aibo-case-study',
      number: 3,
      title: 'UCLM Case Study: AIBO Robot Locomotion Optimization',
      slideRange: 'Published UCLM Research',
      description:
        'Real-world genetic algorithm optimization of quadruped gait parameters combined with machine learning surrogate models (Alonso, Gámez, García-Varea, Martínez).',
      sections: [
        {
          id: 'aibo-problem-and-parameters',
          title: 'The Sony AIBO Locomotion Challenge & Chromosome Parameters',
          slideRef: { lessonId: 'lesson-8', slideNumber: 'Paper: Alonso et al.' },
          summary: 'Parameterizing quadruped walking gaits and the cost of physical robot evaluation.',
          content: `### Quadruped Walking Gait Optimization

In mobile legged robots (Sony AIBO), walking speed is determined by coordinated trajectory parameters. Manually tuning these parameters is exceptionally difficult due to complex non-linear contact dynamics with the ground.

#### Chromosome Representation (Table 1 of UCLM Paper)
The genetic algorithm optimizes a vector of real-valued gait parameters:
- **$PG$**: Step period in units of $0.008\\text{ s}$ (e.g., $PG=65 \\implies 0.52\\text{ s}$ per step).
- **$hF$**: Front body height in millimeters ($100\\text{--}140\\text{ mm}$).
- **$hB$**: Rear body height in millimeters ($100\\text{--}140\\text{ mm}$).
- **$hdF$**: Clearance height for lifting front paws during swing phase.
- **$hdB$**: Clearance height for lifting rear paws during swing phase.
- **$ff_0, fs_0$**: Initial front paw offset coordinates.
- **$bf_0, bs_0$**: Initial rear paw offset coordinates.

#### The Physical Evaluation Bottleneck
Evaluating a candidate configuration on the physical robot requires placing the robot on a carpet, measuring distance traveled over $t=30\\text{ seconds}$, and computing:
$$f(P) = \\frac{d_{\\text{recorrida}}}{t} \\quad (\\text{cm/s})$$

- Physical runs cause mechanical wear and tear, drain batteries, and take immense wall-clock time (evaluating 1000 individuals would take over 10 hours!).
- Moreover, sensor measurement is subject to significant physical noise.`,
          keyTakeaways: [
            'The chromosome encodes 9 geometric and temporal gait parameters (PG, hF, hB, hdF, hdB, offsets).',
            'Fitness is real measured forward speed: f(P) = distance / time (cm/s).',
            'Physical evaluations are expensive, slow, and noisy.',
          ],
        },
        {
          id: 'ml-surrogate-model',
          title: 'Hybrid Evolutionary Computation with ML Surrogate Fitness',
          slideRef: { lessonId: 'lesson-8', slideNumber: 'Paper Section 5' },
          summary: 'Using machine learning classifiers to predict fitness and filter unpromising individuals.',
          content: `### The UCLM Novel Hybrid Architecture

To overcome the evaluation bottleneck, the UCLM team (Alonso, Gámez, García-Varea, Martínez) combined the Genetic Algorithm with a **Machine Learning surrogate model** trained on previous gait data.

#### 1. Surrogate Fitness Estimation
Before placing the robot on the physical track, an ML classifier estimates the candidate's fitness $\\hat{f}_e$ and categorizes it into three qualitative tiers:
$$\\text{Tier} \\in \\{\\text{Buena (Good)}, \\text{Regular (Average)}, \\text{Mala (Poor)}\\}$$

#### 2. Probabilistic Evaluation Gate
Three acceptance thresholds $\\alpha_1, \\alpha_2, \\alpha_3$ determine whether the candidate is actually tested on the physical robot:
- If $\\hat{f}_e \\in \\text{Buena} \\land U[0, 1] \\le \\alpha_1$: **Evaluate physically**.
- If $\\hat{f}_e \\in \\text{Regular} \\land U[0, 1] \\le \\alpha_2$: **Evaluate physically**.
- If $\\hat{f}_e \\in \\text{Mala} \\land U[0, 1] \\le \\alpha_3$: **Evaluate physically**.
- Otherwise: **Skip physical run** and assign the predicted surrogate fitness!

#### 3. Combating Sensor Noise: Re-evaluation
Due to carpet friction variability and battery discharge, a lucky run can falsely inflate fitness. The UCLM system applies a re-evaluation strategy ($2^{n-1}$ rule), averaging repeated physical trials for individuals selected as elite survivors.`,
          keyTakeaways: [
            'ML surrogate predicts fitness class (Buena, Regular, Mala) before running physical trials.',
            'Filters out over 60% of unpromising candidates, dramatically accelerating optimization.',
            'Re-evaluates elite candidates to prevent noise from propagating false champions.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'prop-ex-roulette-wheel',
      title: 'Fitness Proportional Selection (Roulette Wheel Calculation)',
      slideRef: { lessonId: 'lesson-8', slideNumber: 21 },
      problemStatement:
        'A population of 4 individuals has fitness values: f1 = 12, f2 = 24, f3 = 8, f4 = 16. Calculate: 1) Total fitness F, 2) Relative selection probabilities pi for each individual, 3) Cumulative probability intervals qi. Given a random spin r = 0.65, which individual is selected for reproduction?',
      formalization: {
        stateSpace: 'Population P = {Ind1, Ind2, Ind3, Ind4}. Fitness vector = (12, 24, 8, 16).',
        initialState: 'Total fitness F = 12 + 24 + 8 + 16 = 60.',
        actions: 'Compute pi = fi / 60. Compute cumulative qi = sum(p1..pi).',
        successorFunction: 'Find interval [q_{i-1}, q_i) containing r = 0.65.',
        goalTest: 'Identify correctly selected individual.',
        pathCost: 'Relative selection probabilities.',
      },
      solutionExplanation:
        '1) Total fitness F = 12 + 24 + 8 + 16 = 60. 2) Relative probabilities: p1 = 12/60 = 0.20 (20%); p2 = 24/60 = 0.40 (40%); p3 = 8/60 = 0.133 (13.3%); p4 = 16/60 = 0.267 (26.7%). 3) Cumulative intervals: Ind1: [0.00, 0.20); Ind2: [0.20, 0.60); Ind3: [0.60, 0.733); Ind4: [0.733, 1.00). 4) For r = 0.65, 0.60 <= 0.65 < 0.733, so Individual 3 is selected!',
      hasInteractiveTool: true,
      interactiveToolId: 'genetic-algorithm-lab',
    },
    {
      id: 'prop-ex-crossover-cut',
      title: '1-Point and 2-Point Crossover Tracing',
      slideRef: { lessonId: 'lesson-8', slideNumber: 28 },
      problemStatement:
        'Consider two 8-bit parents: P1 = [1, 1, 0, 0, 1, 0, 1, 1] and P2 = [0, 0, 1, 1, 0, 1, 0, 0]. 1) Perform 1-point crossover with cut point after bit 3. Determine both offspring. 2) Perform 2-point crossover with cuts after bit 2 and bit 6. Determine both offspring.',
      formalization: {
        stateSpace: 'Bitstrings of length L = 8.',
        initialState: 'P1 = 11001011, P2 = 00110100.',
        actions: '1-point cut at 3. 2-point cuts at 2 and 6.',
        successorFunction: 'Swap gene segments.',
        goalTest: 'Exact bit sequence of offspring.',
        pathCost: 'Hamming distance.',
      },
      solutionExplanation:
        '1) 1-point crossover (cut after index 3): P1 is split as [110 | 01011], P2 is split as [001 | 10100]. Swapping tails gives: Offspring 1 = [1, 1, 0, 1, 0, 1, 0, 0] (11010100), Offspring 2 = [0, 0, 1, 0, 1, 0, 1, 1] (00101011). 2) 2-point crossover (cuts after 2 and 6): P1 is [11 | 0010 | 11], P2 is [00 | 1101 | 00]. Swapping the middle segment gives: Offspring 1 = [1, 1, 1, 1, 0, 1, 1, 1] (11110111), Offspring 2 = [0, 0, 0, 0, 1, 0, 0, 0] (00001000).',
      hasInteractiveTool: true,
      interactiveToolId: 'crossover-mutation-playground',
    },
  ],
};

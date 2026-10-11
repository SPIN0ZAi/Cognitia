# Cognitia — Intelligent Systems Interactive Learning Platform

> **Sistemas Inteligentes 2026/2027**  
> Degree in Computer Science · Escuela Superior de Ingeniería Informática de Albacete  
> **Universidad de Castilla-La Mancha (UCLM)**  
> *Course Professors: M. Julia Flores, José A. Gámez, Ismael G. Varea*  
> *Original Materials: L. de la Ossa, J. Flores, J.A. Gámez, I. García Varea, J.M. Puerta*

Cognitia is an interactive, academically rigorous university textbook and simulation platform built for the **Intelligent Systems** curriculum at UCLM. It delivers 100% of the educational content across the first three authoritative lecture slide decks, with worked examples, mathematical derivations, and live algorithm simulations.

---

## 🌟 Academic Scope & Lecture Coverage

Cognitia faithfully covers all concepts, formulas, definitions, algorithms, and exercises across the course materials:

### 📘 Lesson 1: Introduction to Artificial Intelligence
- **Foundations & Definitions**: McCarthy's 1956 Dartmouth definition, Minsky vs. Sir Roger Penrose consciousness debate, Strong vs. Weak AI (Narrow AI).
- **Core Paradigms**: Connectionist vs. Symbolic AI, physical symbol systems, rational action and utility maximization ($f: \mathcal{P}^* \to \mathcal{A}$).
- **Historical Evolution (300 BC – 2026)**: Aristotle's syllogisms, Boole's propositional logic, 1943 McCulloch-Pitts artificial neuron, Turing (1950), ELIZA (1964), DENDRAL & MYCIN (KBS boom), AI Winters, Deep Blue (1997), AlexNet (2012), Transformers (2017), Generative AI & Foundation Models (2020–2025), and 2026 Reasoning Agents.
- **Ethics & Controversies**: Present harms vs. frontier existential risks, International AI Safety Report 2026 (Yoshua Bengio, Geoffrey Hinton Nobel speech, Yann LeCun counterpoint), NIST AI Risk Management Framework (Govern, Map, Measure, Manage), UNESCO 10 Core Principles, and corporate accountability policies (Microsoft 2026).

### 🔍 Lesson 2: State Space Search — Uninformed Search
- **Agents & Environments**: PEAS task specifications (Performance, Environment, Actuators, Sensors) with Autonomous Taxi case study; Reflex Agent vacuum world ($[A, \text{Dirty}]$) across 8 states.
- **Formal Search Problem Definition**: 6 formal components:
  1. State space
  2. Initial state
  3. Action space
  4. Successor function $\text{Successor}(s, a)$
  5. Goal test $\text{TestGoal}(s)$
  6. Path cost $g(s) = \sum c(s, a, s')$
- **Search Tree vs. Graph Search**: State vs. Node data structures (`node.STATE`, `node.PARENT`, `node.ACTION`, `node.COST`, `node.DEPTH`), redundant paths, and loopy paths leading to infinite trees. Explored/closed set management.
- **Search Strategies & Complexity**: Branching factor $b$, shallowest goal depth $d$, maximum path length $m$:
  - **Breadth-First Search (BFS)**: FIFO queue, complete ($b < \infty$), time $\mathcal{O}(b^{d+1})$, space $\mathcal{O}(b^{d+1})$, optimal when step costs are equal. Exponential memory explosion proof.
  - **Uniform-Cost Search (UCS)**: Priority queue ordered by $g(n)$, complete and optimal with step costs $\ge \epsilon$, complexity $\mathcal{O}(b^{1 + \lfloor C^* / \epsilon \rfloor})$.
  - **Depth-First Search (DFS)**: LIFO stack, tree space $\mathcal{O}(bm)$, time $\mathcal{O}(b^m)$, incomplete in tree search due to cycles.
  - **Depth-Limited Search (DLS)**: Depth limit $l$, resolves infinite paths, $\mathcal{O}(b^l)$ time, $\mathcal{O}(bl)$ space.
  - **Iterative Deepening Search (IDS)**: Progressive depth limits, optimal and complete with uniform step costs, linear space $\mathcal{O}(bd)$, worst-case nodes generated $N(\text{IDS}) = \sum_{i=1}^d (d - i + 1) b^i$.
- **Proposed Lecture Problems**:
  - *Missionaries & Cannibals* (Slide 78): Cycle testing proof and 11-step optimal solution.
  - *Water Jugs Problem* (Slide 79): 4L and 3L measuring puzzle with 6-step BFS solution.
  - *8-Queens Problem* (Slide 80): Incremental formulation vs. complete-state board formulation.

### 🧭 Lesson 3: Heuristic Search — Informed Search
- **Heuristic Evaluation Functions**: $f(n) = g(n) + h(n)$, relaxed problem formulations, straight-line distance heuristic.
- **Greedy Best-First Search**: $f(n) = h(n)$, priority queue ordered by heuristic estimation, incomplete in tree search (loops), suboptimal.
- **$A^*$ Search & Optimality Proof**:
  - **Admissibility**: $h(n) \le h^*(n)$ (never overestimates). Full mathematical proof that $A^*$ tree search is optimal with an admissible heuristic ($f(n) \le C^* < f(G_{SO})$).
  - **Consistency (Monotonicity)**: $h(n) \le c(n, a, n') + h(n') \implies f(n') \ge f(n)$. Proof that consistent heuristics produce non-decreasing $f$-contours, ensuring the first goal expanded in graph search is optimal.
  - **Node Reopening**: Graph search with node reopening enables admissibility alone to guarantee optimality.
- **8-Puzzle Heuristics & Dominance**:
  - $h_1$: Misplaced tiles count (Slide 46).
  - $h_2$: Sum of Manhattan distances (Slide 46).
  - Mathematical proof of dominance: $\forall n, h_2(n) \ge h_1(n) \implies A^*(h_2)$ expands fewer or equal nodes than $A^*(h_1)$.
  - Pattern Databases and sub-problem exact table lookups.
- **Effective Branching Factor ($b^*$)**:
  - Polynomial definition: $N + 1 = 1 + b^* + (b^*)^2 + \dots + (b^*)^d$.
  - Benchmark analysis of $b^*$ table from Slide 48 (IDS vs. $A^*(h_1)$ vs. $A^*(h_2)$ at depths $d=2, 12, 24$).
- **Proposed Exercises**:
  - *Pancake Sorting Problem* (Slide 54): Spatula flips, variable costs, and admissible gap heuristic.
  - *8-Puzzle Greedy Trace* (Slide 55): Step-by-step evaluation using operator sequence (Up, Down, Left, Right).

---

## ⚡ Interactive Learning Visualizers & Simulators

Cognitia features **11 custom interactive visualizers** developed specifically for this curriculum:

1. **Romania Route Search Simulator**:
   - Interactive SVG map connecting all 20 Romanian cities with exact road costs and straight-line distances to Bucharest.
   - Live execution engine for BFS, UCS, DFS, DLS, Greedy Best-First, and $A^*$.
   - Interactive Priority Queue / Frontier inspector showing $g(n)$, $h(n)$, and $f(n)$ rankings, step-by-step or automated animated playback, and graph vs. tree mode toggle.
2. **8-Puzzle Heuristic Explorer**:
   - Playable tile grid with lecture presets (Lesson 3 Slide 46 sample, Lesson 2 Slide 15 initial, Slide 55 Exercise 2).
   - Real-time calculation of $h_1$ (misplaced tiles) and $h_2$ (Manhattan distance) with tile-by-tile coordinate vectors.
3. **Vacuum World Reflex Agent**:
   - Two-room ($A$ and $B$) vacuum simulation executing the exact agent program from Lesson 2 Slide 6 across the 8-state space.
4. **Missionaries and Cannibals Simulator**:
   - Interactive river crossing puzzle with constraint verification and an automated 11-step BFS solver demonstrating why cycle checking is crucial.
5. **Water Jugs Simulator**:
   - Animated 4-litre and 3-litre water vessels with pump filling, emptying, and cross-pouring operations, with automated 6-step BFS solver.
6. **8-Queens Conflict Visualizer**:
   - Interactive 8x8 chessboard with ray-cast collision detection across rows, columns, and diagonals, plus an automated solver revealing all 92 valid configurations.
7. **Pancake Sorting Simulator**:
   - Multi-layer pancake stack with spatula flips at positions 1, 2, and 3, step-by-step cost accounting, and heuristic gap estimation.
8. **Deductive Proof of $A^*$ Optimality**:
   - Step-by-step interactive proof inspector tracing why $f(n) \le C^* < f(G_{SO})$ prevents suboptimal goal expansion.
9. **Effective Branching Factor ($b^*$) Calculator**:
   - Binary search root-finding solver for the polynomial $N + 1 = \sum_{i=0}^d (b^*)^i$, with live comparison against the Slide 48 benchmark table.
10. **McCulloch-Pitts Artificial Neuron (1943)**:
    - Interactive threshold gate simulator with adjustable weights $w_1, w_2$, inputs $x_1, x_2$, and threshold $\theta$, including presets for Boolean AND, OR, and linear separability checks.
11. **Interactive AI History Timeline (300 BC – 2026)**:
    - Filterable chronological timeline linking foundational philosophical milestones to modern reasoning models and agentic workflows.

---

## 🛠️ Essential Study Features

- **Global Instant Search (`Ctrl + K` / `⌘K`)**: Fast keyword search across all 3 lessons, glossary terms, definitions, and practice questions.
- **Practice & Examination Engine**: Multiple-choice and step-by-step calculation problems derived from lecture slides, with detailed step-by-step reasoning and instant feedback.
- **Academic Glossary**: 24 core terms with formal mathematical definitions, slide citations, and "Common Confusions" clarifying subtle distinctions (e.g., Tree Search vs. Graph Search, Admissibility vs. Consistency).
- **Persistent Progress Tracking**: Tracks section reading completion, quiz scores, and bookmarks in `localStorage`, with a 1-click "Resume Study" button.

---

## 🎨 Design Philosophy

Inspired by the restrained, tactile, dark-editorial interface of [dqnamo.com/kitchen](https://www.dqnamo.com/kitchen):
- **Deliberate Typography**: Clean hierarchy using system sans-serif and high-legibility monospace fonts (`JetBrains Mono`, `Fira Code`) for algorithmic code and formulas.
- **Compressible Tactile Controls**: Physical button press states (`active: translateY(1px)`), subtle borders, and deep charcoal backgrounds (`#080b11`, `#0f172a`).
- **Zero AI Clichés**: No arbitrary floating particles, no meaningless gradient blobs, no decorative placeholder cards. Every visual element communicates academic data.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation & Local Run
```bash
# Clone the repository
git clone https://github.com/SPIN0ZAi/Cognitia.git
cd Cognitia

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build & Preview
```bash
# Typecheck and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Deployment on Vercel

Cognitia is preconfigured for zero-config deployment on **Vercel**:

1. Push your changes to the GitHub repository: `https://github.com/SPIN0ZAi/Cognitia.git`.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `SPIN0ZAi/Cognitia` repository.
4. Select **Vite** as the framework preset (Build Command: `npm run build`, Output Directory: `dist`).
5. Click **Deploy**.

---

## 📄 Academic Attribution & License

- **Course**: Sistemas Inteligentes, Degree in Computer Science, Universidad de Castilla-La Mancha (UCLM).
- **Lecturers**: M. Julia Flores, José A. Gámez, Ismael G. Varea.
- **Original Slide Material Authors**: L. de la Ossa, J. Flores, J.A. Gámez, I. García Varea, J.M. Puerta.
- Course materials preserved under fair academic educational use. Platform implementation released under the MIT License.

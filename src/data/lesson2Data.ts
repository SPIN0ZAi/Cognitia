import type { LessonData } from '../types/course';

export const LESSON_2_DATA: LessonData = {
  id: 'lesson-2',
  number: 2,
  title: 'State Space Search: Uninformed Search',
  subtitle: 'Problem-solving agents, formal formulation, tree vs graph search, and classic uninformed strategies',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 80,
  overview:
    'A foundational treatment of autonomous problem solving via state space search. Begins with the mathematical model of intelligent agents ($f: \\mathcal{P}^* \\to \\mathcal{A}$), PEAS task environment specifications, and offline planning. Formalizes search problems through six rigorous components. Explores the critical distinction between state spaces and search trees, node data structures, redundant and loopy paths, and the graph search closed list. Analyzes five fundamental uninformed search algorithms—Breadth-First Search (BFS), Uniform-Cost Search (UCS), Depth-First Search (DFS), Depth-Limited Search (DLS), and Iterative Deepening (IDS)—evaluating completeness, optimality, time, and space complexity.',
  prerequisites: [
    'Basic concepts of agents and rationality (Lesson 1)',
    'Data structures: Queues, Priority Queues, Stacks, Trees, Graphs',
    'Asymptotic complexity notation ($O, \\Omega, \\Theta$)',
  ],
  learningObjectives: [
    'Formulate arbitrary computational challenges into formal 6-component state space search problems.',
    'Differentiate between abstract world states and instantiated search tree nodes.',
    'Explain why naive tree search is vulnerable to infinite loops in cyclic spaces and how graph search resolves it.',
    'Implement and trace BFS, UCS, DFS, DLS, and Iterative Deepening Search step-by-step.',
    'Calculate asymptotic time and space complexities using branching factor $b$, goal depth $d$, and max path length $m$.',
    'Model and solve classic benchmark problems: Missionaries & Cannibals, Water Jugs, and 8-Queens.',
  ],
  chapters: [
    {
      id: 'agents-and-environments',
      number: 1,
      title: 'Agents and Environments',
      slideRange: 'Slides 5–12',
      description:
        'The mathematical agent function, the vacuum-cleaner world, PEAS task specification, environment taxonomy, and problem-solving agents.',
      sections: [
        {
          id: 'agent-function-model',
          title: 'The Mathematical Agent Model',
          slideRef: { lessonId: 'lesson-2', slideNumber: 5, note: 'Definition of an Agent' },
          summary:
            'An active entity perceiving via sensors and acting via actuators, governed by the agent function mapping percept histories to actions.',
          content: `
### Formal Mathematical Definition of an Agent

An **agent** is an active entity that perceives its surrounding environment through **sensors** and acts upon that environment through **actuators**.

The fundamental interaction loop between the **environment** and the **agent** operates via two channels:
- **Percepts ($P^*$)**: flow from the environment into the agent's **sensors**.
- **Actions ($A$)**: are chosen by the agent's internal program and executed upon the environment through its **actuators**.

Mathematically, the agent's behavior is fully described by the **agent function** $f$:

$$f: \\mathcal{P}^* \\to \\mathcal{A}$$

* $\\mathcal{P}^*$: The set of all possible **percept sequences** (the complete history of everything the agent has perceived up to the current moment).
* $\\mathcal{A}$: The set of available **actions**.

### Agent Program vs Architecture
The **agent program** is the concrete algorithmic implementation running on the physical computing **architecture** (hardware, sensors, processors, actuators) to realize the mathematical function $f$:

$$\\text{Agent} = \\text{Architecture} + \\text{Program}$$
          `,
          keyTakeaways: [
            'The agent function maps complete percept histories $\\mathcal{P}^*$ to actions $\\mathcal{A}$.',
            'The agent program runs on the physical architecture to compute this function.',
            'Rationality requires selecting the action that maximizes expected performance given the percept history.',
          ],
        },
        {
          id: 'vacuum-cleaner-world',
          title: 'Case Study: The Vacuum-Cleaner World',
          slideRef: { lessonId: 'lesson-2', slideNumber: 6, note: 'Vacuum-cleaner world example' },
          summary:
            'A canonical 2-location environment demonstrating reflex agent functions, state transitions, and rationality.',
          content: `
### Specification of the Vacuum World

Consider an environment consisting of two locations, square **A** and square **B**:
* **Percepts**: A pair $[\\text{Location}, \\text{Status}]$ where Location $\\in \\{A, B\\}$ and Status $\\in \\{\\text{Clean}, \\text{Dirty}\\}$. For example, $[A, \\text{Dirty}]$.
* **Actions**: $\\{ \\text{Left}, \\text{Right}, \\text{Suck}, \\text{NoOp} \\}$.

#### Simple Reflex Agent Function:
A simple reflex agent makes decisions based solely on the current percept, ignoring percept history:
* *If the current position is dirty, then Suck; otherwise change location.*

#### Agent Program Pseudocode:
\`\`\`text
action ReflexVacuumAgent(location, status) {
    if (status == Dirty) then return Suck
    else if (location == A) then return Right
    else return Left
}
\`\`\`

### Evaluating Rationality & The 8-State Space (Slide 12)
Because there are 2 locations, and each can independently be Clean or Dirty, there are $2 \\times 2^2 = 8$ distinct world states. If each movement costs 1 unit of energy and sucking costs 1 unit, what is the optimal action sequence?
Furthermore: **What if the initial state is unknown?** Under partial observability, the agent begins with a belief state containing all 8 possibilities.
          `,
          keyTakeaways: [
            'Reflex agents act on immediate percepts without tracking history.',
            'The 2-room vacuum world has 8 discrete states.',
            'Partial observability forces agents to reason over sets of possible states (belief states).',
          ],
        },
        {
          id: 'peas-specification',
          title: 'Task Environment Specification: PEAS & Environment Types',
          slideRef: { lessonId: 'lesson-2', slideNumber: 7, note: 'PEAS task specification' },
          summary:
            'Defining task environments via Performance measure, Environment, Actuators, and Sensors, and classifying environmental dimensions.',
          content: `
### PEAS Framework

To design a rational agent, the task environment must be rigorously specified across four pillars:

| Pillar | Meaning | Automated Taxi Example (Slide 7) |
|---|---|---|
| **P** (Performance) | Metric measuring success | Safety, time to destination, fuel/profits, traffic legality, passenger comfort |
| **E** (Environment) | The world the agent navigates | Road network, freeways, traffic conditions, pedestrians, weather, road work |
| **A** (Actuators) | How the agent acts | Steering wheel, accelerator pedal, brake, turn signals, horn, display/audio |
| **S** (Sensors) | How the agent perceives | Cameras, microphones, LiDAR, sonar, radar, speedometer, engine sensors, GPS |

### Environmental Dimensions
The nature of the environment largely dictates the internal agent architecture:
1. **Fully Observable vs Partially Observable**: Do sensors provide complete access to the state of the world at any instant?
2. **Deterministic vs Stochastic**: Is the next state completely determined by current state and action, or do random variables / noise play a role?
3. **Episodic vs Sequential**: Does current action choice affect future decisions, or are episodes independent? (Search is fundamentally *sequential*).
4. **Static vs Dynamic**: Does the environment change while the agent is deliberating?
5. **Discrete vs Continuous**: Are states, time, and actions countable or continuous?
6. **Single-Agent vs Multi-Agent**: Does the agent act alone, or are other rational entities competing or cooperating?

*The real world is partially observable, stochastic, sequential, dynamic, continuous, and multi-agent!*
          `,
          keyTakeaways: [
            'PEAS: Performance measure, Environment, Actuators, Sensors.',
            'Search problems assume static, deterministic, fully observable, discrete sequential environments.',
            'Agent design is fundamentally dictated by environment characteristics.',
          ],
        },
        {
          id: 'problem-solving-agents',
          title: 'Problem-Solving Agents & Offline vs Online Search',
          slideRef: { lessonId: 'lesson-2', slideNumber: 9, note: 'Simple problem-solving agent algorithm' },
          summary:
            'Agents that plan: formulating goals, formulating problems, finding an action sequence offline, and executing it.',
          content: `
### Problem-Solving Agents = Agents Who Plan

Unlike reflex agents that react instantaneously, a **problem-solving agent** is a goal-based agent that plans ahead by considering sequences of actions leading to desirable future states.

\`\`\`text
function Simple-Problem-Solving-Agent(percept) returns an action
  static: seq, an action sequence, initially empty
          state, some description of the current world state
          goal, a goal, initially null
          problem, a problem formulation

  state <- Update-State(state, percept)
  if seq is empty then
      goal <- Formulate-Goal(state)
      problem <- Formulate-Problem(state, goal)
      seq <- Search(problem)
  action <- Recommendation(seq, state)
  seq <- Remainder(seq, state)
  return action
\`\`\`

### Offline vs Online Search:
* **Offline Problem Solving**: The agent computes the complete solution path in advance in its simulated model of the world, and then executes the actions **"eyes closed"** (open-loop control). This is valid only in deterministic, static, fully observable environments.
* **Online Problem Solving**: The agent must act in the actual world without complete prior knowledge, interleaving exploration, perception, and action.
          `,
          keyTakeaways: [
            'Problem-solving agents formulate goals and search for action sequences.',
            'Offline search computes the entire path before acting ("eyes closed").',
            'Online search interleaves perception and action under incomplete information.',
          ],
        },
      ],
    },
    {
      id: 'search-problems-formulation',
      number: 2,
      title: 'Formal Formulation of Search Problems',
      slideRange: 'Slides 13–27',
      description:
        'The 6 formal components required to define any state space search problem, with worked formalizations for the 8-puzzle and Romania route finding.',
      sections: [
        {
          id: 'six-components-of-search',
          title: 'The Six Formal Components of a Search Problem',
          slideRef: { lessonId: 'lesson-2', slideNumber: 24, note: 'Formulation of a search problem' },
          summary:
            'Every search problem in AI is formally defined by state space, initial state, actions, successor function, goal test, and path cost.',
          content: `
### The 6 Mandatory Components (Slide 24)

Any problem must be formally defined by the following six components before an algorithm can solve it:

1. **State Space (Espacio de Estados)**:
   A formal representation of what a state is and what information it encodes. Represents all configurations reachable from the initial state.
2. **Initial State (Estado Inicial)**:
   The specific state from which the search begins ($s_0$).
3. **Actions (Acciones)**:
   The set of valid actions that can be applied in any given state: $\\text{Actions}(s)$.
4. **Successor Function (Función Sucesor / Modelo de Transición)**:
   Given a state $s$ and an action $a$, the function $\\text{Successor}(s, a)$ returns the resulting state $s'$. The complete set of successors is generated by applying all valid actions.
5. **Goal Test (Test Objetivo)**:
   A deterministic predicate $\\text{TestGoal}(s) \\to \\{true, false\\}$ that verifies whether a given state satisfies the goal condition. (May be an explicit state or an implicit property test).
6. **Path Cost (Coste del Camino) $g(s)$**:
   A function that assigns a numeric cost to a sequence of actions. Usually additive:
   $$g(s) = \\sum_{i=1}^k c(s_{i-1}, a_i, s_i)$$
   where $c(s, a, s')$ is the **step cost** of taking action $a$ in state $s$ to reach $s'$.
          `,
          keyTakeaways: [
            'Search problems require: State space, Initial state, Actions, Successor function, Goal test, and Path cost.',
            'Step cost $c(s, a, s\')$ defines the incremental edge cost.',
            'Path cost $g(s)$ is the cumulative sum of step costs along the branch.',
          ],
        },
        {
          id: 'example-8-puzzle-formulation',
          title: 'Formal Formulation 1: The 8-Puzzle',
          slideRef: { lessonId: 'lesson-2', slideNumber: 25, note: 'Formulation of the 8-puzzle' },
          summary:
            'A complete formal 6-component specification of the classic 8-puzzle sliding tile problem.',
          content: `
### Formal Specification of the 8-Puzzle (Slide 25)

1. **State space**: All reachable permutations of 8 numbered tiles $\\{1, 2, \\dots, 8\\}$ and 1 blank space in a $3 \\times 3$ grid. ($9! / 2 = 181,440$ reachable states).
2. **Initial state**: Any valid configuration of tiles.
3. **Actions**: Movements of the blank space: $\\{ \\text{Left}, \\text{Right}, \\text{Up}, \\text{Down} \\}$ into adjacent tile positions.
4. **Successor function**: Returns the new board configuration resulting from swapping the blank space with the tile in the specified direction.
5. **Goal test**: Checks if tiles are arranged in ascending numerical order with the gap at the bottom-right corner:
   \`\`\`
   [ 1  2  3 ]
   [ 4  5  6 ]
   [ 7  8  _ ]
   \`\`\`
6. **Path cost**: Each transition costs 1 unit ($c(s, a) = 1$). Total path cost $g(s)$ is the number of moves (depth).
          `,
          keyTakeaways: [
            'Moving tiles into the gap is equivalent to moving the blank space.',
            'Each step has unit cost $c=1$, making path cost equal to solution depth.',
            'Only half of the $9! = 362,880$ permutations are solvable due to parity constraints.',
          ],
        },
        {
          id: 'example-romania-formulation',
          title: 'Formal Formulation 2: Route Finding in Romania',
          slideRef: { lessonId: 'lesson-2', slideNumber: 27, note: 'Formulation of route finding' },
          summary:
            'A complete formal 6-component specification of finding a route between Arad and Bucharest on the Romanian road network.',
          content: `
### Formal Specification of Route Finding (Slide 27)

Given a road map of Romania consisting of 20 cities and interconnecting highways:

1. **State space**: Each state represents a specific city location (e.g., $s \\in \\{\\text{Arad}, \\text{Zerind}, \\dots, \\text{Bucharest}\\}$).
2. **Initial state**: The specified departure city; in our canonical example: $\\text{Arad}$.
3. **Actions**: Traverse an available highway connected to the current city.
4. **Successor function**: Given current city $s$ and chosen road $a$, returns the neighboring destination city.
5. **Goal test**: Checks whether the current city is the target destination: $s == \\text{Bucharest}$.
6. **Path cost**: The total road distance in kilometers, equal to the sum of the lengths of all individual highways traversed along the path.
          `,
          keyTakeaways: [
            'States are discrete city vertices in a road network.',
            'Actions are edge traversals.',
            'Path cost is non-uniform: distances vary between adjacent cities.',
          ],
        },
      ],
    },
    {
      id: 'searching-for-solutions',
      number: 3,
      title: 'Searching for Solutions: Trees, Graphs, and Node Mechanics',
      slideRange: 'Slides 28–47',
      description:
        'Search tree generation, States vs Nodes data structure, the basic tree search algorithm, loopy paths, and the graph search closed list.',
      sections: [
        {
          id: 'states-vs-nodes',
          title: 'Fundamental Distinction: States vs Nodes',
          slideRef: { lessonId: 'lesson-2', slideNumber: 30, note: 'States vs nodes data structure' },
          summary:
            'A state represents a world configuration; a node is a bookkeeping data structure in the search tree containing parent, cost, depth, and action.',
          content: `
### State vs Node: A Crucial Distinction

Students frequently confuse a **state** with a **node**:
* A **state** represents a configuration of the physical world (e.g., "The car is in Arad" or "The 8-puzzle board has tile 1 at top-left").
* A **node** is a computational data structure instantiated in memory as part of the search tree.

#### The Node Data Structure Contains (Slide 30):
* \`STATE\`: The physical state in the state space that this node represents.
* \`PARENT\`: Pointer to the parent node from which this node was generated.
* \`CHILDREN\`: Pointers to generated child nodes.
* \`COST\` ($g(n)$): The total path cost from the root node to this node.
* \`ACTION\`: The action applied to the parent to generate this node.
* \`DEPTH\`: The number of steps along the tree from the root to this node.

> **Crucial Observation**: Two distinct nodes in different branches of the search tree can represent the **exact same physical state**! For instance, in Romania route finding, the city Arad can appear at the root ($depth=0$), and again as a grandchild node via Arad $\\to$ Timisoara $\\to$ Arad ($depth=2$).
          `,
          keyTakeaways: [
            'A state is a world configuration; a node is a search tree data structure.',
            'Nodes track parent pointers, action taken, path cost $g(n)$, and tree depth.',
            'The same state can appear in multiple nodes across different tree branches.',
          ],
        },
        {
          id: 'tree-search-algorithm',
          title: 'The Basic Tree Search Algorithm',
          slideRef: { lessonId: 'lesson-2', slideNumber: 41, note: 'Basic searching algorithm (tree version)' },
          summary:
            'Pseudocode for Tree-Search, node expansion, path recovery, and the role of the frontier / open set.',
          content: `
### Tree-Search Pseudocode (Slide 41)

\`\`\`text
function Tree-Search() returns a solution path or failure
  open <- CreateNode(Initial-State)          // Creates root node
  while open is not empty do
      node <- Extract(open)                  // Selects according to search strategy
      if TestGoal(node.STATE) then
          return RecoverPath(node)           // Solution found
      successors <- Expand(node)
      for each successor in successors do
          Insert(successor, open)            // Adds to frontier
  return failure                             // Frontier exhausted, no solution
\`\`\`

### Node Expansion Pseudocode (Slide 42):
\`\`\`text
function Expand(node) returns set of child nodes
  successors <- empty
  for each action in PossibleActions(node.STATE) do
      newState <- ApplyAction(node.STATE, action)
      newNode <- CreateNode(newState)
      newNode.PARENT <- node
      newNode.ACTION <- action
      newNode.DEPTH <- node.DEPTH + 1
      newNode.COST <- node.COST + Cost(node, action)
      successors <- successors U {newNode}
  return successors
\`\`\`

### Recovering the Solution Path (Slide 43):
\`\`\`text
function RecoverPath(node) returns action list
  path <- []
  while node.STATE != Initial-State do
      path <- prepend(node.ACTION, path)
      node <- node.PARENT
  return path
\`\`\`
          `,
          keyTakeaways: [
            'Tree search dynamically constructs the tree by repeatedly expanding frontier nodes.',
            'The frontier (open set) holds generated leaf nodes awaiting expansion.',
            'When the goal is tested, parent pointers are traversed backwards to reconstruct the action plan.',
          ],
        },
        {
          id: 'loopy-paths-and-graph-search',
          title: 'Loopy Paths, Infinite Trees, and the Graph Search Algorithm',
          slideRef: { lessonId: 'lesson-2', slideNumber: 46, note: 'Avoiding repeated states and loopy paths' },
          summary:
            'Algorithms that forget their history are doomed to repeat it: avoiding infinite search trees via the explored (closed) set.',
          content: `
### The Peril of Loopy Paths (Slide 46)

> *"Algorithms that forget their history are doomed to repeat it."*

In any state space with reversible actions or cycles, pure tree search can become trapped in **loopy paths**:
* **Redundant path**: Multiple distinct paths exist between two states (e.g., Arad $\\to$ Sibiu vs Arad $\\to$ Zerind $\\to$ Oradea $\\to$ Sibiu).
* **Loopy path**: A path that cycles back to a previously expanded state (e.g., Arad $\\to$ Timisoara $\\to$ Arad $\\to$ Timisoara $\\dots$).
* **Consequence**: In a finite state space of only 20 cities, pure tree search can construct an **infinite** search tree and run out of memory or time!

### The Graph-Search Algorithm (Slide 47)
Graph search eliminates repeated states by maintaining an **explored set** (also known as the **closed list**):

\`\`\`text
function Graph-Search() returns a solution path or failure
  open <- CreateNode(Initial-State)          // Root node
  explored <- empty set                      // Set of closed states
  while open is not empty do
      node <- Extract(open)
      if node.STATE not in explored then     // Only consider unvisited states
          if TestGoal(node.STATE) then
              return RecoverPath(node)
          successors <- Expand(node)
          for each successor in successors do
              Insert(successor, open)
          Insert(node.STATE, explored)       // Mark state as closed
  return failure
\`\`\`
          `,
          keyTakeaways: [
            'Loopy paths can make finite state spaces generate infinite search trees.',
            'Graph search stores visited states in an explored set (closed list).',
            'Graph search can be exponentially more efficient in memory and time than tree search.',
          ],
        },
      ],
    },
    {
      id: 'uninformed-search-strategies',
      number: 4,
      title: 'Uninformed Search Algorithms & Complexity Analysis',
      slideRange: 'Slides 48–77',
      description:
        'Breadth-First Search (BFS), Uniform-Cost Search (UCS), Depth-First Search (DFS), Depth-Limited Search (DLS), and Iterative Deepening (IDS), with comparative metrics.',
      sections: [
        {
          id: 'performance-metrics',
          title: 'Evaluating Search Algorithm Performance',
          slideRef: { lessonId: 'lesson-2', slideNumber: 51, note: 'Measuring algorithms performance' },
          summary:
            'Four formal dimensions: Completeness, Optimality, Time Complexity, and Space Complexity, expressed via b, d, and m.',
          content: `
### The Four Evaluation Criteria (Slide 51)

1. **Completeness**: If a solution exists, is the algorithm guaranteed to find it?
2. **Optimality**: Does the algorithm return the lowest-cost solution path ($C^*$)?
3. **Time Complexity**: How long does the search take? (Measured by the number of nodes generated and expanded).
4. **Space Complexity**: How much memory is required? (Measured by the maximum number of nodes stored in memory at any one time).

### Problem-Related Complexity Parameters (Slide 52)
Unlike traditional computer science where complexity is expressed in terms of explicit graph vertices $|V|$ and edges $|E|$, in AI the graph is generated **implicitly** on demand. Complexity is expressed using:
* **$b$ (Branching Factor)**: The maximum number of successors generated by any node.
* **$d$ (Depth of Shallowest Goal)**: The number of action steps from the root to the shallowest goal node.
* **$m$ (Maximum Length)**: The maximum length/depth of any path in the state space (can be $\\infty$).
          `,
          keyTakeaways: [
            'Search algorithms are judged on Completeness, Optimality, Time, and Space.',
            '$b$: branching factor, $d$: depth of shallowest goal, $m$: maximum path length.',
            'Space complexity is usually the fatal bottleneck in real-world AI applications.',
          ],
        },
        {
          id: 'breadth-first-search',
          title: 'Breadth-First Search (BFS)',
          slideRef: { lessonId: 'lesson-2', slideNumber: 55, note: 'Breadth-first search algorithm and analysis' },
          summary:
            'Expands the shallowest open node using a FIFO queue. Complete for finite b, optimal only for uniform costs, exponential space explosion.',
          content: `
### Breadth-First Search Mechanics (Slides 55–58)

* **Strategy**: Always expand the **shallowest** unexpanded node in the frontier.
* **Data Structure**: Managed using a **FIFO (First-In, First-Out) Queue**. Newly generated children are appended to the back of the queue; extraction pulls from the front.

#### Performance Analysis:
* **Completeness**: **Yes**, provided branching factor $b$ is finite.
* **Optimality**: **Yes, ONLY if all step costs are equal** (or a non-decreasing function of depth). If costs vary, the shallowest goal is not necessarily the cheapest!
* **Time Complexity**:
  $$1 + b + b^2 + b^3 + \\dots + b^{d+1} = O(b^{d+1})$$
  *(If the goal test is applied when nodes are generated rather than when selected for expansion, time reduces to $O(b^d)$).*
* **Space Complexity**:
  $O(b^d)$ stored in the explored set, and $O(b^{d+1})$ in the frontier queue $\\implies \\mathbf{O(b^{d+1})}$.

#### The Catastrophic Memory Bottleneck (Slide 58):
Assuming $b = 10$, $10^6$ nodes generated/second, and $1\\text{ KB}$ per node:
* Depth $d = 2$: 110 nodes $\\to 0.11\\text{ ms} \\to 107\\text{ KB}$.
* Depth $d = 6$: $10^6$ nodes $\\to 1.1\\text{ s} \\to 1\\text{ GB}$.
* Depth $d = 10$: $10^{10}$ nodes $\\to 3\\text{ hours} \\to 10\\text{ Terabytes}$.
* Depth $d = 14$: $10^{14}$ nodes $\\to 3.5\\text{ years} \\to 99\\text{ Petabytes}$.
* Depth $d = 16$: $10^{16}$ nodes $\\to 350\\text{ years} \\to 10\\text{ Exabytes}$.

> **Conclusion**: Memory restrictions kill BFS far faster than execution time!
          `,
          keyTakeaways: [
            'BFS expands level-by-level using a FIFO queue.',
            'BFS is optimal ONLY when all action costs are equal.',
            'Space complexity $O(b^{d+1})$ makes BFS impractical for deep search spaces.',
          ],
        },
        {
          id: 'uniform-cost-search',
          title: 'Uniform-Cost Search (UCS)',
          slideRef: { lessonId: 'lesson-2', slideNumber: 59, note: 'Uniform-cost search algorithm and analysis' },
          summary:
            'Expands the node with lowest path cost g(n) using a Priority Queue. Optimal for arbitrary step costs (Dijkstra equivalence).',
          content: `
### Uniform-Cost Search Mechanics (Slides 59–62)

BFS is non-optimal when action costs differ. For example, travelling from Sibiu to Bucharest via Fagaras takes 1 intermediate city ($99 + 211 = 310$ km), whereas travelling via Rimnicu Vilcea and Pitesti takes 2 intermediate cities ($80 + 97 + 101 = 278$ km). BFS picks Fagaras because it is shallower; UCS correctly finds the cheaper path!

* **Strategy**: Always expand the node $n$ with the **lowest cumulative path cost $g(n)$**.
* **Data Structure**: Managed using a **Priority Queue** ordered in ascending order of path cost $g(n)$.
* **Equivalence**: Equivalent to **Dijkstra’s Algorithm** applied to trees and implicit search spaces.

#### Performance Analysis:
* **Completeness**: **Yes**, provided every action cost is strictly positive: $c(s, a) \\ge \\epsilon > 0$.
* **Optimality**: **Yes!** UCS is guaranteed to return the optimal solution $C^*$.
* **Time & Space Complexity**:
  $$O\\left(b^{1 + \\lfloor C^* / \\epsilon \\rfloor}\\right)$$
  where $C^*$ is the cost of the optimal solution and $\\epsilon$ is the minimal step cost.
  *(When all step costs are identical, $C^* / \\epsilon = d$, yielding $O(b^{d+1})$).*
          `,
          keyTakeaways: [
            'UCS expands the lowest-cost node $g(n)$ from a priority queue.',
            'Guaranteed optimal for arbitrary positive step costs.',
            'Explores concentric contours of increasing path cost $g$.',
          ],
        },
        {
          id: 'depth-first-search',
          title: 'Depth-First Search (DFS)',
          slideRef: { lessonId: 'lesson-2', slideNumber: 63, note: 'Depth-first search algorithm and analysis' },
          summary:
            'Expands the deepest open node using a LIFO queue (stack). Non-optimal, but achieves remarkable linear space complexity O(bm).',
          content: `
### Depth-First Search Mechanics (Slides 63–66)

* **Strategy**: Always expand the **deepest** node in the current frontier.
* **Data Structure**: Managed using a **LIFO (Last-In, First-Out) Queue / Stack** (or recursive call stack).

#### Performance Analysis:
* **Completeness**:
  * Tree-Search version: **No** (gets trapped in infinite loops in cyclic spaces, or along infinite branches).
  * Graph-Search version: **Yes** in finite state spaces (as it never revisits closed states).
* **Optimality**: **No**. Returns the first goal node it encounters, which may be vastly deeper or more expensive than the optimal goal.
* **Time Complexity**: $O(b^m)$ where $m$ is the maximum depth of the state space.
* **Space Complexity (The Superpower of Tree DFS)**:
  $$\\mathbf{O(b \\cdot m)}$$
  **Linear space!** DFS only needs to store the path from the root to the current leaf node, plus unexpanded sibling nodes at each depth level. For $b=10$ and depth $m=16$, BFS requires 10 Exabytes; DFS requires only **160 nodes (160 KB)**!
          `,
          keyTakeaways: [
            'DFS explores deep branches first using a LIFO stack.',
            'Tree DFS has outstanding linear memory complexity: $O(b \\cdot m)$.',
            'Tree DFS is incomplete in cyclic graphs; neither version is optimal.',
          ],
        },
        {
          id: 'depth-limited-and-iterative-deepening',
          title: 'Depth-Limited (DLS) & Iterative Deepening Search (IDS)',
          slideRef: { lessonId: 'lesson-2', slideNumber: 67, note: 'Depth-limited and Iterative deepening algorithms' },
          summary:
            'DLS fixes depth limit l. IDS combines DFS linear memory with BFS optimality by iteratively deepening the cutoff limit.',
          content: `
### 1. Depth-Limited Search (DLS) (Slides 67–70)
DLS imposes a fixed depth cutoff $l$. Nodes at depth $l$ are treated as leaves without successors.
* Solves the infinite-path problem of DFS.
* Incomplete if $l < d$ (goal lies beyond limit). Non-optimal if $l > d$.
* In Romania route finding with 20 cities, the maximum simple path has 19 steps $\\implies l = 19$.
* Time: $O(b^l)$, Space: $O(b \\cdot l)$.

### 2. Iterative Deepening Search (IDS) (Slides 71–73)
IDS systematically resolves the question: *What is the best depth limit $l$?*
It runs DLS for $l = 0, 1, 2, 3, \\dots$ until a goal is found!

\`\`\`text
function Iterative-Deepening-Search()
  for depth = 0 to infinity do
      result <- Depth-Limited-Search(depth)
      if result != cutoff then return result
\`\`\`

#### Analysis: Is Regenerating Nodes Wasteful? (Slide 73)
It seems wasteful to re-expand top nodes on every iteration. However, in trees with branching factor $b$, **the vast majority of nodes reside in the bottom level**, which is only generated once!
Total nodes generated in worst case:
$$N(\\text{IDS}) = (d)b + (d-1)b^2 + (d-2)b^3 + \\dots + (1)b^d$$
vs BFS:
$$N(\\text{BFS}) = 10 + 100 + \\dots + b^d$$

#### Concrete Example ($b = 10, d = 5$):
* $N(\\text{IDS}) = 50 + 400 + 3,000 + 20,000 + 100,000 = \\mathbf{123,450}$ nodes.
* $N(\\text{BFS}) = 10 + 100 + 1,000 + 10,000 + 100,000 = \\mathbf{111,110}$ nodes.

IDS generates only **11% more nodes** than BFS, but requires only **linear memory $O(b \\cdot d)$** instead of exponential memory!
* IDS is **Complete** (for finite $b$) and **Optimal** (when step costs are uniform).
          `,
          keyTakeaways: [
            'DLS halts DFS exploration at depth limit $l$.',
            'IDS runs DLS iteratively for $l = 0, 1, 2, \\dots$.',
            'IDS is the preferred uninformed search method when space is constrained and step costs are uniform.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'ex-l2-1',
      title: 'Missionaries and Cannibals Problem',
      slideRef: { lessonId: 'lesson-2', slideNumber: 78, note: 'Three proposed problems: Missionaries and cannibals' },
      problemStatement:
        'Three missionaries and three cannibals must cross a river using a boat that carries at most two people. At no point on either riverbank may cannibals outnumber missionaries (otherwise the cannibals eat the missionaries!). Formulate the problem formally, plot the state space tree, analyze strategies, and discuss if testing for cycles is necessary.',
      formalization: {
        stateSpace:
          'Vector $\\langle M_L, C_L, B_L \\rangle$ representing missionaries on left bank ($0..3$), cannibals on left bank ($0..3$), and boat position ($1=$ left, $0=$ right). Right bank values are implicit: $M_R = 3 - M_L, C_R = 3 - C_L$. Valid states must satisfy: $(M_L == 0 \\lor M_L \\ge C_L) \\land (M_R == 0 \\lor M_R \\ge C_R)$.',
        initialState: '$\\langle 3, 3, 1 \\rangle$',
        actions:
          'Move boat with combinations: $\\{(1,0), (2,0), (0,1), (0,2), (1,1)\\}$ representing (missionaries, cannibals).',
        successorFunction:
          'Subtract boat occupants from current bank and add to destination bank; flip boat indicator.',
        goalTest: '$\\langle 0, 0, 0 \\rangle$',
        pathCost: '1 per boat crossing.',
      },
      solutionExplanation:
        'The state space has only 32 potential mathematical configurations, of which only 16 are valid non-lethal states. Without cycle checking, tree search will loop endlessly moving the boat back and forth. Graph search discovers the optimal 11-step solution. Key steps include sending two cannibals first, then one cannibal returns, sending another cannibal pair, returning one cannibal, then sending two missionaries, returning one missionary and one cannibal, sending two missionaries, returning one cannibal, and finally sending the remaining cannibals across.',
      hasInteractiveTool: true,
      interactiveToolId: 'missionaries-simulator',
    },
    {
      id: 'ex-l2-2',
      title: 'The Water Jugs Problem',
      slideRef: { lessonId: 'lesson-2', slideNumber: 79, note: 'Three proposed problems: The jugs' },
      problemStatement:
        'You have two unmarked jugs with capacities 4 liters ($J_4$) and 3 liters ($J_3$), and an unlimited water pump. Formulate the problem formally and determine how to measure exactly 2 liters in the 4-liter jug ($J_4 = 2$).',
      formalization: {
        stateSpace: 'Ordered pair $\\langle j_4, j_3 \\rangle$ where $j_4 \\in \\{0, 1, 2, 3, 4\\}$ and $j_3 \\in \\{0, 1, 2, 3\\}$. Total 20 possible states.',
        initialState: '$\\langle 0, 0 \\rangle$',
        actions:
          'Fill $J_4$, Fill $J_3$, Empty $J_4$, Empty $J_3$, Pour $J_4 \\to J_3$, Pour $J_3 \\to J_4$.',
        successorFunction:
          'Applying pour actions transfers water until source is empty or destination is full: $\\min(j_4, 3 - j_3)$ or $\\min(j_3, 4 - j_4)$.',
        goalTest: '$j_4 == 2$',
        pathCost: '1 per action.',
      },
      solutionExplanation:
        'Optimal 6-step solution path found by BFS / UCS:\n1. $\\langle 0, 0 \\rangle \\to$ Fill $J_3 \\to \\langle 0, 3 \\rangle$\n2. $\\langle 0, 3 \\rangle \\to$ Pour $J_3 \\to J_4 \\to \\langle 3, 0 \\rangle$\n3. $\\langle 3, 0 \\rangle \\to$ Fill $J_3 \\to \\langle 3, 3 \\rangle$\n4. $\\langle 3, 3 \\rangle \\to$ Pour $J_3 \\to J_4 \\to \\langle 4, 2 \\rangle$ ($J_4$ is full, leaving 2L in $J_3$!)\n5. $\\langle 4, 2 \\rangle \\to$ Empty $J_4 \\to \\langle 0, 2 \\rangle$\n6. $\\langle 0, 2 \\rangle \\to$ Pour $J_3 \\to J_4 \\to \\mathbf{\\langle 2, 0 \\rangle}$ (Goal achieved: exactly 2 liters in the 4-liter jug!).',
      hasInteractiveTool: true,
      interactiveToolId: 'water-jugs-simulator',
    },
    {
      id: 'ex-l2-3',
      title: 'The 8-Queens Problem Formulations',
      slideRef: { lessonId: 'lesson-2', slideNumber: 80, note: 'Three proposed problems: 8-Queens problem' },
      problemStatement:
        'Place 8 queens on an $8 \\times 8$ chessboard such that no queen attacks another. Formulate and compare: (a) Incremental formulation starting with an empty board and placing one queen per step, versus (b) Complete-state formulation with 8 queens initially placed randomly that must be moved.',
      formalization: {
        stateSpace:
          'Incremental: Board configurations with $k$ queens ($0 \\le k \\le 8$), one per column. Total states: $\\approx 1.68 \\times 10^7$ vs unconstrained $\\binom{64}{8} \\approx 4.4 \\times 10^{14}$. Complete-state: Board with 8 queens, one per column: vector $\\langle q_1, \\dots, q_8 \\rangle$ where $q_i \\in \\{1..8\\}$, total $8^8 = 16,777,216$ states.',
        goalTest: '8 queens placed with zero horizontal, vertical, or diagonal pairwise conflicts.',
      },
      solutionExplanation:
        'The incremental formulation drastically constrains the search space by placing exactly one queen per column in non-attacking rows, which allows early pruning of entire subtrees when an attack occurs (backtracking search). The complete-state formulation is suited for local search algorithms (hill climbing, simulated annealing, genetic algorithms) where an objective function counts the number of attacking queen pairs and iteratively moves queens to minimize attacks.',
      hasInteractiveTool: true,
      interactiveToolId: 'eight-queens-simulator',
    },
  ],
};

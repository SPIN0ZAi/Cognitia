import type { LessonData } from '../types/course';

export const LESSON_5_DATA: LessonData = {
  id: 'lesson-5',
  number: 5,
  title: 'Reinforcement Learning: Markov Decision Processes & Temporal-Difference Control',
  subtitle:
    'Sequential decisions under uncertainty, Bellman optimality, Value Iteration, Policy Iteration, Q-Learning, Exploration vs. Exploitation, and SARSA on-policy learning',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 82,
  overview:
    'Expands intelligent systems beyond deterministic search into stochastic environments where action outcomes are probabilistic. Establishes the formal framework of Markov Decision Processes (MDPs) defined by states, actions, transition models, and additive/discounted rewards. Develops Bellman optimality equations, proving why dynamic programming via Value Iteration and Policy Iteration converges to optimal policies. Transitions to Reinforcement Learning (RL) when transition probabilities and reward functions are unknown a priori. Compares model-based versus model-free paradigms, formalizes the action-value function Q*(s, a), and derives Temporal-Difference Q-learning with learning rate decay and exploration strategies (ε-greedy and count-based exploration functions). Concludes with on-policy SARSA control and the classic Cliff-Walking dilemma, demonstrating why the safest path during training differs from the greedy optimal trajectory.',
  prerequisites: [
    'Formal problem formulation and search spaces (Lesson 2)',
    'Heuristic functions and state evaluations (Lesson 3)',
    'Probability distributions, conditional probability, and expected values E[X]',
  ],
  learningObjectives: [
    'Distinguish deterministic search from stochastic sequential decision processes requiring policy functions π: S → A.',
    'Formulate a Markov Decision Process as the tuple ⟨S, A, T, R, γ⟩ and verify the Markov property.',
    'Calculate the discounted utility of state sequences Uh = ∑ γ^t R(st) and interpret the role of discount factor γ ∈ [0, 1].',
    'State and solve Bellman optimality equations for state utility U*(s) and action-utility Q*(s, a).',
    'Execute and trace the Value Iteration and Policy Iteration algorithms step-by-step on discrete state graphs.',
    'Derive the Temporal-Difference (TD) Q-learning update equation and evaluate the impact of learning rate α and decay schedules.',
    'Analyze the exploration-exploitation dilemma and contrast ε-greedy policies with count-based optimistic exploration functions f(u, n).',
    'Compare off-policy Q-learning against on-policy SARSA, proving why SARSA learns safer paths in dangerous environments like Cliff Walking.',
    'Solve official UCLM exam exercises: Value Iteration on 2-state MDPs, Delivery Drone MDP formulation, and two-stage betting games.',
  ],
  chapters: [
    {
      id: 'introduction-to-rl',
      number: 1,
      title: 'Introduction & Stochastic Environments',
      slideRange: 'Slides 1–11',
      description:
        'Moving from deterministic action planning to stochastic environments, policies, immediate vs delayed rewards, and the canonical 4×3 grid world.',
      sections: [
        {
          id: 'deterministic-vs-stochastic',
          title: 'Deterministic Search vs. Stochastic Environments',
          slideRef: { lessonId: 'lesson-5', slideNumber: 5, note: 'Introduction to stochastic environments' },
          summary:
            'In deterministic worlds, agents plan a fixed sequence of actions. In stochastic worlds, action outcomes are uncertain; searching for a static sequence fails as soon as an unexpected transition occurs.',
          content: `
### Deterministic vs. Stochastic Environments (Slide 5)

In Lessons 2, 3, and 4, agents planned actions by exploring the search space before acting, assuming every action was **deterministic**:
$$\\text{Action } a \\text{ in state } s \\implies \\text{always reaches unique state } s'$$

In the real world and complex systems:
1. **Stochasticity & Uncertainty**: Actuators slip, sensors are noisy, wind blows, opponents act unpredictably. After executing action $a$ in state $s$, the agent may end up in one of several possible states with different probabilities.
2. **Failure of Static Action Sequences**: Searching for a fixed sequence of actions $[a_1, a_2, \\dots, a_k]$ is no longer sufficient. If action $a_1$ lands the agent in an unexpected state, the remaining plan fails completely!
3. **What Must the Agent Seek Instead?**:
   Instead of a path, the agent must find a **policy** $\\pi: S \\to A$:
   $$\\pi(s) = \\text{The recommended action to execute whenever the agent finds itself in state } s.$$
          `,
          keyTakeaways: [
            'Deterministic environments allow pre-planned action sequences; stochastic environments require policies.',
            'A policy π specifies the best action for every reachable state the agent might encounter.',
          ],
        },
        {
          id: 'four-by-three-world',
          title: 'The Canonical 4×3 Grid World',
          slideRef: { lessonId: 'lesson-5', slideNumber: 6, note: '4x3 robot world example' },
          summary:
            'A standard benchmark environment: 11 active states, 1 obstacle wall, 2 terminal states (+1 and -1), and stochastic action transitions with 80% intended and 20% perpendicular drift.',
          content: `
### The 4×3 Grid World Benchmark (Slides 6–7)

Consider an autonomous mobile robot on a $4 \\times 3$ grid:
* **States**: Grid cells $(x, y)$ for $x \\in \\{1, 2, 3, 4\\}, y \\in \\{1, 2, 3\\}$.
* **Obstacle**: Non-transitable wall at $(2, 2)$.
* **Terminal States**:
  * $(4, 3)$: Goal terminal state with reward $+1$.
  * $(4, 2)$: Hazard terminal state with reward $-1$.
* **Start State**: Cell $(1, 1)$.
* **Available Actions**: $A = \\{\\text{Up}, \\text{Down}, \\text{Left}, \\text{Right}\\}$.

#### Stochastic Transition Model (Slide 6)
When the robot attempts to move in a chosen direction:
* **Probability 0.8**: Moves successfully in the selected direction.
* **Probability 0.1**: Drifts $90^\\circ$ counter-clockwise (perpendicular left).
* **Probability 0.1**: Drifts $90^\\circ$ clockwise (perpendicular right).
* **Bumping into boundaries or walls**: If an intended or drift movement hits an outer wall or the obstacle at $(2, 2)$, the robot bounces back and remains in its current cell.

#### Why Fixed Sequences Fail (Slide 7)
Suppose the robot plans the deterministic sequence: $[\\text{Up}, \\text{Up}, \\text{Right}, \\text{Right}, \\text{Right}]$.
The probability of executing all 5 intended moves without any drift is:
$$P(\\text{success}) = 0.8^5 = 0.32768 \\approx 32.8\\%$$
Even accounting for accidental recovery, the probability is only $\\approx 0.32776$. Two-thirds of the time, the agent deviates into an unexpected cell!
          `,
          keyTakeaways: [
            'In the 4x3 world, intended actions succeed with P=0.8; perpendicular drift occurs with P=0.1 each.',
            'A 5-step deterministic path succeeds only 32.8% of the time, proving the necessity of state-contingent policies.',
          ],
        },
        {
          id: 'policies-and-reward-shaping',
          title: 'Policies & Reward Dynamics',
          slideRef: { lessonId: 'lesson-5', slideNumber: 8, note: 'Policies, rewards and step costs' },
          summary:
            'How step reward R(s) shapes optimal policies. Changing the cost of living from -0.04 to -2.0 or +0.1 drastically alters agent risk tolerance.',
          content: `
### Reward Formulation & Policy Sensitivity (Slides 8–9)

We write $R(s, a)$ for the reward received when executing action $a$ in state $s$. When reward depends only on the state entered, we use $R(s)$.

In the $4 \\times 3$ world:
* Terminal goal: $R(4, 3) = +1$
* Terminal trap: $R(4, 2) = -1$
* Non-terminal step cost: $R(s) = c$ for all other states.

#### How $R(s)$ Radically Shapes Agent Behavior (Slide 9):
1. **$R(s) = -0.04$ (Conservative Balance)**:
   Living is mildly painful. The robot seeks the $+1$ goal while taking the long, safe route around the wall, steering away from the $-1$ trap.
2. **$R(s) = -2.0$ (High Urgency / Desperation)**:
   Living is extremely painful (-2 per step!). The robot rushes directly to the nearest terminal state—even choosing to plunge into the $-1$ hazard rather than suffer 2 steps of $-2$ penalty!
3. **$R(s) = -0.1$ (Moderate Urgency)**:
   The robot takes shorter, riskier paths closer to the cliff/trap, balancing step cost against hazard probability.
4. **$R(s) > 0$ (Heaven / Anti-Goal)**:
   Every step awards positive points! The robot intentionally avoids both terminal states forever, looping infinitely to accumulate infinite reward!
          `,
          keyTakeaways: [
            'Step rewards R(s) determine agent risk tolerance and trajectory length.',
            'Severe negative step costs cause suicidal urgency; positive step costs cause infinite avoidance loops.',
          ],
        },
      ],
    },
    {
      id: 'markov-decision-processes',
      number: 2,
      title: 'Markov Decision Processes (MDPs)',
      slideRange: 'Slides 12–36',
      description:
        'Formal MDP definition, discounted utility, Bellman equations, Value Iteration, and Policy Iteration algorithms with complete calculation traces.',
      sections: [
        {
          id: 'mdp-formal-definition',
          title: 'Formal MDP Definition & Discounted Utility',
          slideRef: { lessonId: 'lesson-5', slideNumber: 13, note: 'MDP definition and Markov property' },
          summary:
            'An MDP is defined by the 5-tuple ⟨S, A, T, R, γ⟩. The Markov property asserts that future states depend only on current state s and action a, not on history.',
          content: `
### Formal Definition of a Markov Decision Process (Slides 13–16)

A **Markov Decision Process (MDP)** is a sequential decision model for fully observable, stochastic environments defined by:
1. **$S$**: Set of states. Non-terminal states $S$, terminal states $F$.
2. **$A$**: Set of available actions $A(s)$.
3. **$T(s, a, s')$**: Transition probability model $P(s' \\mid s, a)$, the probability of reaching $s'$ when applying action $a$ in state $s$:
   $$\\sum_{s' \\in S \\cup F} T(s, a, s') = 1 \\quad \\forall s, a$$
4. **$R(s, a)$** or **$R(s)$**: Reward function assigning immediate numerical feedback.
5. **$\\gamma \\in [0, 1]$**: Discount factor modeling the time-value of future rewards.

#### The Markov Property (Slide 13)
$$P(S_{t+1} = s' \\mid S_t = s_t, A_t = a_t, S_{t-1} = s_{t-1}, \\dots, S_0 = s_0) = P(S_{t+1} = s' \\mid S_t = s_t, A_t = a_t)$$
The future depends **only on the present state and action**, independent of how the agent arrived there.

#### Utility of a State Sequence (Slide 15)
With discount factor $\\gamma \\in [0, 1]$:
$$U_h([s_0, s_1, s_2, \\dots]) = \\sum_{t=0}^\\infty \\gamma^t R(s_t)$$
* **$\\gamma \\to 0$**: Short-sighted (myopic) agent; only immediate rewards matter.
* **$\\gamma \\to 1$**: Far-sighted agent; future rewards carry equal weight.
* For bounded rewards $|R(s)| \\le R_{\\max}$ and $\\gamma < 1$, infinite-horizon returns are guaranteed finite:
  $$\\sum_{t=0}^\\infty \\gamma^t R(s_t) \\le \\frac{R_{\\max}}{1 - \\gamma}$$
          `,
          keyTakeaways: [
            'An MDP is formalized as ⟨S, A, T, R, γ⟩.',
            'The Markov property requires that transitions depend solely on the current state and action.',
            'Discount factor γ ensures mathematical convergence of infinite horizon returns.',
          ],
        },
        {
          id: 'bellman-equations',
          title: 'The Bellman Optimality Equation',
          slideRef: { lessonId: 'lesson-5', slideNumber: 18, note: 'Bellman equation for state utility' },
          summary:
            'Expresses the recursive relationship between the utility of a state and the utilities of its possible successor states under optimal decision making.',
          content: `
### The Bellman Optimality Equation (Slides 18–24)

The true utility $U(s)$ of state $s$ is the maximum expected discounted return the agent can obtain starting from $s$:

$$U(s) = \\max_{a \\in A(s)} \\left[ R(s, a) + \\gamma \\sum_{s' \\in S \\cup F} T(s, a, s') U(s') \\right]$$

Once optimal state utilities $U^*(s)$ are known, the optimal policy $\\pi^*(s)$ is obtained by one-step lookahead:
$$\\pi^*(s) = \\arg\\max_{a \\in A(s)} \\left[ R(s, a) + \\gamma \\sum_{s'} T(s, a, s') U^*(s') \\right]$$

#### Why Bellman Equations Cannot Be Solved with Linear Algebra (Slide 23)
For an MDP with $n$ non-terminal states, Bellman's formulation generates a system of $n$ equations with $n$ unknowns. However, because of the $\\max_a$ operator, the system is **non-linear**! We cannot solve it using Gaussian elimination or matrix inversion. We must use dynamic programming: **Value Iteration** or **Policy Iteration**.
          `,
          keyTakeaways: [
            'Bellman optimality equation relates U(s) to the maximum expected utility of successor states.',
            'The non-linear max operator prevents closed-form linear algebra solutions, requiring iterative methods.',
          ],
        },
        {
          id: 'value-iteration-algorithm',
          title: 'Value Iteration Algorithm & 5-Step Trace',
          slideRef: { lessonId: 'lesson-5', slideNumber: 27, note: 'Value iteration algorithm and numerical trace' },
          summary:
            'Iteratively applies Bellman backups until state utilities converge within tolerance ε. Terminal states remain fixed at their terminal rewards.',
          content: `
### Value Iteration (Slides 27–30)

Value Iteration starts with arbitrary utilities $U_0(s) = 0$ for all $s \\in S$, and $U(f) = R(f)$ for terminal states $f \\in F$. In each iteration $i+1$, it updates every state via the Bellman backup:

$$U_{i+1}(s) \\leftarrow \\max_{a} \\left[ R(s, a) + \\gamma \\sum_{s'} T(s, a, s') U_i(s') \\right]$$

Repeat until the maximum utility change across all states is smaller than convergence threshold $\\epsilon$:
$$\\delta = \\max_{s \\in S} |U_{i+1}(s) - U_i(s)| < \\epsilon$$

#### Official 4-State MDP Example Trace (Slides 23, 29)
Consider states $s_1, s_2, s_3$ and terminal state $s_4$ ($R(s_4)=1, R(s_1)=R(s_2)=R(s_3)=0, \\gamma=1$):
* $s_1$: action $a_1 \\to (s_1: 0.1, s_2: 0.9)$, action $a_2 \\to (s_3: 1.0)$
* $s_2$: action $a_1 \\to (s_1: 0.9, s_3: 0.1)$, action $a_2 \\to (s_4: 1.0)$
* $s_3$: action $a_3 \\to (s_3: 0.5, s_4: 0.5)$
* $s_4$: terminal, $U(s_4) = 1$ permanently.

| State | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Iter 5 (Converged) | Optimal Policy $\\pi^*(s)$ |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| $U(s_1)$ | $0.000$ | $0.900$ | $0.990$ | $0.999$ | $0.9999$ | $a_1$ ($0.1 \\cdot 0.9999 + 0.9 \\cdot 1.0 > 1 \\cdot 0.968$) |
| $U(s_2)$ | $1.000$ | $1.000$ | $1.000$ | $1.000$ | $1.0000$ | $a_2$ ($1.0 \\cdot 1.0 > 0.9 \\cdot 0.9999 + 0.1 \\cdot 0.968$) |
| $U(s_3)$ | $0.500$ | $0.750$ | $0.875$ | $0.937$ | $0.9680$ | $a_3$ |
| $U(s_4)$ | $1.000$ | $1.000$ | $1.000$ | $1.000$ | $1.0000$ | Terminal |
          `,
          keyTakeaways: [
            'Value iteration applies Bellman updates repeatedly until maximum utility delta < ε.',
            'Terminal state values remain permanently fixed at their terminal rewards.',
          ],
        },
        {
          id: 'policy-iteration-algorithm',
          title: 'Policy Iteration Algorithm & Exact Linear Evaluation',
          slideRef: { lessonId: 'lesson-5', slideNumber: 31, note: 'Policy iteration: evaluation and improvement' },
          summary:
            'Alternates between Policy Evaluation (computing utilities for a fixed policy via linear equations) and Policy Improvement (updating actions greedily) until policy stabilizes.',
          content: `
### Policy Iteration (Slides 31–36)

Often, an optimal policy converges much faster than the numerical state utilities! If an action is clearly superior, we do not need the exact infinite-precision utilities to decide on it.

Policy Iteration alternates two distinct phases:
1. **Policy Evaluation**: Given current policy $\\pi_i$, compute exact utilities $U_i = U^{\\pi_i}$.
   Because the action $\\pi(s)$ is fixed, there is no $\\max_a$ operator! The equations are strictly **linear**:
   $$U(s) = R(s, \\pi(s)) + \\gamma \\sum_{s'} T(s, \\pi(s), s') U(s')$$
   Can be solved exactly by linear system solver or iteratively.
2. **Policy Improvement**: Given utilities $U_i$, update the policy greedily:
   $$\\pi_{i+1}(s) \\leftarrow \\arg\\max_{a} \\left[ R(s, a) + \\gamma \\sum_{s'} T(s, a, s') U_i(s') \\right]$$

The algorithm terminates when $\\pi_{i+1}(s) = \\pi_i(s)$ for all states. The policy is mathematically guaranteed to be globally optimal!
          `,
          keyTakeaways: [
            'Policy iteration alternates Policy Evaluation (linear Bellman backup) and Policy Improvement (greedy argmax).',
            'Terminates when the policy undergoes no changes between consecutive iterations.',
          ],
        },
      ],
    },
    {
      id: 'reinforcement-learning-core',
      number: 3,
      title: 'Model-Free Reinforcement Learning & Q-Learning',
      slideRange: 'Slides 37–67',
      description:
        'When transitions and rewards are unknown. Action-value Q*(s, a), Temporal-Difference updates, learning rate decay, exploration vs exploitation, and exploration bonus functions.',
      sections: [
        {
          id: 'model-free-action-value-q',
          title: 'Model-Based vs. Model-Free: Action-Value Q*(s, a)',
          slideRef: { lessonId: 'lesson-5', slideNumber: 41, note: 'Action-value function Q*(s, a)' },
          summary:
            'When T and R are unknown, learning state utilities U(s) is useless because selecting an action still requires T and R. Model-free methods learn the expected return of state-action pairs Q*(s, a).',
          content: `
### Why State Utilities Are Not Enough in Model-Free RL (Slide 41)

If transition model $T(s, a, s')$ and reward model $R(s, a)$ are unknown:
$$\\pi^*(s) = \\arg\\max_{a} \\left[ R(s, a) + \\gamma \\sum_{s'} T(s, a, s') U^*(s') \\right]$$
Even if a magical oracle gave us true state utilities $U^*(s)$, the agent **still cannot select an action** because evaluating the formula requires knowing $R$ and $T$!

#### The Action-Value Function $Q^*(s, a)$ (Slide 41)
We define $Q^*(s, a)$ as the expected return obtained by executing action $a$ in state $s$ and behaving optimally thereafter:
$$U^*(s) = \\max_{a} Q^*(s, a), \\qquad \\pi^*(s) = \\arg\\max_{a} Q^*(s, a)$$

Once the agent learns $Q^*(s, a)$, it can act **completely model-free** with a simple local lookup: no transition probabilities or reward models required!
          `,
          keyTakeaways: [
            'Without knowing T and R, state utilities U(s) cannot be used to choose actions.',
            'Action-value function Q*(s,a) enables completely model-free decision making.',
          ],
        },
        {
          id: 'q-learning-td-update',
          title: 'Temporal-Difference Q-Learning Equation & Traces',
          slideRef: { lessonId: 'lesson-5', slideNumber: 49, note: 'Temporal difference update equation' },
          summary:
            'The core Q-learning update: moving current estimate towards observed target y = r + γ max Q(s\', a\') with learning rate α.',
          content: `
### Temporal-Difference Q-Learning (Slides 49–54)

When an agent executes action $a$ in state $s$, the environment provides an experience sample tuple $(s, a, r, s')$.

We define the **TD target** $y$:
$$y = \\begin{cases} r + \\gamma R(s') & \\text{if } s' \\text{ is terminal} \\\\ r + \\gamma \\max_{a'} \\hat{Q}(s', a') & \\text{otherwise} \\end{cases}$$

The **Temporal-Difference Update**:
$$\\hat{Q}(s, a) \\leftarrow \\hat{Q}(s, a) + \\alpha \\underbrace{\\left[ y - \\hat{Q}(s, a) \\right]}_{\\text{Temporal-Difference Error}}$$
Equivalently:
$$\\hat{Q}(s, a) \\leftarrow (1 - \\alpha) \\hat{Q}(s, a) + \\alpha y$$

#### Role of Learning Rate $\\alpha \\in (0, 1]$ (Slide 49)
* **$\\alpha = 1.0$**: Direct one-sample replacement. In deterministic environments this works, but in stochastic environments, noisy samples cause severe oscillations (Slides 44–47).
* **Small $\\alpha$ (e.g. $0.1$)**: Slow, smooth exponential moving average; filters out stochastic transition noise.
* **Decaying Learning Rate** (Slide 55, 57):
  $$\\alpha_i = \\alpha_0 \\cdot 0.999^i \\quad \\text{or} \\quad \\alpha(n) = \\frac{1}{n}$$
  Allows large corrections early in training while stabilizing estimates as experience accumulates.
          `,
          keyTakeaways: [
            'TD error [y - Q(s, a)] measures the surprise between observed experience and expectation.',
            'Q-learning update computes an exponential moving average weighted by learning rate α.',
            'Decaying learning rates balance rapid early learning with long-term estimate stability.',
          ],
        },
        {
          id: 'exploration-vs-exploitation',
          title: 'Exploration vs. Exploitation: ε-Greedy & Count Bonuses',
          slideRef: { lessonId: 'lesson-5', slideNumber: 58, note: 'Exploration mechanisms' },
          summary:
            'Pure greedy action selection fails because high-reward states are never discovered. ε-greedy exploration and optimistic exploration functions f(u, n) guarantee coverage.',
          content: `
### The Exploration vs. Exploitation Dilemma (Slides 58–67)

If an agent always chooses greedily:
$$a = \\arg\\max_{a'} \\hat{Q}(s, a')$$
It will stick with the first modest positive reward it finds (+1) and never discover a distant jackpot state (+20) because the intermediate states have initial Q-values of 0 (Slide 58)!

#### Strategy 1: $\\epsilon$-Greedy Action Selection (Slide 60)
$$a = \\begin{cases} \\text{random action from } A(s) & \\text{with probability } \\epsilon \\\\ \\arg\\max_{a'} \\hat{Q}(s, a') & \\text{with probability } 1 - \\epsilon \\end{cases}$$
* Fixed $\\epsilon > 0$: Continuous exploration forever.
* Decaying $\\epsilon$: e.g., $\\epsilon_i = \\max(0.01, 0.30 \\cdot 0.998^i)$ (Slide 61).

#### Strategy 2: Optimistic Exploration Function (Slides 65–67)
The agent maintains visit counts $N(s, a)$ for every state-action pair:
$$a = \\arg\\max_{a'} f\\left(\\hat{Q}(s, a'), N(s, a')\\right)$$
$$f(u, n) = \\begin{cases} R^+ & \\text{if } n < N_e \\\\ u & \\text{otherwise} \\end{cases}$$
* $R^+$: Optimistic high reward bonus assigned to insufficiently explored actions.
* $N_e$: Minimum visit threshold before relying on the learned estimate $\\hat{Q}(s, a)$.
* **Crucial Distinction (Slide 67)**: $R^+$ is used **only to select the action to explore**. It is **NOT** a reward and does **NOT** appear in the Q-learning update target $y$!
          `,
          keyTakeaways: [
            'Greedy agents get trapped in local optima; exploration is mandatory to discover high-value trajectories.',
            'ε-greedy balances random exploration with greedy exploitation.',
            'Exploration functions grant optimistic bonuses R+ to unvisited actions without corrupting the TD update target.',
          ],
        },
      ],
    },
    {
      id: 'sarsa-and-cliff-walking',
      number: 4,
      title: 'SARSA (On-Policy) & The Cliff-Walking Dilemma',
      slideRange: 'Slides 68–76',
      description:
        'On-policy SARSA vs off-policy Q-Learning, target comparisons, and the classic Cliff Walking experiment showing why optimal paths differ during learning.',
      sections: [
        {
          id: 'sarsa-algorithm-derivation',
          title: 'The SARSA Algorithm & On-Policy Updates',
          slideRef: { lessonId: 'lesson-5', slideNumber: 69, note: 'SARSA algorithm formulation' },
          summary:
            'SARSA (State-Action-Reward-State-Action) updates Q-values using the action a\' actually selected by the behavior policy, making it on-policy.',
          content: `
### SARSA: On-Policy Learning (Slides 69–71)

At time step $t$, the agent in state $s_t$ executes action $a_t$, receives reward $r_{t+1}$, and reaches state $s_{t+1}$. It then **selects the next action $a_{t+1}$ using its current exploration policy (e.g. $\\epsilon$-greedy)**:

$$\\hat{Q}(s_t, a_t) \\leftarrow \\hat{Q}(s_t, a_t) + \\alpha \\left[ r_{t+1} + \\gamma \\hat{Q}(s_{t+1}, a_{t+1}) - \\hat{Q}(s_t, a_t) \\right]$$

The sequence gives the algorithm its name:
$$\\underbrace{s_t}_{S}, \\underbrace{a_t}_{A}, \\underbrace{r_{t+1}}_{R}, \\underbrace{s_{t+1}}_{S}, \\underbrace{a_{t+1}}_{A}$$

#### Direct Comparison (Slide 71):
| Feature | SARSA | Q-Learning |
|:---|:---|:---|
| **Update Target** | $y = r + \\gamma \\hat{Q}(s', a')$ (actual next action) | $y = r + \\gamma \\max_{a'} \\hat{Q}(s', a')$ (best possible action) |
| **Estimates** | $Q^\\pi$: Value of the behavior policy including exploration slips | $Q^*$: Value of optimal policy independent of behavior |
| **Type** | **On-Policy** | **Off-Policy** |
| **Danger Awareness** | Sensitive to exploration risk near hazards | Disregards exploration risk; assumes perfect future execution |
          `,
          keyTakeaways: [
            'SARSA uses the action actually selected next (a\') rather than the greedy maximum.',
            'Q-learning is off-policy; SARSA is on-policy.',
          ],
        },
        {
          id: 'cliff-walking-experiment',
          title: 'The Cliff-Walking Experiment: Safe vs. Optimal',
          slideRef: { lessonId: 'lesson-5', slideNumber: 72, note: 'Cliff walking benchmark and empirical results' },
          summary:
            'In a 4×12 grid with a 10-cell fatal cliff, Q-learning learns the optimal 13-step path along the edge but falls often during training. SARSA learns a longer 17-step safe route that avoids costly exploratory falls.',
          content: `
### The Cliff-Walking Problem (Slides 72–75)

A $4 \\times 12$ grid environment with Start $S$ at $(0, 0)$ and Goal $G$ at $(11, 0)$:
* **Cliff**: Cells $(1, 0)$ through $(10, 0)$. Stepping on the cliff incurs reward $-100$ and immediately resets the agent back to $S$.
* **Step Cost**: $-1$ for every non-cliff step.
* Parameters: $\\alpha = 0.5, \\gamma = 1.0, \\epsilon = 0.1$.

#### What the Algorithms Learn (Slide 72):
* **Q-Learning**: Learns the **shortest greedy path (13 steps)** right along the edge of the cliff.
* **SARSA**: Learns a **longer, safer path (17 steps)** looping up into row 3, keeping a protective buffer between itself and the cliff!

#### Why Does SARSA Outperform Q-Learning During Training? (Slides 73–74)
With $\\epsilon = 0.1$, an agent walking along the edge of the cliff occasionally takes a random exploratory step (prob $0.1/4 = 0.025$) down into the abyss!
* Q-learning ignores this risk because its update target assumes a greedy future action. During learning, Q-learning achieves an average return of **$-51$** per episode!
* SARSA incorporates the exploratory action $a'$ into its backup. It discovers that being near the cliff has high expected penalty due to exploration slips, so it chooses the safer path, achieving an average return of **$-27$** per episode!

#### Post-Training Deployment (Slide 74):
* If deployed with **greedy control ($\\epsilon = 0$)**: Q-learning wins (return $-13$ vs $-17$ for SARSA).
* If deployed with **ongoing exploration ($\\epsilon = 0.1$)**: SARSA wins decisively (return $-21.8$ vs $-51.4$ for Q-learning, with $0.03$ cliff falls vs $0.35$ falls per episode).
          `,
          keyTakeaways: [
            'Q-learning learns the shortest theoretical path; SARSA learns the safest operational path.',
            'In physical robotics or expensive systems where exploration errors are catastrophic, SARSA is strongly preferred.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'ex-5-1',
      title: 'Proposed Exercise 1: Value Iteration on 2-State MDP (Slide 80)',
      slideRef: { lessonId: 'lesson-5', slideNumber: 80, note: 'Value iteration manual calculation' },
      problemStatement:
        'Consider an MDP with non-terminal states S = {s0, s1} and terminal state F = {G}. Every action has reward R(s, a) = -1. The terminal reward is R(G) = 10, and γ = 0.9. Actions: s0 has "safe" (T(s0, safe, s1)=1) and "risky" (T(s0, risky, G)=0.6, T(s0, risky, s0)=0.4). s1 has "finish" (T(s1, finish, G)=0.8, T(s1, finish, s0)=0.2) and "return" (T(s1, return, s0)=1). Calculate U1(s0), U1(s1), U2(s0), U2(s1) and indicate optimal actions.',
      formalization: {
        stateSpace: 'S = {s0, s1}, F = {G}',
        initialState: 'U0(s0) = 0, U0(s1) = 0, U0(G) = 10',
        actions: 's0: {safe, risky}; s1: {finish, return}',
        pathCost: 'R(s, a) = -1 for all actions; R(G) = +10',
      },
      solutionExplanation:
        'Iteration 1: U1(s0) = max{-1 + 0.9(1*0), -1 + 0.9(0.6*10 + 0.4*0)} = max{-1, 4.4} = 4.4 (risky). U1(s1) = max{-1 + 0.9(0.8*10 + 0.2*0), -1 + 0.9(1*0)} = max{6.2, -1} = 6.2 (finish). Iteration 2: U2(s0) = max{-1 + 0.9(1*6.2), -1 + 0.9(0.6*10 + 0.4*4.4)} = max{4.58, 5.984} = 5.984 (risky). U2(s1) = max{-1 + 0.9(0.8*10 + 0.2*4.4), -1 + 0.9(1*4.4)} = max{6.992, 2.96} = 6.992 (finish).',
      hasInteractiveTool: true,
      interactiveToolId: 'value-iteration-solver',
    },
    {
      id: 'ex-5-2',
      title: 'Proposed Exercise 2: Delivery Drone MDP Formulation (Slide 81)',
      slideRef: { lessonId: 'lesson-5', slideNumber: 81, note: 'Delivery drone MDP' },
      problemStatement:
        'A delivery drone must deliver a package from its base to a destination. From base, it selects short route (destination prob 0.7, base wind prob 0.2, loses package prob 0.1) or safe route (checkpoint prob 1.0). From checkpoint, continuing reaches destination with prob 0.9 and base with prob 0.1. Flight reward = -1, delivery = +10, loss = -10, γ = 0.9. Formulate states, transitions, rewards, and write the Bellman optimality equations.',
      formalization: {
        stateSpace: 'Non-terminal S = {Base, Checkpoint}; Terminal F = {Delivered, Lost}',
        actions: 'Base: {Short, Safe}; Checkpoint: {Continue}',
        pathCost: 'R(s, a) = -1; R(Delivered) = +10; R(Lost) = -10',
      },
      solutionExplanation:
        'Bellman equations: U*(Base) = max { -1 + 0.9[0.7*10 + 0.2*U*(Base) + 0.1*(-10)], -1 + 0.9[1.0*U*(Checkpoint)] } = max { 4.4 + 0.18*U*(Base), -1 + 0.9*U*(Checkpoint) }. U*(Checkpoint) = -1 + 0.9[0.9*10 + 0.1*U*(Base)] = 7.1 + 0.09*U*(Base).',
      hasInteractiveTool: true,
      interactiveToolId: 'drone-mdp-formulation',
    },
    {
      id: 'ex-5-3',
      title: 'Proposed Exercise 3: Q-Learning vs. SARSA Numerical Update (Slide 82)',
      slideRef: { lessonId: 'lesson-5', slideNumber: 82, note: 'Q-learning and SARSA manual calculation' },
      problemStatement:
        'An agent executes action a in state s, observing (s, a, r=-1, s\'). Current Q(s, a)=2, α=0.5, γ=0.9. In new state s\', Q(s\', a1)=4, Q(s\', a2)=6. The ε-greedy behavior policy actually selects a1 as next action. 1. Calculate target and new Q(s, a) using Q-learning. 2. Calculate target and new Q(s, a) using SARSA. 3. Explain the difference.',
      formalization: {
        stateSpace: 's, s\'',
        actions: 'a in s; a1, a2 in s\'',
        pathCost: 'r = -1, α = 0.5, γ = 0.9',
      },
      solutionExplanation:
        '1. Q-learning uses greedy max: target y = r + γ max Q(s\', a\') = -1 + 0.9*max(4, 6) = -1 + 5.4 = 4.4. New Q(s, a) = (1 - 0.5)*2 + 0.5*4.4 = 1 + 2.2 = 3.2. 2. SARSA uses actual selected action a1: target y = r + γ Q(s\', a1) = -1 + 0.9*4 = -1 + 3.6 = 2.6. New Q(s, a) = (1 - 0.5)*2 + 0.5*2.6 = 1 + 1.3 = 2.3. 3. Q-learning evaluates optimal greedy continuation (a2); SARSA reflects the exploratory behavior policy that actually selected a1.',
      hasInteractiveTool: true,
      interactiveToolId: 'qlearning-sarsa-calc',
    },
    {
      id: 'ex-5-4',
      title: 'UCLM Exam Problem: Two-Stage Betting MDP (Handwritten & Slide)',
      slideRef: { lessonId: 'lesson-5', slideNumber: 1, note: 'Two-stage betting MDP exam problem' },
      problemStatement:
        'A betting game: Coin 1 tossed with P1(H)=0.70, P1(T)=0.30. Player bets H or T (cost -5). Result observed. Coin 2 tossed with P2(H)=0.15, P2(T)=0.85. Player bets H or T (cost -5). Terminal rewards: 2 correct = +70, 1 correct = +20, 0 correct = -100. γ = 1. Determine states, transition graph, Bellman equations, and optimal predictions.',
      formalization: {
        stateSpace: 'Non-terminal: s0 (initial), sc (1 correct), sw (1 wrong). Terminal: f2 (2 correct), f1 (1 correct), f0 (0 correct)',
        actions: '{H, T}',
        pathCost: 'Action reward = -5; Terminal rewards: R(f2)=+70, R(f1)=+20, R(f0)=-100; γ=1',
      },
      solutionExplanation:
        'Optimal predictions: At s0, predict H because P1(H)=0.70 > 0.30. At sc and sw, predict T because P2(T)=0.85 > 0.15. U*(sc) = -5 + (0.85*70 + 0.15*20) = -5 + 62.5 = 57.5. U*(sw) = -5 + (0.85*20 + 0.15*(-100)) = -5 + 2 = -3.0. U*(s0) = -5 + (0.70*57.5 + 0.30*(-3.0)) = -5 + (40.25 - 0.90) = -5 + 39.35 = 34.35 euros.',
      hasInteractiveTool: true,
      interactiveToolId: 'betting-mdp-solver',
    },
  ],
};

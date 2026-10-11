import type { LessonData } from '../types/course';

export const LESSON_1_DATA: LessonData = {
  id: 'lesson-1',
  number: 1,
  title: 'Introduction to Artificial Intelligence',
  subtitle: 'Basic concepts, historical evolution, disciplines, and current controversies',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 50,
  overview:
    'An academically rigorous introduction establishing what Artificial Intelligence truly is versus popular culture misconceptions. Explores definitions of intelligence, the philosophical debate between computational minds and quantum consciousness, Strong versus Weak AI, the rational agent paradigm, the complete historical trajectory from Aristotle to the 2026 Generative and Agentic AI wave, core disciplines, real-world application domains, and contemporary safety, governance, and ethical debates.',
  prerequisites: [
    'Basic concepts of algorithms and computational complexity',
    'Familiarity with discrete mathematics and formal logic',
  ],
  learningObjectives: [
    'Define Artificial Intelligence from engineering, cognitive, and rational-agent perspectives.',
    'Differentiate between Connectionist (subsymbolic) and Symbolic (rational) paradigms.',
    'Understand why rationality is formalized as expected utility maximization.',
    'Trace the historical boom-and-bust cycles of AI from 1943 to 2026 foundation models.',
    'Examine modern agentic AI workflows and why verification remains essential.',
    'Analyze ethical standards: NIST Risk Management Framework, UNESCO 10 Principles, and enterprise governance.',
  ],
  chapters: [
    {
      id: 'what-is-ai',
      number: 1,
      title: 'What is Artificial Intelligence?',
      slideRange: 'Slides 1–16',
      description:
        'Foundational definitions, philosophical controversies, Strong vs Weak AI, the Turing Test, and the technical definition of rational agents.',
      sections: [
        {
          id: 'definition-and-misconceptions',
          title: 'Defining AI: Fiction vs Reality',
          slideRef: { lessonId: 'lesson-1', slideNumber: 5, note: 'Definition of Artificial Intelligence' },
          summary:
            'AI is not Hollywood humanoid robots; it is the scientific discipline of creating rational systems that solve complex problems and adapt to environments.',
          content: `
### The Core Definition of Artificial Intelligence

In popular media and cinema (*A.I.*, *Terminator*, *The Matrix*, *Eva*, *HAL 9000*), artificial intelligence is often portrayed as sentient androids with human emotions. In computer science and engineering, the formal discipline is grounded in rigorous mathematical and algorithmic foundations.

As defined by **John McCarthy** (who coined the term in 1956 at the Dartmouth Conference):

> *"It is the science and engineering of making intelligent machines, especially intelligent computer programs."*

### What Does "Intelligent" Mean?
While no single universal definition exists across all scientific fields, in computer science an intelligent entity exhibits four key operational capabilities:
1. **Resolution of complex problems**: Finding viable, optimal, or satisfying solutions within vast or combinatorially explosive solution spaces.
2. **Adaptation to the environment**: Perceiving environmental changes through sensors and dynamically altering internal strategies or responses.
3. **Learning**: Inferring generalized patterns, policies, or predictive models from historical data and interaction feedback.
4. **Reasoning**: Inferring new logical conclusions, deductions, or probabilistic beliefs from known premises and environmental percepts.
          `,
          keyTakeaways: [
            'Popular fiction confuses consciousness and android physical bodies with computational intelligence.',
            'John McCarthy defined AI as the science and engineering of intelligent machines and software.',
            'Core capabilities: complex problem solving, environmental adaptation, learning, and reasoning.',
          ],
        },
        {
          id: 'minsky-vs-penrose',
          title: 'Can Machines Be Intelligent? The Great Philosophical Debate',
          slideRef: { lessonId: 'lesson-1', slideNumber: 11, note: 'Minsky vs Penrose controversy' },
          summary:
            'A historic scientific disagreement between computationalism (brain as biological machine) and non-algorithmic consciousness.',
          content: `
### Two Opposing Positions on Machine Consciousness

Since the dawn of AI, researchers and philosophers have debated whether algorithmic computation can ever achieve genuine human intelligence:

#### 1. Marvin Minsky (The Computational View)
> *"Machines can be intelligent, because the human brain is just another machine; as perfect and complex as one may want, but another machine."*
> — **Marvin Minsky**, *Computational Intelligence*

Minsky’s perspective—the cornerstone of mainstream artificial intelligence and cognitive science—posits that human thought is physical symbol manipulation and computational processing implemented on biological neural hardware. Under this view, there is no metaphysical barrier preventing silicon computers from reaching or exceeding human intellectual capabilities.

#### 2. Sir Roger Penrose (The Non-Algorithmic / Quantum View)
> *"Human consciousness is not algorithmic, and therefore it cannot be simulated by a computer. Quantum mechanics plays a key role in the functioning of the brain."*
> — **Roger Penrose**, *The Emperor's New Mind*

Penrose contends that human mathematical insight and subjective conscious awareness are fundamentally non-computable. Drawing upon Gödel's Incompleteness Theorems and proposed quantum gravitational effects in neural microtubules (the Orch-OR model with Stuart Hameroff), Penrose argues that deterministic Turing machines or classical computing architectures can never produce genuine understanding.
          `,
          keyTakeaways: [
            'Minsky argues the brain is a complex machine; thus artificial machines can replicate all mental faculties.',
            'Penrose argues consciousness is non-algorithmic and reliant on quantum physical phenomena in neurons.',
            'Modern AI engineering focuses on functional capabilities rather than resolving metaphysical consciousness.',
          ],
        },
        {
          id: 'strong-vs-weak-ai',
          title: 'Strong AI vs Weak AI Hypotheses',
          slideRef: { lessonId: 'lesson-1', slideNumber: 12, note: 'Strong vs weak hypothesis' },
          summary:
            'Contrasting Artificial General Intelligence (AGI) with practical Narrow AI applied to dedicated domain tasks.',
          content: `
### The Two Paradigms of AI Research

* **Strong AI Hypothesis (Artificial General Intelligence - AGI)**:
  Asserts that it is possible to engineer machines with full general intelligence equal to or surpassing human beings across all cognitive, social, creative, and abstract domains. Under this view, an appropriately programmed computer literally possesses a mind.

* **Weak AI Hypothesis (Narrow AI)**:
  Asserts that computers cannot possess actual subjective consciousness or generalized human-like minds, but can successfully solve specific complex problems by **imitating** intelligent behaviors. Every working production system today (speech recognition, chess engines, protein structure prediction, large language models) operates under the Weak AI paradigm.

#### Minsky’s Pragmatic Engineering Definition
To bypass metaphysical debates about whether a machine truly "thinks", Marvin Minsky provided a pragmatic benchmark:

> *"AI is the science which allows machines doing things that would require intelligence if done by human beings."*
          `,
          keyTakeaways: [
            'Strong AI claims machines can possess genuine general minds (AGI).',
            'Weak AI focuses on solving specific tasks by imitating intelligent behavior (Narrow AI).',
            'All existing AI systems in industry and science operate as Narrow/Weak AI implementations.',
          ],
        },
        {
          id: 'turing-test-and-evaluation',
          title: 'Evaluating Machine Intelligence: The Turing Test',
          slideRef: { lessonId: 'lesson-1', slideNumber: 13, note: 'Turing test and open problem of AI evaluation' },
          summary:
            'Alan Turing’s operational imitation game and modern open questions in evaluating artificial intelligence.',
          content: `
### The Turing Test (1950)

In his landmark paper *Computing Machinery and Intelligence*, **Alan Turing** replaced the question *"Can machines think?"* with an operational protocol: **The Imitation Game**.

#### Protocol:
1. A human interrogator communicates via text terminal with two hidden entities: one human and one computer system.
2. The interrogator asks arbitrary questions to discern which entity is the machine.
3. If the interrogator cannot reliably tell the machine from the human, the machine passes the test.

#### Limitations & Open Questions:
While historically groundbreaking, the Turing Test tests **human behavioral simulation and deception** rather than true rationality or objective problem solving. Modern research (e.g., José Hernández-Orallo, *AI Evaluation: Past, Present and Future*, 2014) highlights that evaluation must measure cognitive abilities, universal task performance, and sample efficiency across structured benchmarks rather than linguistic disguise.
          `,
          keyTakeaways: [
            'The Turing Test evaluates conversational indistinguishability from a human.',
            'Passing the Turing test measures human imitation rather than optimal rationality.',
            'Modern AI evaluation requires universal task metrics rather than conversational deception.',
          ],
        },
        {
          id: 'connectionist-vs-symbolic',
          title: 'Two Pillars: Connectionist vs Symbolic Paradigms',
          slideRef: { lessonId: 'lesson-1', slideNumber: 14, note: 'Approaches to the AI problem' },
          summary:
            'The foundational divide between subsymbolic neuro-computational learning and rational symbolic reasoning.',
          content: `
### The Historical Divide in Artificial Intelligence

From the 1950s onward, AI research split into two competing philosophical and algorithmic approaches:

| Dimension | Connectionist Approach (Subsymbolic) | Symbolic Approach (Classical / GOFAI) |
|---|---|---|
| **Inspiration** | Brain physiology, neuroscience, biological neural networks | Formal logic, rational philosophy, mathematical reasoning |
| **Core Hypothesis** | Intelligence emerges from high-dimensional numeric weight adjustments in interconnected networks | Intelligence is achieved through the manipulation of explicit symbols according to formal rules |
| **Methods** | Artificial Neural Networks, Backpropagation, Deep Learning, Foundation Models | Knowledge-Based Systems, First-Order Logic, Production Rules, State Space Search |
| **Strengths** | Continuous perception, speech, vision, pattern recognition, fault tolerance | Transparent explainability, provable correctness, deterministic guarantees, zero hallucination |
| **Weaknesses** | "Black box" opacity, requires vast training data, unpredictable edge-case failures | Brittle in noisy physical environments, combinatorial knowledge acquisition bottleneck |

Modern state-of-the-art systems increasingly combine both: learned foundation models generate plans, while symbolic search and constraint solvers verify and execute them.
          `,
          keyTakeaways: [
            'Connectionism models the biological brain through numerical weights and statistical learning.',
            'Symbolism models rational thought through formal logic and explicit symbol manipulation.',
            'The future of Intelligent Systems lies in hybrid neuro-symbolic architectures.',
          ],
        },
        {
          id: 'rational-agents-and-utility',
          title: 'Rationality, Utility, and the Rational Agent Perspective',
          slideRef: { lessonId: 'lesson-1', slideNumber: 15, note: 'Rational acts, decisions, and utility' },
          summary:
            'Why university AI courses adopt the rational agent perspective: maximizing expected utility through purposeful actions.',
          content: `
### Technical Definition of Rationality

In Intelligent Systems, **rationality** does not mean thinking like a human, nor does it imply omniscience or perfection. Rather, rationality is a technical mathematical concept:

> **Rationality**: Reaching pre-defined goals in the best possible way, evaluated by the **decisions taken** and their outcomes, rather than the psychological process of taking them.

Goals are mathematically formulated in terms of **utility functions** $U(s)$. A rational action is one that maximizes the **expected utility** given the percept sequence observed up to that point.

### What is an Agent?
The word *agent* derives from the Latin *agere* ("to act" / "to drive"):
* An **agent** is an entity that perceives its environment through sensors and acts upon that environment through actuators.
* A **rational agent** is one whose actions attempt to reach the best result, or under conditions of uncertainty, the **best expected result**.

### Five Defining Properties Expected of Computing Agents:
1. **Autonomous control**: Operating without constant direct human intervention.
2. **Environmental perception**: Sensing and internalizing changes in its task environment.
3. **Temporal persistence**: Running continuously over time rather than executing a one-shot batch function.
4. **Adaptive flexibility**: Adjusting strategy when environmental dynamics or state transitions change.
5. **Goal-directedness**: Choosing actions purposefully to achieve specific objectives.
          `,
          keyTakeaways: [
            'Rationality means maximizing expected utility based on percept history.',
            'Rationality focuses on decisions and outcomes, not human cognitive imitation.',
            'Agents perceive via sensors, process via agent programs, and act via actuators.',
          ],
        },
      ],
    },
    {
      id: 'history-of-ai',
      number: 2,
      title: 'Historical Evolution of AI (1940s–2026)',
      slideRange: 'Slides 17–25',
      description:
        'A comprehensive timeline tracing the discipline from Aristotle and Boole to the 2026 Generative and Agentic AI revolution.',
      sections: [
        {
          id: 'early-foundations',
          title: 'Antecedents & The Birth of AI (300 BC – 1979)',
          slideRef: { lessonId: 'lesson-1', slideNumber: 18, note: 'Antecedents & First stages' },
          summary:
            'From Aristotelian syllogisms and Boolean logic to the 1943 artificial neuron, Dartmouth conference, ELIZA, and expert systems.',
          content: `
### Antecedents (Pre-1950)
* **300 BC (Aristotle)**: Syllogisms. The first formalization of deductive reasoning: if premises are true, conclusions necessarily follow.
* **1837 (George Boole)**: Propositional logic and Boolean algebra, reducing logical deduction to binary algebraic operations.
* **1940s**: First electronic digital computers (ENIAC, Colossus), enabling automated calculation and information processing.
* **1943 (Warren McCulloch & Walter Pitts)**: First mathematical model of an **artificial neuron**. Modeled biological dendrites as inputs, cell body as summation $\\sum$, and axon output governed by an all-or-none activation threshold.

### First Stages of AI (1950–1979)
* **1950 (Alan Turing)**: Publishes *Computing Machinery and Intelligence*, introducing the Turing Test, machine learning concepts, and genetic algorithms.
* **1956 (John McCarthy, Marvin Minsky, Claude Shannon, Nathaniel Rochester)**: The **Dartmouth Summer Research Project on Artificial Intelligence**. The birth of the discipline; McCarthy introduces the term *"Artificial Intelligence"*.
* **1959 (Bernard Widrow & Ted Hoff)**: Develop **ADALINE / MADALINE**, the first artificial neural network applied to physical problems (adaptive filter for telephone line noise).
* **1964 (Joseph Weizenbaum)**: Creates **ELIZA**, the first conversational natural language program simulating a Rogerian psychotherapist via pattern matching and script substitution.
* **1967 (Edward Feigenbaum et al.)**: Develops **DENDRAL**, the world's first Knowledge-Based System (KBS) / Expert System (ES), inferring chemical molecular structures from mass spectrometry.
* **1979 (Edward Shortliffe)**: Develops **MYCIN**, a medical expert system with ~600 rules for diagnosing blood infectious diseases, performing at par with human infectious disease specialists.
          `,
          keyTakeaways: [
            '1943 McCulloch-Pitts neuron initiated connectionist AI.',
            '1956 Dartmouth Conference formally founded AI as a distinct academic field.',
            '1960s-70s saw the emergence of Knowledge-Based Systems (DENDRAL, MYCIN).',
          ],
        },
        {
          id: 'boom-winter-deep-learning',
          title: 'Maturity, AI Winter, and the Deep Learning Era (1980–2021)',
          slideRef: { lessonId: 'lesson-1', slideNumber: 20, note: 'Maturity, winter, and deep learning' },
          summary:
            'The industrial expert systems boom, the harsh AI winter, the revival of backpropagation, Deep Blue, ImageNet, and AlphaFold.',
          content: `
### Maturity & Winter of AI (1980–2000)
* **1980–1988 (The Expert Systems Boom)**: Corporate industry invested billions in LISP machines and rule-based expert systems (e.g., XCON at Digital Equipment Corporation).
* **1986 (Rumelhart, Hinton, Williams)**: Popularization of the **Backpropagation algorithm**, enabling effective multi-layer neural network training and reviving connectionism.
* **1988–1993 (The Second AI Winter)**: High maintenance costs, brittle edge-case failures of rule bases, and collapse of specialized LISP hardware collapsed funding and public expectations.
* **1995 (Agent-Based Paradigm)**: Stuart Russell and Peter Norvig publish *Artificial Intelligence: A Modern Approach*, unifying AI under the rational agent framework.
* **1997 (IBM Deep Blue)**: Defeats world chess champion Garry Kasparov ($3.5 - 2.5$) using specialized search hardware evaluating 200 million positions per second with alpha-beta search.
* **1990s onward**: Machine learning and statistical data mining become dominant as internet data proliferates.

### The Modern Renaissance (2000–2021)
* **2002**: Roomba (iRobot) brings autonomous behavior-based robotics into consumer homes.
* **2007–2009**: The rise of Big Data, GPU parallel computing, and Google's autonomous driving project.
* **2011**: Virtual assistants emerge (Siri, Google Now, Echo/Alexa); IBM Watson wins *Jeopardy!* against human grand champions Ken Jennings and Brad Rutter.
* **2012 (AlexNet)**: Alex Krizhevsky, Ilya Sutskever, and Geoffrey Hinton win the ImageNet challenge by a huge margin using deep convolutional networks on GPUs, igniting the modern Deep Learning revolution.
* **2014 (GANs)**: Ian Goodfellow invents Generative Adversarial Networks for photorealistic image synthesis.
* **2016 (AlphaGo)**: DeepMind's AlphaGo defeats 18-time world Go champion Lee Sedol ($4 - 1$) combining deep neural networks with Monte Carlo Tree Search.
* **2017 (The Transformer)**: Vaswani et al. publish *Attention Is All You Need*, replacing recurrent networks with self-attention—the architectural foundation of modern LLMs.
* **2020 (GPT-3)**: Demonstrates few-shot in-context learning at scale across diverse linguistic tasks.
* **2021 (AlphaFold 2)**: DeepMind solves the 50-year-old protein folding problem, predicting 3D structures with atomic accuracy.
          `,
          keyTakeaways: [
            'AI winters resulted from overpromising and brittle symbolic rule architectures.',
            'AlexNet (2012) proved that massive datasets + GPU computing + deep architectures unlock superhuman perception.',
            'The Transformer architecture (2017) catalyzed modern foundation models.',
          ],
        },
        {
          id: 'generative-and-agentic-wave',
          title: 'The Generative AI & Agentic Wave (2020–2026)',
          slideRef: { lessonId: 'lesson-1', slideNumber: 23, note: 'Generative AI wave and why it feels different' },
          summary:
            'From specialized isolated models to general-purpose multimodal interfaces, test-time reasoning, and agentic tool workflows.',
          content: `
### Why the Current Era Feels Different (2020–2026)

In previous eras, computer vision, speech recognition, translation, and code generation required completely separate software pipelines and specialized models. The modern foundation model wave changed this fundamentally:

1. **Foundation Models**: A single massive pretrained model adapts to hundreds of downstream tasks via natural language instructions, few-shot examples, or fine-tuning.
2. **Native Multimodality**: Models seamlessly interleave text, high-resolution imagery, audio waveforms, video, and code in a shared token space.
3. **Tool Use & Code Execution**: Models are no longer isolated text predictors; they query search engines, interact with databases, execute Python scripts, and invoke external APIs.
4. **Natural Language as Universal Interface**: English (and other natural languages) has become the primary programming language for software interaction.
5. **Reasoning Models (Test-Time Compute)**: Rather than responding immediately, modern reasoning models allocate dynamic thinking time to search through step-by-step verification paths before producing final answers.

### Critical Academic Principle: Verification Still Matters
> *"Outputs remain probabilistic. Fluency does not ensure correctness, so verification and human judgement remain essential."* (Slide 24)

Generative models lack deterministic truth guarantees. They can hallucinate plausible-sounding falsehoods and accumulate compounding errors over multi-step tasks.
          `,
          keyTakeaways: [
            'Foundation models unified previously fragmented computer vision, NLP, and code disciplines.',
            'Modern agentic systems combine generative fluency with deterministic tools and external memory.',
            'Linguistic fluency does not guarantee factual correctness; verification remains non-negotiable.',
          ],
        },
      ],
    },
    {
      id: 'areas-and-applications',
      number: 3,
      title: 'Main Areas and Practical Applications',
      slideRange: 'Slides 26–39',
      description:
        'The relationship between AI, Machine Learning, and Deep Learning; core research methods; and industrial/scientific deployments.',
      sections: [
        {
          id: 'ai-ml-dl-relationship',
          title: 'AI, Machine Learning, and Deep Learning: Related, Not Equivalent',
          slideRef: { lessonId: 'lesson-1', slideNumber: 27, note: 'Venn diagram AI vs ML vs DL' },
          summary:
            'Understanding proper taxonomic hierarchy: Learning is central to modern AI, but it does not encompass all of Intelligent Systems.',
          content: `
### The Taxonomic Venn Diagram

A critical misconception among junior developers is treating "AI" as a synonym for "Deep Learning" or "Machine Learning". The formal hierarchy is:

1. **Artificial Intelligence (Broadest)**:
   The encompassing science of designing rational entities. Includes state space search, heuristic algorithms, planning, knowledge representation, formal logic, combinatorial optimization, and decision theory.
2. **Machine Learning (Subset)**:
   Algorithms that automatically improve their performance at task $T$ with experience $E$ without being explicitly programmed with deterministic rules. Includes linear regression, decision trees, support vector machines, and clustering.
3. **Deep Learning (Sub-subset)**:
   A specific family of machine learning based on artificial neural networks with multiple processing layers (representation learning), capable of learning hierarchical feature representations directly from raw data.

### Course Perspective
Foundation models connect several areas of AI, but they **do not replace classical methods**. For safety-critical navigation, games, logistics, and constraint satisfaction, exact state space search and optimization remain irreplaceable. This course therefore focuses on **search, agents, optimization, metaheuristics, and introductory machine learning**.
          `,
          keyTakeaways: [
            'AI $\\supset$ Machine Learning $\\supset$ Deep Learning.',
            'Learning is central to modern AI, but does not encompass all of it.',
            'Classical search and optimization methods provide deterministic correctness where probabilistic models fail.',
          ],
        },
        {
          id: 'real-world-application-spectrum',
          title: 'Comprehensive Spectrum of Real-World AI Applications',
          slideRef: { lessonId: 'lesson-1', slideNumber: 30, note: 'Application areas from slides 30–39' },
          summary:
            'From medical decision support and combinatorial logistics to robotics and scientific discovery.',
          content: `
### Key Industrial & Scientific Domains (Slides 30–39):

* **Knowledge-Based Systems (KBS)**: Clinical decision support, fault diagnosis in avionics/automotive systems, equipment configuration, intelligent tutoring systems.
* **Combinatorial Optimization**: 2D/3D strip packing, electronic circuit layout, parameter tuning, hospital staff rostering, warehouse logistics routing.
* **Adversarial Games**: Chess, Go, poker, adaptive non-player character (NPC) behavior in video games, macroeconomic multi-agent simulations.
* **Automated Planning**: Space exploration probe planning, automated warehousing, multi-vehicle delivery scheduling.
* **Perception & Natural Language**: Computer vision (autonomous vehicle RGB + LiDAR + Depth segmentation), medical tomography segmentation (MRI/CT scans), real-time speech translation.
* **Reasoning Models & Agentic AI**: Multi-step goal decomposition (Think & Plan $\\to$ Execute Tool $\\to$ Self-Reflect $\\to$ Update Memory).
* **Embodied AI & Intelligent Robotics**: Vision-Language-Action (VLA) models (e.g. Gemini Robotics 2025/2026), connecting spatial perception with physical motor control.
* **AI for Scientific Discovery**: AlphaFold 3 (predicting biomolecular complexes of proteins, DNA, RNA, and ligands), material synthesis generative exploration, climate forecasting.
          `,
          keyTakeaways: [
            'Search algorithms underpin combinatorial optimization, planning, and gaming.',
            'Embodied AI bridges multimodal understanding with physical robotic manipulation.',
            'Scientific discovery systems like AlphaFold represent high-impact applied AI.',
          ],
        },
      ],
    },
    {
      id: 'current-controversies',
      number: 4,
      title: 'Current Controversies, Ethics & Responsible AI',
      slideRange: 'Slides 40–50',
      description:
        'Present harms vs frontier risks, the scientific safety disagreement, the NIST AI Risk Management Framework, UNESCO standards, and corporate governance.',
      sections: [
        {
          id: 'ai-risk-debate',
          title: 'The AI Risk Debate: Present Harms vs Frontier Risks',
          slideRef: { lessonId: 'lesson-1', slideNumber: 41, note: 'The AI risk debate has changed' },
          summary:
            'Analyzing documented present harms versus speculative frontier risks, and the scientific disagreement between Hinton/Bengio and LeCun.',
          content: `
### Two Categories of Risk

As documented in the *International AI Safety Report 2026* (chaired by Turing Award laureate **Yoshua Bengio** with over 100 independent scientific experts):

1. **Documented Present Harms**:
   - Algorithmic discrimination and systemic demographic bias.
   - Large-scale automated misinformation and synthetic deepfakes.
   - Fraud, voice cloning, and social engineering attacks.
   - Privacy loss, mass surveillance, and copyright infringement.
2. **Frontier & Catastrophic Risks**:
   - Advanced agentic systems operating with high autonomy and access to critical infrastructure.
   - Dual-use biological risks (autonomous design of pathogens).
   - Loss of human oversight in automated defensive and financial networks.

### A Genuine Scientific Disagreement
* **Geoffrey Hinton & Yoshua Bengio** (Precautionary Stance):
  Hinton (Nobel Banquet Speech 2024) warned that advanced AI may soon create unprecedented security vulnerabilities. Bengio founded *LawZero* to advocate for legal brakes and prioritizing safety over commercial haste.
* **Yann LeCun** (Pragmatic / Demystifying Stance):
  Contends that existential takeover scenarios are vastly exaggerated science fiction. Current systems are autoregressive token predictors that lack intrinsic intentionality, common-sense world models, or true agency, and engineering safeguards can be progressively deployed as systems evolve.
          `,
          keyTakeaways: [
            'Present harms (bias, misinformation, fraud) are documented and immediate.',
            'Frontier risks concern high-autonomy systems and catastrophic dual-use capabilities.',
            'The debate between Hinton/Bengio and LeCun centers on urgency, likelihood, and regulatory models.',
          ],
        },
        {
          id: 'responsible-ai-governance',
          title: 'Responsible AI Frameworks: NIST, UNESCO & Microsoft',
          slideRef: { lessonId: 'lesson-1', slideNumber: 46, note: 'Responsible AI lifecycle & standards' },
          summary:
            'Operational engineering governance: The NIST AI RMF lifecycle, UNESCO 10 core principles, and enterprise safety controls.',
          content: `
### 1. The NIST AI Risk Management Framework (RMF) Lifecycle
Responsible AI is not an abstract slogan; it is a continuous engineering lifecycle comprising four core functions:

* **GOVERN**: Establish institutional ownership, compliance structures, risk tolerances, and acceptable-use rules.
* **MAP**: Identify operational context, target user populations, dependencies, and potential direct/indirect harms.
* **MEASURE**: Rigorously benchmark system quality, hallucination rates, bias metrics, adversarial robustness, and red-teaming vulnerabilities.
* **MANAGE**: Implement technical guardrails (system prompts, input sanitization, least-privilege tool execution, real-time logging, circuit breakers).

### 2. UNESCO’s 10 Core Principles on the Ethics of AI (2021)
Adopted by 193 member states as the first global standard grounded in human rights:
1. *Proportionality and Do No Harm*
2. *Safety and Security*
3. *Privacy and Data Protection*
4. *Multi-stakeholder and Adaptive Governance*
5. *Responsibility and Accountability*
6. *Transparency and Explainability*
7. *Human Oversight and Determination*
8. *Sustainability (Environmental & Social)*
9. *Awareness and AI Literacy*
10. *Fairness and Non-discrimination*

### 3. Enterprise Implementation in Practice (Microsoft 2026)
Translates principles into engineering controls:
* **Accountability & Transparency** form the structural foundation.
* **Fairness, Reliability & Safety, Privacy & Security, Inclusiveness** are verified through mandatory impact assessments and pre-release security reviews.
* For **Agentic AI**: Systems must implement strict permission tiers, read-only memory partitions, and mandatory human confirmation before executing irreversible real-world actions.
          `,
          keyTakeaways: [
            'The NIST AI RMF structures safety into Govern, Map, Measure, and Manage functions.',
            'UNESCO establishes 10 global human-rights-centered ethical principles.',
            'Agentic AI governance requires least-privilege tool access and mandatory human confirmation.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'ex-l1-1',
      title: 'Turing Test vs Rational Agent Comparison',
      slideRef: { lessonId: 'lesson-1', slideNumber: 13 },
      problemStatement:
        'Contrast Alan Turing’s imitation game with the rational agent paradigm. Provide an example where a system acts completely rationally according to utility maximization, yet fails the Turing Test, and vice versa.',
      formalization: {
        stateSpace: 'Behavioral linguistic interactions vs Decision outcomes under utility $U(s)$',
        goalTest: 'Indistinguishable from human conversationalist vs Maximizing expected utility $E[U]$',
      },
      solutionExplanation:
        'A chess engine (like Stockfish) playing optimal moves maximizes expected utility (rational agent), but if asked to chat about childhood memories or intentionally make emotional mistakes, it would immediately fail the Turing Test. Conversely, an ELIZA chatbot or a deceptive human actor who cannot calculate chess moves or medical diagnoses could pass a superficial conversational Turing test while making completely irrational decisions.',
      hasInteractiveTool: false,
    },
    {
      id: 'ex-l1-2',
      title: 'McCulloch-Pitts Neuron Activation Calculation',
      slideRef: { lessonId: 'lesson-1', slideNumber: 18 },
      problemStatement:
        'Design a McCulloch-Pitts artificial neuron with binary inputs $x_1, x_2 \\in \\{0, 1\\}$ and weights $w_1 = 1, w_2 = 1$. Determine the threshold $\\theta$ needed to implement (a) a logical AND function, and (b) a logical OR function.',
      formalization: {
        actions: 'Compute $\\sum_{i=1}^n w_i x_i \\ge \\theta$',
      },
      solutionExplanation:
        'For logical AND: $(x_1, x_2) = (1,1) \\implies \\sum = 2$; all other input pairs yield $\\sum \\le 1$. Setting threshold $\\theta = 2$ activates the neuron only when both inputs are 1. For logical OR: $(0,1) \\to 1, (1,0) \\to 1, (1,1) \\to 2$; only $(0,0) \\to 0$. Setting $\\theta = 1$ activates the neuron whenever at least one input is 1.',
      hasInteractiveTool: true,
      interactiveToolId: 'neuron-simulator',
    },
  ],
};

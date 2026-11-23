import type { LessonData } from '../types/course';

export const LESSON_9_DATA: LessonData = {
  id: 'lesson-9',
  number: 9,
  title: 'Machine Learning Foundations & Generalization',
  subtitle:
    'Learning paradigms, data-driven vs rule-based systems, loss functions, train-validation-test splitting, and the bias-variance tradeoff',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 54,
  overview:
    'Introduces the foundational principles of Machine Learning. Contrasts classical deductive rule-based programming with inductive learning from empirical data. Formalizes the three core paradigms: Supervised Learning (labeled pairs), Unsupervised Learning (discovering latent patterns and clusters), and Reinforcement Learning (learning through environment interaction and reward feedback). Examines empirical risk minimization, regression and classification loss functions, the necessity of independent training, validation, and test partitions, and the fundamental phenomenon of overfitting vs. underfitting governed by the bias-variance tradeoff.',
  prerequisites: [
    'Reinforcement Learning agent-environment paradigm (Lesson 5)',
    'Combinatorial Optimization objective functions (Lesson 6)',
    'Linear algebra, multivariable calculus, and probability theory',
  ],
  learningObjectives: [
    'Contrast classical deductive programming (Rules + Data → Answers) with inductive Machine Learning (Data + Answers → Rules).',
    'Classify machine learning tasks into Supervised, Unsupervised, and Reinforcement Learning based on feedback type.',
    'Formulate standard loss functions: Mean Squared Error (MSE) for regression and Cross-Entropy / 0-1 loss for classification.',
    'Explain the role of training, validation, and test datasets in preventing data leakage and ensuring honest evaluation.',
    'Analyze the Bias-Variance tradeoff: identify underfitting (high bias) and overfitting (high variance) from learning curves.',
    'Apply k-fold cross-validation to maximize data efficiency when tuning model hyperparameters.',
  ],
  chapters: [
    {
      id: 'ml-paradigms-and-classical-contrast',
      number: 1,
      title: 'The Machine Learning Paradigm Shift',
      slideRange: 'Slides 1–18',
      description:
        'Inductive vs deductive learning, historical context, Supervised vs Unsupervised vs Reinforcement learning.',
      sections: [
        {
          id: 'classical-vs-ml',
          title: 'Classical Programming vs. Machine Learning',
          slideRef: { lessonId: 'lesson-9', slideNumber: '1–8' },
          summary: 'Inverting the software engineering paradigm from manual rules to data-driven induction.',
          content: `### The Fundamental Inversion

In **Classical Programming**, a human engineer manually crafts explicit deterministic rules and writes algorithms:
$$\\text{Input Data} + \\text{Handcrafted Rules} \\longrightarrow \\text{Answers / Decisions}$$

In **Machine Learning**, the computer automatically induces the rules and mapping functions from empirical observations:
$$\\text{Input Data} + \\text{Desired Answers / Feedback} \\longrightarrow \\text{Learned Model (Rules)}$$

#### Why Machine Learning?
- Complex real-world perceptual tasks (e.g., computer vision, speech recognition, natural language translation) cannot be specified through manual \`if-else\` rules.
- Algorithms adapt autonomously to changing data distributions without requiring manual recoding.`,
          keyTakeaways: [
            'Classical programming requires writing explicit rules; ML induces rules from data.',
            'ML models learn a mapping function f: X → Y by optimizing empirical parameters.',
          ],
        },
        {
          id: 'three-core-paradigms',
          title: 'The Three Main Machine Learning Paradigms',
          slideRef: { lessonId: 'lesson-9', slideNumber: '9–18' },
          summary: 'Supervised, Unsupervised, and Reinforcement Learning taxonomy.',
          content: `### Taxonomy of Machine Learning Paradigms

| Paradigm | Training Signal | Target Goal | Canonical Examples |
| :--- | :--- | :--- | :--- |
| **Supervised Learning** | Labeled dataset $\\mathcal{D} = \\{(x_i, y_i)\\}_{i=1}^N$ | Learn mapping $f(x) \\approx y$ | Classification (Spam detection, tumor diagnosis), Regression (house price prediction) |
| **Unsupervised Learning** | Unlabeled dataset $\\mathcal{D} = \\{x_i\\}_{i=1}^N$ | Discover latent structure, clusters, or density $p(x)$ | $k$-Means clustering, Principal Component Analysis (PCA), Anomaly detection |
| **Reinforcement Learning** | Scalar reward feedback $r_t$ from environment | Learn policy $\\pi(a \\mid s)$ maximizing cumulative return $G_t$ | Game playing (AlphaGo, Atari), robot locomotion, autonomous driving |`,
          keyTakeaways: [
            'Supervised learning relies on explicit ground-truth labels (y).',
            'Unsupervised learning discovers intrinsic patterns without external guidance.',
            'Reinforcement learning optimizes behaviors via trial-and-error reward signals.',
          ],
        },
      ],
    },
    {
      id: 'generalization-and-bias-variance',
      number: 2,
      title: 'Generalization, Overfitting & Model Validation',
      slideRange: 'Slides 19–54',
      description:
        'Underfitting, overfitting, the bias-variance tradeoff, loss functions, and train/validation/test partitions.',
      sections: [
        {
          id: 'overfitting-and-underfitting',
          title: 'Generalization, Overfitting & The Bias-Variance Tradeoff',
          slideRef: { lessonId: 'lesson-9', slideNumber: '19–34' },
          summary: 'Why achieving zero training error often leads to disastrous real-world performance.',
          content: `### Generalization: The True Goal of Machine Learning

A machine learning model must perform well on **unseen test data**, not merely memorize its training examples.

#### The Three Model Regimes
1. **Underfitting (High Bias)**:
   - The model is too simple to capture the underlying data patterns (e.g., fitting a linear line to quadratic data).
   - Characterized by: **High Training Error** and **High Test Error**.
2. **Optimal Generalization (Balanced Tradeoff)**:
   - The model captures the underlying systemic relationship while ignoring idiosyncratic noise.
   - Characterized by: **Low Training Error** and **Low Test Error**.
3. **Overfitting (High Variance)**:
   - The model is excessively complex (e.g., 10th-degree polynomial), fitting spurious noise and measurement outliers.
   - Characterized by: **Near-Zero Training Error**, but **Severe Surging Test Error**!

$$\\text{Expected Error} = \\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Noise } \\sigma^2$$`,
          keyTakeaways: [
            'Training error measures memorization; test error measures generalization.',
            'Overfitting occurs when a complex model memorizes noise instead of systemic patterns.',
            'The bias-variance tradeoff dictates that reducing bias typically increases variance.',
          ],
        },
        {
          id: 'train-val-test-split',
          title: 'Data Partitioning: Train, Validation, and Test Sets',
          slideRef: { lessonId: 'lesson-9', slideNumber: '35–54' },
          summary: 'Avoiding data leakage and conducting honest performance evaluation.',
          content: `### The Golden Rule of Evaluation

Never evaluate a machine learning model on the data it was trained on!

#### The Three-Way Partition
- **Training Set (60–70%)**: Used by the optimization algorithm to adjust model parameters (e.g., weights $w$).
- **Validation Set (15–20%)**: Used by the engineer to compare different algorithms and tune hyperparameters (e.g., polynomial degree $d$, regularization $\\lambda$, $k$ in $k$-NN).
- **Test Set (15–20%)**: Kept in a vault and accessed **only once** at the very end to provide an unbiased estimate of real-world generalization performance.

#### $k$-Fold Cross-Validation
When data is scarce, split the training data into $k$ equal folds. Train on $k-1$ folds and validate on the remaining fold, repeating $k$ times and averaging the validation scores.`,
          keyTakeaways: [
            'Training set fits parameters; validation set tunes hyperparameters.',
            'Test set must never be touched during model development to prevent data leakage.',
            'k-fold cross-validation maximizes data efficiency when data is limited.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'prop-ex-ml-paradigms',
      title: 'Classifying AI Problems into Machine Learning Paradigms',
      slideRef: { lessonId: 'lesson-9', slideNumber: 15 },
      problemStatement:
        'For each of the following scenarios, classify the problem into Supervised Learning, Unsupervised Learning, or Reinforcement Learning: 1) Classifying customer reviews as positive or negative based on 10,000 human-labeled reviews. 2) Grouping online shopping users into 5 behavioral clusters based on browsing logs without predefined categories. 3) Training an autonomous quadcopter to balance in turbulent wind by receiving positive rewards for staying level and negative penalties for crashing.',
      formalization: {
        stateSpace: 'Set of real-world application scenarios.',
        initialState: 'Input problem descriptions.',
        actions: 'Assign paradigm tag: Supervised, Unsupervised, or Reinforcement.',
        successorFunction: 'Examine presence of ground-truth labels vs reward signals.',
        goalTest: 'Accurate classification of all 3 tasks.',
        pathCost: 'Zero misclassifications.',
      },
      solutionExplanation:
        '1) Supervised Learning: explicit ground truth labels (positive/negative) are provided for each review. 2) Unsupervised Learning: no target labels exist; the algorithm discovers latent groupings (clustering). 3) Reinforcement Learning: the quadcopter interacts dynamically with the environment and learns via scalar reward/penalty signals.',
      hasInteractiveTool: true,
      interactiveToolId: 'ml-paradigms-explorer',
    },
    {
      id: 'prop-ex-overfitting-diagnosis',
      title: 'Diagnosing Overfitting from Learning Curve Data',
      slideRef: { lessonId: 'lesson-9', slideNumber: 30 },
      problemStatement:
        'A student trains three polynomial regression models on a dataset of 50 samples. Model A has Train MSE = 4.2, Val MSE = 4.5. Model B has Train MSE = 1.1, Val MSE = 1.2. Model C has Train MSE = 0.02, Val MSE = 18.7. 1) Diagnose each model as Underfitting, Well-Fitted, or Overfitting. 2) Which model should be deployed in production?',
      formalization: {
        stateSpace: 'Model performance metrics across Train and Validation splits.',
        initialState: 'Models A, B, and C with reported MSE values.',
        actions: 'Compare Train MSE and Val MSE magnitudes and divergence.',
        successorFunction: 'Identify bias vs variance symptoms.',
        goalTest: 'Select best generalizing model.',
        pathCost: 'Generalization error on unseen data.',
      },
      solutionExplanation:
        '1) Model A has high train and validation error: Underfitting (High Bias). Model B achieves low train error and closely matching low validation error: Well-Fitted (Optimal Generalization). Model C achieves near-zero train error (0.02) but huge validation error (18.7): Severe Overfitting (High Variance; memorizing training noise). 2) Model B must be deployed, as it achieves the lowest validation error (1.2).',
      hasInteractiveTool: true,
      interactiveToolId: 'overfitting-underfitting-lab',
    },
  ],
};

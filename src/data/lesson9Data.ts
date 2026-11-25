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
          content: `### The Machine Learning Paradigm Shift (Slides 1–8)

In **Classical Programming**, a human engineer manually crafts explicit deterministic rules and algorithms:
$$\\text{Input Data} + \\text{Handcrafted Rules} \\longrightarrow \\text{Answers / Decisions}$$

In **Machine Learning**, the computer automatically induces the rules and mapping functions from empirical observations:
$$\\text{Input Data} + \\text{Ground Truth Labels / Feedback} \\longrightarrow \\text{Learned Model (Rules)}$$

#### Direct Comparison: Classical Software vs. Machine Learning

| Dimension | Classical Software Engineering | Inductive Machine Learning |
| :--- | :--- | :--- |
| **Logic Source** | Human programmer writes \`if-else\` rules | Inductive algorithm learns weights from training data |
| **Problem Type** | Deterministic business logic, compilers, sorting | Perceptual tasks (vision, audio, NLP), recommendation |
| **Adaptability** | Rigid; requires manual code change for new cases | Dynamic; updates automatically when retrained on new data |
| **Debugging** | Trace stack, inspect logical conditions | Inspect loss curves, confusion matrices, data distributions |
| **Evaluation** | Unit testing, formal verification ($100\\%$ pass) | Generalization testing on unseen test partitions |`,
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
          content: `### Taxonomy of Machine Learning Paradigms (Slides 9–18)

| Paradigm | Training Signal $\\mathcal{D}$ | Optimization Objective | Feedback Latency | Canonical Algorithms |
| :--- | :--- | :--- | :--- | :--- |
| **Supervised Learning** | Labeled pairs $\\{(x_i, y_i)\\}_{i=1}^N$ with ground truth $y_i$ | Minimize prediction loss: $\\min_w \\frac{1}{N}\\sum L(f(x_i; w), y_i)$ | Instantaneous per example | $k$-NN, Decision Trees, Logistic Regression, Linear Regression, SVM |
| **Unsupervised Learning** | Unlabeled feature vectors $\\{x_i\\}_{i=1}^N$ | Discover latent clusters, density, or low-dimensional manifolds | No external feedback; intrinsic geometry | $k$-Means, Hierarchical Clustering, PCA, Autoencoders |
| **Reinforcement Learning** | Dynamic state-action-reward tuples $(s_t, a_t, r_t, s_{t+1})$ | Maximize expected cumulative return: $\\max_\\pi \\mathbb{E}[\\sum \\gamma^t r_t]$ | Delayed evaluative rewards | Q-Learning, SARSA, Policy Gradients, Actor-Critic |

> 🎯 **Hands-on Clustering & Taxonomy Exploration**:
> Explore the 2D $k$-Means clustering laboratory below: spawn 2D data points, trigger centroid migrations $\\mu_k = \\frac{1}{\\|C_k\\|} \\sum_{x \\in C_k} x$, inspect Voronoi decision boundaries, and test your classification knowledge against past UCLM exam questions!`,
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
          content: `### Generalization, Overfitting & The Bias-Variance Tradeoff (Slides 19–34)

A machine learning model must perform well on **unseen test data**, not merely memorize its training examples.

#### Mathematical Decomposition of Generalization Error:
For a true data generator $y = f(x) + \\epsilon$ with irreducible observation noise $\\mathbb{E}[\\epsilon] = 0, \\text{Var}(\\epsilon) = \\sigma^2$, the expected mean squared test error of an estimator $\\hat{f}(x)$ decomposes into three distinct components:
$$\\mathbb{E}\\left[(y - \\hat{f}(x))^2\\right] = \\underbrace{\\left(f(x) - \\mathbb{E}[\\hat{f}(x)]\\right)^2}_{\\text{Bias}[\\hat{f}(x)]^2} + \\underbrace{\\mathbb{E}\\left[(\\hat{f}(x) - \\mathbb{E}[\\hat{f}(x)])^2\\right]}_{\\text{Variance}[\\hat{f}(x)]} + \\underbrace{\\sigma^2}_{\\text{Irreducible Noise}}$$

#### The Three Model Regimes:

| Regime | Model Complexity | Bias vs. Variance | Training Error | Test / Validation Error | Typical Remedy |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Underfitting** | Low (e.g., degree $d=1$) | High Bias, Low Variance | **High** | **High** | Increase capacity, add polynomial features |
| **Optimal Generalization** | Balanced (e.g., degree $d=3$) | Minimal Total Error | **Low** | **Low** | Deploy model, maintain regularization |
| **Overfitting** | High (e.g., degree $d=9$) | Low Bias, Surging Variance | **Near 0** | **Surges Heavily** | Add L2 regularization ($\\lambda$), gather more data, prune features |

> 🛡️ **Combating High Variance via L2 Ridge Regularization**:
> When a model overfits, its weights grow excessively large to oscillate through every noise outlier. L2 Regularization adds a penalty proportional to the squared magnitude of coefficients to the loss function:
> $$J(w) = \\frac{1}{N}\\sum_{i=1}^N (y_i - \\hat{y}_i)^2 + \\lambda \\sum_{j=1}^M w_j^2$$
> Increasing the regularization hyperparameter $\\lambda$ shrinks large weights, smoothing the function and pulling the model back from high variance into generalization!

*Explore the polynomial curve fitting playground below: adjust degree d from 1 to 9, dial in Ridge regularization λ, drop custom points, and observe the live train vs test MSE telemetry!*`,
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
          content: `### Data Partitioning: The Golden Rule of Evaluation (Slides 35–54)

Never evaluate a machine learning model on the data it was trained on! If you train and test on the same observations, a table lookup algorithm that memorizes all rows achieves $100\\%$ accuracy while having zero real-world intelligence.

#### The Three-Way Partition:

| Partition | Typical Fraction | Primary Purpose | Allowed Operations | Strict Prohibitions |
| :--- | :---: | :--- | :--- | :--- |
| **Training Set** | $60\\text{--}70\\%$ | Fit internal model parameters (weights $w$, decision tree splits) | Gradient descent, loss minimization | Evaluating final generalization performance |
| **Validation Set** | $15\\text{--}20\\%$ | Model selection & hyperparameter tuning | Select polynomial degree $d$, tune $k$ in $k$-NN, choose $\\lambda$ | Fitting model weights directly |
| **Test Set** | $15\\text{--}20\\%$ | Unbiased final generalization estimate | **Accessed exactly once** at the very end of research | Any form of model retraining or hyperparameter tuning |

> ⚠️ **Data Leakage (The Cardinal Sin)**:
> Data leakage occurs when information from outside the training dataset is used to create or tune the model. Common pitfalls: normalizing or scaling features using the mean and standard deviation of the entire dataset rather than computing them strictly on the training partition!

#### $k$-Fold Cross-Validation (Slide 44):
When sample size $N$ is limited, a single validation split may be noisy. In $k$-fold cross-validation:
1. Divide dataset randomly into $k$ equal-sized folds.
2. For each fold $i \\in \\{1, \\dots, k\\}$:
   - Train the model on the remaining $k-1$ folds.
   - Evaluate performance on fold $i$.
3. Compute the mean cross-validation score across all $k$ iterations:
   $$\\text{CV}_k = \\frac{1}{k}\\sum_{i=1}^k \\text{Score}_i$$
This ensures every single data point is used for validation exactly once without data leakage.`,
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

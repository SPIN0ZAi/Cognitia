import type { LessonData } from '../types/course';

export const LESSON_10_DATA: LessonData = {
  id: 'lesson-10',
  number: 10,
  title: 'Supervised Classification & Performance Evaluation',
  subtitle:
    'k-Nearest Neighbors, decision boundaries, entropy & information gain in decision trees, confusion matrix, and accuracy vs precision-recall metrics',
  semester: '2026/2027',
  institution: 'Escuela Superior de Ingeniería Informática de Albacete, Universidad de Castilla-La Mancha (UCLM)',
  authors: ['M. Julia Flores', 'José A. Gámez', 'Ismael G. Varea'],
  slideCount: 60,
  overview:
    'Focuses on supervised pattern classification where the objective is predicting discrete categorical class labels y in {C1, ..., Ck} for continuous or discrete feature vectors x. Analyzes the k-Nearest Neighbors (k-NN) algorithm as a non-parametric lazy learner, dissecting distance metrics (Euclidean vs. Manhattan), majority voting, decision boundaries, and the impact of k on model bias and variance. Introduces Decision Tree learning governed by Shannon Entropy and Information Gain. Details the rigorous evaluation of classifiers via the Confusion Matrix (TP, FP, FN, TN), deriving Accuracy, Precision, Recall (Sensitivity), Specificity, and the F1-score, and exposing the fundamental Accuracy Paradox in class-imbalanced domains.',
  prerequisites: [
    'Machine Learning foundations and generalization (Lesson 9)',
    'Train/Validation/Test data splitting (Lesson 9)',
    'Euclidean geometry, distance metrics, and discrete probability',
  ],
  learningObjectives: [
    'Implement and trace the k-Nearest Neighbors algorithm using Euclidean and Manhattan distance metrics.',
    'Analyze how the hyperparameter k controls the classification boundary: k=1 overfitting vs large k oversmoothing.',
    'Calculate Shannon Entropy H(S) and Information Gain IG(S, A) to determine optimal attribute splits in Decision Trees.',
    'Construct a 2x2 Confusion Matrix and correctly assign True Positives, False Positives, False Negatives, and True Negatives.',
    'Compute Accuracy, Precision, Recall, Specificity, and F1-score from raw contingency counts.',
    'Explain the Accuracy Paradox in imbalanced datasets and select appropriate metrics for high-stakes domains (medical diagnosis, fraud detection).',
  ],
  chapters: [
    {
      id: 'knn-classifier-and-boundaries',
      number: 1,
      title: 'k-Nearest Neighbors (k-NN) & Distance Classifiers',
      slideRange: 'Slides 1–28',
      description:
        'Lazy learning, distance metrics, majority voting, decision boundary visualization, and the effect of k.',
      sections: [
        {
          id: 'knn-mechanics',
          title: 'The k-NN Algorithm & Lazy Learning',
          slideRef: { lessonId: 'lesson-10', slideNumber: '1–14' },
          summary: 'Instance-based classification via neighborhood proximity.',
          content: `### The k-Nearest Neighbors Algorithm

$k$-NN is a **non-parametric lazy learning** algorithm:
- It requires **no explicit training phase** (it simply stores the training instances in memory).
- All computation occurs at **query time**, when a new unlabeled instance $x_q$ must be classified.

#### Algorithm Steps
1. Compute the distance between query point $x_q$ and every point $x_i$ in training set $\\mathcal{D}$.
   - **Euclidean Distance ($L_2$)**:
     $$d(x_q, x_i) = \\sqrt{\\sum_{j=1}^d (x_{q,j} - x_{i,j})^2}$$
   - **Manhattan Distance ($L_1$)**:
     $$d(x_q, x_i) = \\sum_{j=1}^d |x_{q,j} - x_{i,j}|$$
2. Identify the $k$ training points with the smallest distances to $x_q$: $N_k(x_q)$.
3. Assign $x_q$ to the majority class among its $k$ neighbors:
   $$\\hat{y} = \\arg\\max_{c} \\sum_{x_i \\in N_k(x_q)} \\mathbb{I}[y_i = c]$$

> **Practical Guideline**: For binary classification, choose an **odd value of $k$** (e.g., $k=1, 3, 5, 7$) to prevent 50/50 vote ties.`,
          keyTakeaways: [
            'k-NN stores training examples and performs inference by finding the k closest neighbors.',
            'Euclidean distance is standard, but features must be normalized to prevent dominance by large scales.',
            'Odd values of k prevent voting ties in binary classification.',
          ],
        },
        {
          id: 'knn-hyperparameter-k',
          title: 'The Impact of k on Decision Boundaries (Bias-Variance)',
          slideRef: { lessonId: 'lesson-10', slideNumber: '15–28' },
          summary: 'Why k=1 overfits and large k underfits the decision boundary.',
          content: `### How k Dictates Model Complexity

The choice of hyperparameter $k$ directly controls the bias-variance tradeoff:
- **$k = 1$ (High Variance / Overfitting)**:
  - The decision boundary creates complex, fragmented Voronoi cells that wrap tightly around individual data points.
  - Training accuracy is $100\\%$ (every training point is its own nearest neighbor), but the model is exquisitely sensitive to label noise and outliers.
- **Moderate $k$ (e.g., $k = 5$ or $k = 7$)**:
  - Averages out noisy outliers while preserving legitimate non-linear boundaries.
  - Achieves optimal generalization performance.
- **Very Large $k \\to N$ (High Bias / Underfitting)**:
  - The boundary becomes excessively smoothed, eventually predicting the majority class of the entire dataset regardless of the query point's position.`,
          keyTakeaways: [
            'k=1 creates jagged boundaries with zero training error, but high vulnerability to noise.',
            'Large k produces overly smooth boundaries, approaching majority-class baseline.',
            'Optimal k is selected via cross-validation on the validation split.',
          ],
        },
      ],
    },
    {
      id: 'decision-trees-and-entropy',
      number: 2,
      title: 'Decision Trees & Information Gain',
      slideRange: 'Slides 29–42',
      description:
        'Hierarchical partitioning, Shannon Entropy, and Information Gain attribute selection.',
      sections: [
        {
          id: 'entropy-and-information-gain',
          title: 'Shannon Entropy and Information Gain (ID3)',
          slideRef: { lessonId: 'lesson-10', slideNumber: '29–42' },
          summary: 'Mathematical quantification of data impurity and tree splitting.',
          content: `### Shannon Entropy: Measuring Impurity

For a dataset $S$ containing samples from classes with proportions $p_1, \\dots, p_C$:
$$H(S) = - \\sum_{i=1}^C p_i \\log_2(p_i) \\quad (\\text{with } 0 \\log_2 0 = 0)$$

- **Pure Node ($p_1 = 1, p_2 = 0$)**: $H(S) = 0$ bits (no uncertainty).
- **Maximum Impurity ($p_1 = 0.5, p_2 = 0.5$)**: $H(S) = 1.0$ bit (maximum uncertainty).

---

### Information Gain: Selecting the Best Split
When splitting dataset $S$ on attribute $A$ into subsets $S_v$ for each value $v \\in \\text{Values}(A)$:
$$IG(S, A) = H(S) - \\sum_{v \\in \\text{Values}(A)} \\frac{|S_v|}{|S|} H(S_v)$$

The algorithm greedily selects the attribute that **maximizes Information Gain** at each node until all leaf nodes are pure or stopping criteria are satisfied.`,
          keyTakeaways: [
            'Entropy measures uncertainty: 0 bits for completely pure, 1 bit for evenly split 50/50.',
            'Information Gain measures the reduction in entropy achieved by partitioning on attribute A.',
            'Greedy top-down induction builds the tree by maximizing Information Gain at each node.',
          ],
        },
      ],
    },
    {
      id: 'confusion-matrix-and-metrics',
      number: 3,
      title: 'Performance Evaluation & The Confusion Matrix',
      slideRange: 'Slides 43–60',
      description:
        'The 2x2 confusion matrix, Accuracy, Precision, Recall, Specificity, F1-score, and the Accuracy Paradox.',
      sections: [
        {
          id: 'confusion-matrix-anatomy',
          title: 'The Anatomy of the Confusion Matrix',
          slideRef: { lessonId: 'lesson-10', slideNumber: '43–50' },
          summary: 'True Positives, False Positives, False Negatives, and True Negatives.',
          content: `### The 2×2 Contingency Table

In binary classification (Positive vs. Negative):

| | Actual Positive ($y = 1$) | Actual Negative ($y = 0$) |
| :--- | :---: | :---: |
| **Predicted Positive ($\\hat{y} = 1$)** | **$TP$** (True Positive) | **$FP$** (False Positive / Type I Error) |
| **Predicted Negative ($\\hat{y} = 0$)** | **$FN$** (False Negative / Type II Error) | **$TN$** (True Negative) |

#### Real-World Meaning
- **$TP$**: Sick patient correctly diagnosed with disease.
- **$FP$**: Healthy patient falsely told they have disease ("False Alarm").
- **$FN$**: Sick patient mistakenly diagnosed as healthy ("Deadly Miss").
- **$TN$**: Healthy patient correctly identified as healthy.`,
          keyTakeaways: [
            'TP and TN are correct predictions; FP and FN are classification errors.',
            'Type I error (FP) is a false alarm; Type II error (FN) is a missed detection.',
          ],
        },
        {
          id: 'classification-metrics-formulas',
          title: 'Evaluation Metrics & The Accuracy Paradox',
          slideRef: { lessonId: 'lesson-10', slideNumber: '51–60' },
          summary: 'Accuracy, Precision, Recall, F1-score, and why Accuracy fails on imbalanced data.',
          content: `### Core Metric Formulas

1. **Accuracy**:
   $$\\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN}$$
2. **Precision (Positive Predictive Value)**:
   $$\\text{Precision} = \\frac{TP}{TP + FP}$$
   - *Question answered*: "When the model predicts positive, how often is it actually correct?"
3. **Recall / Sensitivity (True Positive Rate)**:
   $$\\text{Recall} = \\frac{TP}{TP + FN}$$
   - *Question answered*: "Out of all actual positive cases in reality, how many did the model catch?"
4. **Specificity (True Negative Rate)**:
   $$\\text{Specificity} = \\frac{TN}{TN + FP}$$
5. **$F_1$-Score (Harmonic Mean of Precision and Recall)**:
   $$F_1 = 2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}} = \\frac{2 \\cdot TP}{2 \\cdot TP + FP + FN}$$

---

### The Accuracy Paradox in Class Imbalance
Consider a rare disease present in $1\\%$ of patients (990 healthy, 10 sick).
- A **dumb trivial classifier** that predicts "Healthy" for every single person achieves:
  $$\\text{Accuracy} = \\frac{0 + 990}{1000} = 99.0\\%!$$
- Yet its Recall is:
  $$\\text{Recall} = \\frac{0}{0 + 10} = 0\\%!$$
- The model is utterly useless in a clinic. **In imbalanced domains, never rely on Accuracy alone; evaluate Precision, Recall, and $F_1$-score!**`,
          keyTakeaways: [
            'Precision penalizes False Positives (crucial in spam filters, legal sentencing).',
            'Recall penalizes False Negatives (crucial in medical cancer screening, fraud detection).',
            'F1-score is the harmonic mean, punishing severe imbalance between Precision and Recall.',
            'The Accuracy Paradox demonstrates why 99% accuracy can be completely meaningless.',
          ],
        },
      ],
    },
  ],
  proposedExercises: [
    {
      id: 'prop-ex-knn-calc',
      title: 'Manual k-NN Classification with Euclidean Distance',
      slideRef: { lessonId: 'lesson-10', slideNumber: 12 },
      problemStatement:
        'Given 5 training points in 2D space: A(1, 2) [Class Red], B(2, 3) [Class Red], C(5, 5) [Class Blue], D(6, 4) [Class Blue], E(3, 2) [Class Red]. 1) For query point Q(3, 4), calculate Euclidean distance d(Q, x) to each training point. 2) Determine the classification of Q for k=1 and k=3.',
      formalization: {
        stateSpace: '2D coordinates with binary class labels {Red, Blue}.',
        initialState: 'Training instances A, B, C, D, E and query point Q(3, 4).',
        actions: 'Compute d(Q, P) = sqrt((x_q - x_p)^2 + (y_q - y_p)^2).',
        successorFunction: 'Sort distances ascending and take top k.',
        goalTest: 'Identify winning majority class label.',
        pathCost: 'Euclidean distance.',
      },
      solutionExplanation:
        '1) Squared distances from Q(3, 4):\n- d(Q, A)^2 = (3-1)^2 + (4-2)^2 = 4 + 4 = 8 -> d ≈ 2.83\n- d(Q, B)^2 = (3-2)^2 + (4-3)^2 = 1 + 1 = 2 -> d ≈ 1.41\n- d(Q, C)^2 = (3-5)^2 + (4-5)^2 = 4 + 1 = 5 -> d ≈ 2.24\n- d(Q, D)^2 = (3-6)^2 + (4-4)^2 = 9 + 0 = 9 -> d = 3.00\n- d(Q, E)^2 = (3-3)^2 + (4-2)^2 = 0 + 4 = 4 -> d = 2.00\n2) Sorted nearest neighbors: 1st: B (d=1.41, Red), 2nd: E (d=2.00, Red), 3rd: C (d=2.24, Blue), 4th: A (d=2.83, Red), 5th: D (d=3.00, Blue).\n- For k = 1: Closest neighbor is B (Red) -> Predicted Class: RED.\n- For k = 3: 3 closest neighbors are B (Red), E (Red), C (Blue). Vote: 2 Red, 1 Blue -> Majority Predicted Class: RED.',
      hasInteractiveTool: true,
      interactiveToolId: 'knn-classifier-lab',
    },
    {
      id: 'prop-ex-confusion-matrix-metrics',
      title: 'Confusion Matrix Metrics & Imbalance Analysis',
      slideRef: { lessonId: 'lesson-10', slideNumber: 52 },
      problemStatement:
        'A cybersecurity intrusion detection model tested on 200 network connections produces the following counts: TP = 40 (attacks caught), FP = 10 (false alarms), FN = 10 (attacks missed), TN = 140 (normal traffic verified). Calculate: 1) Accuracy, 2) Precision, 3) Recall, 4) F1-Score.',
      formalization: {
        stateSpace: 'Contingency counts TP=40, FP=10, FN=10, TN=140.',
        initialState: 'Total samples = 40 + 10 + 10 + 140 = 200.',
        actions: 'Apply metric formulas.',
        successorFunction: 'Compute intermediate fractions and round to 3 decimals.',
        goalTest: 'Accurate values for Accuracy, Precision, Recall, F1.',
        pathCost: 'Zero calculation error.',
      },
      solutionExplanation:
        '1) Accuracy = (TP + TN) / Total = (40 + 140) / 200 = 180 / 200 = 0.900 (90.0%).\n2) Precision = TP / (TP + FP) = 40 / (40 + 10) = 40 / 50 = 0.800 (80.0%).\n3) Recall = TP / (TP + FN) = 40 / (40 + 10) = 40 / 50 = 0.800 (80.0%).\n4) F1-Score = 2 * (Precision * Recall) / (Precision + Recall) = 2 * (0.800 * 0.800) / (0.800 + 0.800) = 1.28 / 1.6 = 0.800 (80.0%).',
      hasInteractiveTool: true,
      interactiveToolId: 'confusion-matrix-metrics-lab',
    },
  ],
};

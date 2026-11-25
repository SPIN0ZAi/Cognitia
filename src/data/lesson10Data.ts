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
          content: `### The k-Nearest Neighbors Algorithm (Slides 1–14)

$k$-NN is a **non-parametric lazy learning** algorithm:
- It requires **no explicit training phase**; it simply indexes and stores the training instances in memory.
- All computation occurs at **query time**, when an unlabeled instance $x_q$ must be classified.

#### Distance Metrics & Decision Geometries:

| Metric | Mathematical Formula | Unit Circle Contour Shape | Use Case / Sensitivity |
| :--- | :--- | :--- | :--- |
| **Euclidean ($L_2$)** | $d(x_q, x_i) = \\sqrt{\\sum_{j=1}^d (x_{q,j} - x_{i,j})^2}$ | Circular disk ($x^2 + y^2 \\le r^2$) | Continuous physical coordinates; isotropic sensitivity |
| **Manhattan ($L_1$)** | $d(x_q, x_i) = \\sum_{j=1}^d \\|x_{q,j} - x_{i,j}\\|$ | 45° diamond ($|x| + |y| \\le r$) | Grid street networks; high-dimensional sparse data |
| **Chebyshev ($L_\\infty$)** | $d(x_q, x_i) = \\max_j \\|x_{q,j} - x_{i,j}\\|$ | Axis-aligned square ($\\max(|x|, |y|) \\le r$) | Chess king moves; worst-case coordinate tolerance |

> ⚠️ **UCLM Exam Pitfall: Mandatory Feature Normalization**:
> Distance metrics are hypersensitive to scale! Suppose feature 1 is Age (range $20\\text{--}60$, span 40) and feature 2 is Annual Income (range $20,000\\text{--}100,000$, span 80,000). A difference of $100 in salary produces squared distance $10,000$, completely obliterating any 30-year age difference! **Features must always be normalized (Min-Max to $[0, 1]$ or Z-score $\\mu=0, \\sigma=1$) before computing distances.**

#### Voting Rules:
1. **Majority Voting (Standard)**: Each of the $k$ nearest neighbors casts one unweighted vote:
   $$\\hat{y} = \\arg\\max_c \\sum_{x_i \\in N_k(x_q)} \\mathbb{I}[y_i = c]$$
2. **Distance-Weighted Voting (Inverse Distance)**: Closer neighbors exert stronger gravitational pull:
   $$w_i = \\frac{1}{d(x_q, x_i)^2 + \\epsilon}, \\qquad \\hat{y} = \\arg\\max_c \\sum_{x_i \\in N_k(x_q)} w_i \\cdot \\mathbb{I}[y_i = c]$$

*Interact with the 2D coordinate space below: drag the query target, toggle distance metrics (Euclidean, Manhattan, Chebyshev), and observe the live contour lines!*`,
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
          content: `### Shannon Entropy & Information Gain (ID3) (Slides 29–42)

Decision trees recursively partition the input space by choosing attributes that create the purest child subsets.

#### 1. Shannon Entropy: Quantifying Impurity
For a dataset $S$ containing samples with class proportions $p_1, \\dots, p_C$:
$$H(S) = - \\sum_{i=1}^C p_i \\log_2(p_i) \\quad (\\text{with } 0 \\log_2 0 = 0)$$

- **Completely Pure Node ($p_1 = 1.0, p_2 = 0.0$)**: $H(S) = 0$ bits (zero uncertainty).
- **Evenly Split 50/50 Node ($p_1 = 0.5, p_2 = 0.5$)**: $H(S) = - (0.5 \\log_2 0.5 + 0.5 \\log_2 0.5) = 1.0$ bit (maximum uncertainty).

#### Worked Numerical Calculation (Slide 34):
Consider a training node with 14 instances: 9 Positive ($+$) and 5 Negative ($-$).
$$p_+ = \\frac{9}{14} \\approx 0.643, \\qquad p_- = \\frac{5}{14} \\approx 0.357$$
$$H(S) = - \\left(0.643 \\log_2(0.643) + 0.357 \\log_2(0.357)\\right) = - (-0.409 - 0.531) = 0.940 \\text{ bits}$$

---

#### 2. Information Gain: Selecting the Best Attribute
When partitioning dataset $S$ along attribute $A$ having discrete values $v \\in \\text{Values}(A)$:
$$IG(S, A) = H(S) - \\sum_{v \\in \\text{Values}(A)} \\frac{|S_v|}{|S|} H(S_v)$$

The ID3 algorithm greedily selects the attribute $A^* = \\arg\\max_A IG(S, A)$ that maximizes Information Gain (the largest reduction in entropy).`,
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
          content: `### Evaluation Metrics & The Accuracy Paradox (Slides 51–60)

Evaluating classification algorithms requires matching the metric to the real-world cost asymmetry between Type I ($FP$) and Type II ($FN$) errors.

#### Comprehensive Metric Reference Table:

| Metric | Mathematical Formula | Question Answered | High-Stakes Domain Where Critical |
| :--- | :--- | :--- | :--- |
| **Accuracy** | $\\frac{TP + TN}{TP + TN + FP + FN}$ | What overall fraction of cases did we classify correctly? | Symmetric, balanced classes; baseline sanity check |
| **Precision** | $\\frac{TP}{TP + FP}$ | When the model triggers an alarm, how often is it actually true? | Spam filters, charging a suspect, automated financial trading |
| **Recall / Sensitivity** | $\\frac{TP}{TP + FN}$ | Out of all actual positive cases in reality, how many did we catch? | Medical cancer screening, virus testing, airport weapon detection |
| **Specificity** | $\\frac{TN}{TN + FP}$ | Out of all healthy/normal individuals, how many were correctly cleared? | Minimizing unnecessary traumatic biopsies, drug trials |
| **$F_1$-Score** | $2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$ | What is the harmonic balance between Precision and Recall? | Class-imbalanced machine learning benchmarks |

---

### The Accuracy Paradox in Class Imbalance (Slide 55)
Consider a rare disease present in $1\\%$ of the population ($N=1,000$: 990 healthy, 10 sick):

| Classifier Strategy | Predicted Sick | Predicted Healthy | Accuracy | Recall | Utility in Clinic |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Trivial "Predict All Healthy"** | 0 | 1,000 | **$99.0\\%$** | **$0.0\\%$** | **Utterly useless**; all 10 sick patients die |
| **Trained Clinical Model** | 25 | 975 | **$98.5\\%$** | **$90.0\\%$** | **High value**; catches 9 of 10 sick patients |

> ⚠️ **The Paradox**: The completely useless dummy model has **higher accuracy** ($99.0\\%$ vs $98.5\\%$) than the clinical model! **In class-imbalanced problems, Accuracy is deceptive. You must evaluate Precision, Recall, and the $F_1$-score.**

*Explore this live in the interactive laboratory below: slide the classification threshold $\\theta$, inspect the live $2\\times 2$ confusion matrix, view the ROC operating point, and toggle the rare disease simulator!*`,
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

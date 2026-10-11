export interface SlideReference {
  lessonId: string;
  slideNumber: number | string;
  note?: string;
}

export interface SectionContent {
  id: string;
  title: string;
  slideRef?: SlideReference;
  summary: string;
  content: string; // Markdown / HTML formatted explanation
  supplementaryNote?: string;
  keyTakeaways?: string[];
  formulas?: {
    name: string;
    latex: string;
    explanation: string;
  }[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  slideRange: string;
  description: string;
  sections: SectionContent[];
}

export interface LessonData {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  semester: string;
  institution: string;
  authors: string[];
  slideCount: number;
  overview: string;
  prerequisites: string[];
  learningObjectives: string[];
  chapters: Chapter[];
  proposedExercises: {
    id: string;
    title: string;
    slideRef: SlideReference;
    problemStatement: string;
    formalization: {
      stateSpace?: string;
      initialState?: string;
      actions?: string;
      successorFunction?: string;
      goalTest?: string;
      pathCost?: string;
    };
    solutionExplanation: string;
    hasInteractiveTool?: boolean;
    interactiveToolId?: string;
  }[];
}

export interface GlossaryItem {
  id: string;
  term: string;
  termEs?: string;
  category: 'Foundation' | 'Uninformed Search' | 'Informed Search' | 'Ethics & Governance';
  definition: string;
  formalNotation?: string;
  example: string;
  commonConfusion?: string;
  relatedLessonId: string;
  relatedSectionId: string;
  slideRef: SlideReference;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  chapterId: string;
  type: 'multiple-choice' | 'calculation' | 'conceptual-match';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Exam-Level';
  slideRef: SlideReference;
}

export interface BookmarkItem {
  id: string;
  lessonId: string;
  sectionId: string;
  title: string;
  timestamp: number;
  previewText: string;
}

export interface StudyProgress {
  completedSections: Record<string, boolean>; // key: `${lessonId}:${sectionId}`
  quizScores: Record<string, { answered: boolean; correct: boolean; selected: any }>;
  lastVisited: {
    lessonId: string;
    sectionId: string;
    scrollPosition?: number;
    timestamp: number;
  } | null;
  bookmarks: BookmarkItem[];
}

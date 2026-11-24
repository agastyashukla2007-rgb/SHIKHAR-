export type LanguageMode = 'bilingual' | 'en' | 'hi';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';

export type ExamCategory =
  | 'SSC'
  | 'Railway'
  | 'Banking'
  | 'Defence'
  | 'Police'
  | 'Teaching'
  | 'State PCS'
  | 'All';

export type QuestionSourceType =
  | 'VERIFIED_PYQ'
  | 'AI_GENERATED'
  | 'PDF_EXTRACTED'
  | 'IMAGE_EXTRACTED'
  | 'CURRENT_AFFAIRS'
  | 'HINDU_VOCAB';

export interface WrongOptionFact {
  optionIndex: number;
  optionTextEn: string;
  optionTextHi: string;
  whyIncorrectEn: string;
  whyIncorrectHi: string;
  addonFactEn: string;
  addonFactHi: string;
}

export interface VocabMeta {
  word: string;
  partOfSpeech: string;
  hindiMeaning: string;
  synonyms: string[];
  antonyms: string[];
  idiomOrSubstitution?: string;
  exampleSentence: string;
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  optionsEn: [string, string, string, string];
  optionsHi: [string, string, string, string];
  correctIndex: number;
  correctExplanationEn: string;
  correctExplanationHi: string;
  wrongOptionsAnalysis: WrongOptionFact[];
  memoryTrickEn: string;
  memoryTrickHi: string;
  keyFactsEn: string[];
  keyFactsHi: string[];
  sourceRef: string;
  examRelevance: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sourceType: QuestionSourceType;
  pyqYear?: number;
  pyqShift?: string;
  frequencyScore?: number;
  proofreadPasses: number;
  proofreadSummary?: string;
  explanationImageUrl?: string;
  explanationImageCaption?: string;
  visualDiagram?: {
    layout: 'timeline' | 'flowchart' | 'comparison' | 'formula_steps';
    titleEn: string;
    titleHi: string;
    nodes: Array<{
      label: string;
      detail: string;
      highlight?: boolean;
    }>;
  };
  flagged?: boolean;
  flagReason?: string;
  vocabMeta?: VocabMeta;
}

export interface ProofreadReport {
  pass1Drafted: number;
  pass2AuditIssuesFixed: number;
  pass3PolishCompleted: boolean;
  auditNotes: string[];
  verifiedAt: string;
}

export interface GeneratedQuizPack {
  id: string;
  title: string;
  subtitle: string;
  exam: ExamCategory;
  subject: string;
  difficulty: DifficultyLevel;
  sourceType: QuestionSourceType;
  extractedSummaryEn?: string;
  extractedSummaryHi?: string;
  extractedSummaryHinglish?: string;
  questions: QuizQuestion[];
  proofreadReport: ProofreadReport;
  createdAt: string;
}

export interface LessonScene {
  id: string;
  titleEn: string;
  titleHi: string;
  narrationEn: string;
  narrationHi: string;
  subtitleEn: string;
  subtitleHi: string;
  visualNodes: Array<{
    label: string;
    detail: string;
    highlight?: boolean;
  }>;
  formulaOrRule?: string;
  trickEn: string;
  trickHi: string;
}

export interface AnimatedLesson {
  id: string;
  topic: string;
  subject: string;
  visualMode: 'timeline' | 'flowchart' | 'map' | 'diagram' | 'math_steps';
  durationLabel: string;
  whatsappSummary?: string;
  scenes: LessonScene[];
}

export type CurrentAffairsPeriod = 'daily' | 'weekly' | 'six_months' | 'yearly';

export interface MindMapData {
  id: string;
  topic: string;
  subject: string;
  period?: CurrentAffairsPeriod;
  periodLabel?: string;
  whatsappSummary?: string;
  centralNode: {
    titleEn: string;
    titleHi: string;
  };
  branches: Array<{
    titleEn: string;
    titleHi: string;
    pointsEn: string[];
    pointsHi: string[];
  }>;
  onePageNotesEn: string[];
  onePageNotesHi: string[];
  importantDatesOrFormulas: Array<{
    label: string;
    value: string;
  }>;
  shortTricksEn: string[];
  shortTricksHi: string[];
  flashcards: Array<{
    frontEn: string;
    frontHi: string;
    backEn: string;
    backHi: string;
  }>;
}

export interface MockTestDefinition {
  id: string;
  title: string;
  exam: ExamCategory;
  durationMinutes: number;
  positiveMarks: number;
  negativeMarks: number;
  sections: string[];
  questions: QuizQuestion[];
}

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  title: string;
  subject: string;
  exam: ExamCategory;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracyPercent: number;
  avgTimePerQuestionSec: number;
  completedAt: string;
  weakTopics: string[];
  synced: boolean;
}

export interface RevisionPlan {
  examTarget: string;
  daysRemaining: number;
  focusMessageEn: string;
  focusMessageHi: string;
  weeklyTimetable: Array<{
    day: string;
    morningBlock: string;
    afternoonBlock: string;
    eveningRevision: string;
    targetQuestions: number;
  }>;
  spacedRepetitionQueue: Array<{
    topic: string;
    intervalLabel: string;
    reason: string;
  }>;
  last30DaysChecklist: string[];
}

export interface ExamTrendItem {
  exam: ExamCategory;
  subject: string;
  topic: string;
  last5YrFrequency: number;
  last10YrFrequency: number;
  avgQuestionsPerShift: number;
  difficultyTrend: 'Easy' | 'Moderate' | 'Tough';
  priority: 'High Yield' | 'Core' | 'Emerging';
}

export interface AdminConfig {
  earlyAccessFreeMode: boolean;
  strictThreePassProofreading: boolean;
  whatsappMorningTime: string;
  whatsappAutoDispatchEnabled: boolean;
  whatsappRecipientCount: number;
  lastWhatsappDispatchAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  city: string;
  targetExam: ExamCategory;
  xp: number;
  accuracy: number;
  streakDays: number;
  isCurrentUser?: boolean;
  isFriend?: boolean;
}

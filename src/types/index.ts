// ============================================
// 通用型別定義
// ============================================

export type MessagePart = {
  text?: string;
  image?: string;
};

export type Message = {
  role: "user" | "assistant";
  parts: MessagePart[];
  timestamp?: string;
};

export type ChatHistory = {
  id: string;
  title: string;
  messages: Message[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
};

export type User = {
  id: string;
  email?: string;
  [key: string]: unknown;
};

// ============================================
// 考試相關型別
// ============================================

export type ExamQuestion = {
  id: string | number;
  year: string | number;
  grade: string;
  unit: string;
  keywords?: string[];
  question: string;
  image?: string;
  options: Record<string, string>;
  answer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type QuestionAnswer = {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  feedback?: string;
  explanation?: string;
  timestamp: Date;
};

// ============================================
// 閃卡相關型別
// ============================================

export type FlashCardData = {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
};

// ============================================
// 課綱相關型別
// ============================================

export type CurriculumUnit = {
  keywords: string[];
  topics: string[];
};

export type CurriculumGrade = {
  [unit: string]: CurriculumUnit;
};

export type Curriculum = {
  [grade: string]: CurriculumGrade;
};

// ============================================
// 分析相關型別
// ============================================

export type AnalysisResult = {
  concepts_used: string[];
  unstable_concepts: string[];
  thinking_style: string;
  expression: string;
  ai_feedback: string[];
  conversation_id?: string;
  user_id?: string;
  analyzed_at?: string;
};

// ============================================
// API 回應型別
// ============================================

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type GeminiResponse = {
  result: string;
  error?: string;
};

// ============================================
// UI 狀態型別
// ============================================

export type LoadingState = {
  isLoading: boolean;
  message?: string;
};

export type ErrorState = {
  hasError: boolean;
  message?: string;
  code?: string;
};

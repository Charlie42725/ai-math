import simulatedQuestionsData from './batch_01_questions.json';
import historicalQuestionsData from '../lib/exam.json';

export interface QuestionData {
  id: string;
  year: number;
  grade: string;
  unit: string;
  keywords: string[];
  question: string;
  image: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation: string;
}

export type QuestionSource = 'historical' | 'simulated' | 'all';

export interface FormattedQuestion {
  id: number;
  title: string;
  content: string;
  type: 'multiple' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
  originalId?: string;
  grade?: string;
  unit?: string;
  keywords?: string[];
  explanation?: string;
  image?: string;
}

/**
 * 根據來源獲取題庫資料
 */
function getQuestionDataBySource(source: QuestionSource): QuestionData[] {
  switch (source) {
    case 'historical':
      return historicalQuestionsData as QuestionData[];
    case 'simulated':
      return simulatedQuestionsData as QuestionData[];
    case 'all':
      return [...historicalQuestionsData, ...simulatedQuestionsData] as QuestionData[];
    default:
      return historicalQuestionsData as QuestionData[];
  }
}

/**
 * 將題庫格式轉換為組件期望的格式
 */
function formatQuestion(questionData: QuestionData, index: number): FormattedQuestion {
  return {
    id: index + 1,
    title: questionData.unit,
    content: questionData.question,
    type: 'multiple' as const,
    options: [
      questionData.options.A,
      questionData.options.B,
      questionData.options.C,
      questionData.options.D
    ],
    correctAnswer: questionData.answer,
    points: 4, // 預設每題4分
    originalId: questionData.id,
    grade: questionData.grade,
    unit: questionData.unit,
    keywords: questionData.keywords,
    explanation: questionData.explanation,
    image: questionData.image
  };
}

/**
 * 從題庫中隨機選擇指定數量的題目
 */
export function getRandomQuestions(count: number, source: QuestionSource = 'historical'): FormattedQuestion[] {
  const questionsData = getQuestionDataBySource(source);
  const shuffled = [...questionsData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, questionsData.length));

  return selected.map((question, index) => formatQuestion(question, index));
}

/**
 * 根據年級篩選題目
 */
export function getQuestionsByGrade(grade: string, count?: number, source: QuestionSource = 'historical'): FormattedQuestion[] {
  const questionsData = getQuestionDataBySource(source);
  const filtered = questionsData.filter(q => q.grade === grade);

  if (count) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, filtered.length));
    return selected.map((question, index) => formatQuestion(question, index));
  }

  return filtered.map((question, index) => formatQuestion(question, index));
}

/**
 * 根據單元篩選題目
 */
export function getQuestionsByUnit(unit: string, count?: number, source: QuestionSource = 'historical'): FormattedQuestion[] {
  const questionsData = getQuestionDataBySource(source);
  const filtered = questionsData.filter(q => q.unit === unit);

  if (count) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, filtered.length));
    return selected.map((question, index) => formatQuestion(question, index));
  }

  return filtered.map((question, index) => formatQuestion(question, index));
}

/**
 * 根據關鍵字篩選題目
 */
export function getQuestionsByKeywords(keywords: string[], count?: number, source: QuestionSource = 'historical'): FormattedQuestion[] {
  const questionsData = getQuestionDataBySource(source);
  const filtered = questionsData.filter(q =>
    keywords.some(keyword =>
      q.keywords.some(qKeyword =>
        qKeyword.includes(keyword) || keyword.includes(qKeyword)
      )
    )
  );

  if (count) {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, filtered.length));
    return selected.map((question, index) => formatQuestion(question, index));
  }

  return filtered.map((question, index) => formatQuestion(question, index));
}

/**
 * 獲取所有可用的年級
 */
export function getAvailableGrades(source: QuestionSource = 'historical'): string[] {
  const questionsData = getQuestionDataBySource(source);
  const grades = [...new Set(questionsData.map(q => q.grade))];
  return grades.sort();
}

/**
 * 獲取所有可用的單元
 */
export function getAvailableUnits(source: QuestionSource = 'historical'): string[] {
  const questionsData = getQuestionDataBySource(source);
  const units = [...new Set(questionsData.map(q => q.unit))];
  return units.sort();
}

/**
 * 獲取題庫總數
 */
export function getTotalQuestionCount(source: QuestionSource = 'historical'): number {
  const questionsData = getQuestionDataBySource(source);
  return questionsData.length;
}

/**
 * 混合出題：從不同年級和單元中各選一些題目
 */
export function getMixedQuestions(count: number, source: QuestionSource = 'historical'): FormattedQuestion[] {
  const questionsData = getQuestionDataBySource(source);
  const grades = getAvailableGrades(source);
  const questionsPerGrade = Math.ceil(count / grades.length);

  let allSelected: QuestionData[] = [];

  for (const grade of grades) {
    const gradeQuestions = questionsData.filter(q => q.grade === grade);
    const shuffled = [...gradeQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionsPerGrade, gradeQuestions.length));
    allSelected = [...allSelected, ...selected];
  }

  // 如果還需要更多題目，從剩餘題目中隨機選擇
  if (allSelected.length < count) {
    const remaining = questionsData.filter(q => !allSelected.includes(q));
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const additional = shuffled.slice(0, count - allSelected.length);
    allSelected = [...allSelected, ...additional];
  }

  // 最終隨機排序並限制數量
  const finalShuffled = [...allSelected].sort(() => Math.random() - 0.5);
  const finalSelected = finalShuffled.slice(0, count);

  return finalSelected.map((question, index) => formatQuestion(question, index));
}

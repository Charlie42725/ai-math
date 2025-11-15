import questionsData from '@/test/batch_01_questions.json';
import {
  withErrorHandler,
  createSuccessResponse,
  APIError,
  ErrorCodes,
  validateRequiredParams,
} from '@/lib/api/apiErrorHandler';
import { askGeminiJSON } from '@/lib/api/geminiClient';
import { PromptTemplates } from '@/lib/prompts';

interface QuestionData {
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

interface AnalysisResult {
  feedback: string;
  explanation: string;
  detailedAnalysis: string;
  thinkingProcess: string;
  thinkingScore: number;
  optimization: string;
  suggestions: string[];
  stepByStepSolution: Array<{
    step: number;
    title: string;
    content: string;
  }>;
  keyPoints: string[];
}

interface AnalyzeAnswerResponse extends AnalysisResult {
  success: true;
  isCorrect: boolean;
}

/**
 * 查找題目
 */
function findQuestion(questionId: string | number): QuestionData | undefined {
  if (typeof questionId === 'number') {
    // questionId 是 FormattedQuestion 的 id（index + 1），所以要減 1 來獲取正確的 index
    const targetIndex = questionId - 1;
    return questionsData[targetIndex];
  } else {
    // 如果 questionId 是字串，直接比較 id
    return questionsData.find((q: QuestionData) => q.id === questionId);
  }
}

/**
 * 創建答案分析的預設值
 */
function createFallbackResult(
  question: QuestionData,
  userAnswer: string,
  userProcess: string
): AnalysisResult {
  const isCorrect = userAnswer === question.answer;

  return {
    feedback: isCorrect ? '答案正確！' : '答案錯誤',
    explanation: `正確答案是 ${question.answer}`,
    detailedAnalysis: question.explanation,
    thinkingProcess: '',
    thinkingScore: userProcess ? 2 : 1,
    optimization: '建議檢查解題步驟是否正確',
    suggestions: ['多練習類似題型', '仔細閱讀題目'],
    stepByStepSolution: [],
    keyPoints: [],
  };
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    // 解析請求參數
    const params = await request.json();
    validateRequiredParams(params, ['questionId', 'userAnswer']);

    const { questionId, userAnswer, userProcess = '' } = params;

    // 查找題目
    const question = findQuestion(questionId);
    if (!question) {
      throw new APIError(404, '題目不存在', ErrorCodes.NOT_FOUND);
    }

    // 創建預設回應（作為 AI 分析失敗時的 fallback）
    const fallbackResult = createFallbackResult(question, userAnswer, userProcess);

    try {
      // 使用統一的 Prompt 模板
      const prompt = PromptTemplates.analyzeAnswer({
        question: question.question,
        options: question.options,
        correctAnswer: question.answer,
        explanation: question.explanation,
        userAnswer,
        userProcess,
      });

      // 使用統一的 Gemini Client 調用 AI 分析
      const aiResult = await askGeminiJSON<AnalysisResult>(
        prompt,
        fallbackResult,
        { temperature: 0.7 }
      );

      // 基本正確性檢查
      const isCorrect = userAnswer === question.answer;

      // 返回詳細的分析結果
      const response: AnalyzeAnswerResponse = {
        success: true,
        isCorrect,
        feedback: isCorrect ? '答案正確！' : '答案錯誤',
        explanation: aiResult.explanation || `正確答案是 ${question.answer}`,
        detailedAnalysis: aiResult.detailedAnalysis || question.explanation,
        thinkingProcess: aiResult.thinkingProcess || '',
        thinkingScore: aiResult.thinkingScore || (userProcess ? 3 : 1),
        optimization: aiResult.optimization || '建議多練習類似題型',
        suggestions: aiResult.suggestions || [],
        stepByStepSolution: aiResult.stepByStepSolution || [],
        keyPoints: aiResult.keyPoints || [],
      };

      return createSuccessResponse(response);
    } catch (aiError) {
      // AI 分析失敗時使用後備方案
      console.error('[Analyze Answer] AI analysis failed:', aiError);

      const isCorrect = userAnswer === question.answer;

      const response: AnalyzeAnswerResponse = {
        success: true,
        isCorrect,
        ...fallbackResult,
      };

      return createSuccessResponse(response);
    }
  });
}

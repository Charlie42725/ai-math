import questionsData from '@/test/batch_01_questions.json';
import {
  withErrorHandler,
  createSuccessResponse,
  APIError,
  ErrorCodes,
  validateRequiredParams,
} from '@/lib/api/apiErrorHandler';
import { PromptTemplates } from '@/lib/prompts';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * 提取選項字母（支援 "C: 2/5" 或 "C" 格式）
 */
function extractOption(answer: string): string {
  const trimmed = answer.trim().toUpperCase();
  const match = trimmed.match(/^([A-D])/);
  return match ? match[1] : trimmed;
}

/**
 * 創建答案分析的預設值
 */
function createFallbackResult(
  question: QuestionData,
  userAnswer: string,
  userProcess: string
): AnalysisResult {
  const isCorrect = extractOption(userAnswer) === extractOption(question.answer);

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

    const { questionId, originalId, userAnswer, userProcess = '' } = params;

    // 詳細日誌
    console.log('[Analyze Answer] ===== 開始分析 =====');
    console.log('[Analyze Answer] 收到 questionId:', questionId, '(類型:', typeof questionId, ')');
    console.log('[Analyze Answer] 收到 originalId:', originalId);
    console.log('[Analyze Answer] 用戶答案:', userAnswer);
    console.log('[Analyze Answer] 解題過程:', userProcess ? userProcess.substring(0, 100) + '...' : '無');

    // 優先使用 originalId 查找題目（更準確），否則使用 questionId
    const searchId = originalId || questionId;
    console.log('[Analyze Answer] 使用搜尋ID:', searchId);

    const question = findQuestion(searchId);

    console.log('[Analyze Answer] 查找到的題目:', question ? {
      id: question.id,
      question: question.question.substring(0, 50) + '...'
    } : '未找到');

    if (!question) {
      console.error('[Analyze Answer] ❌ 題目不存在！questionId:', questionId);
      throw new APIError(404, '題目不存在', ErrorCodes.NOT_FOUND);
    }

    console.log('[Analyze Answer] ✓ 題目ID:', question.id);
    console.log('[Analyze Answer] ✓ 題目內容:', question.question);

    // 創建預設回應（作為 AI 分析失敗時的 fallback）
    const fallbackResult = createFallbackResult(question, userAnswer, userProcess);

    try {
      // 使用優化的 Prompt 模板
      const prompt = PromptTemplates.analyzeAnswerFast({
        question: question.question,
        options: question.options,
        correctAnswer: question.answer,
        explanation: question.explanation,
        userAnswer,
        userProcess,
      });

      console.log('[Analyze Answer] 使用 OpenAI 分析...');

      // 使用 OpenAI API 進行答案分析
      const openaiResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '你是專業數學教師。請準確分析學生答案，所有欄位都必須有內容，特別是stepByStepSolution和keyPoints不可為空。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      });

      const rawResponse = openaiResponse.choices[0]?.message?.content;

      if (!rawResponse) {
        throw new Error('OpenAI API 未返回回應');
      }

      // 解析 JSON 回應
      let aiResult: AnalysisResult;
      try {
        const parsed = JSON.parse(rawResponse);
        aiResult = {
          feedback: parsed.feedback || fallbackResult.feedback,
          explanation: parsed.explanation || fallbackResult.explanation,
          detailedAnalysis: parsed.detailedAnalysis || fallbackResult.detailedAnalysis,
          thinkingProcess: parsed.thinkingProcess || fallbackResult.thinkingProcess,
          thinkingScore: parsed.thinkingScore || fallbackResult.thinkingScore,
          optimization: parsed.optimization || fallbackResult.optimization,
          suggestions: parsed.suggestions || fallbackResult.suggestions,
          stepByStepSolution: parsed.stepByStepSolution || [],
          keyPoints: parsed.keyPoints || [],
        };
      } catch (parseError) {
        console.error('[Analyze Answer] JSON 解析失敗:', parseError);
        aiResult = fallbackResult;
      }

      // 調試：打印 AI 返回的結果
      console.log('[Analyze Answer] AI Result:', JSON.stringify(aiResult, null, 2));
      console.log('[Analyze Answer] Token usage:', openaiResponse.usage);

      // 基本正確性檢查 - 使用統一的匹配邏輯
      const userOption = extractOption(userAnswer);
      const correctOption = extractOption(question.answer);
      const isCorrect = userOption === correctOption;

      console.log('[Analyze Answer] 用戶答案:', userAnswer, '-> 選項:', userOption);
      console.log('[Analyze Answer] 正確答案:', question.answer, '-> 選項:', correctOption);
      console.log('[Analyze Answer] 是否正確:', isCorrect);

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

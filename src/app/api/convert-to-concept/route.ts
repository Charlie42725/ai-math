import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  createSuccessResponse,
  APIError,
  ErrorCodes,
  validateRequiredParams,
} from '@/lib/api/apiErrorHandler';
import { askGeminiJSON } from '@/lib/api/geminiClient';

interface ConceptQuestion {
  question: string;
  answer: string;
}

interface ConceptResult {
  conceptQuestion: string;
  conceptAnswer: string;
}

/**
 * 備用觀念問題庫
 */
const CONCEPT_QUESTIONS: ConceptQuestion[] = [
  // 基本運算
  { question: '負數加減規則？', answer: '同號相加，異號相減' },
  { question: '分數運算法則？', answer: '通分後再加減運算' },
  { question: '四則運算順序？', answer: '先乘除後加減，括號優先' },

  // 幾何圖形
  { question: '展開圖概念？', answer: '立體圖形的平面展示' },
  { question: '平行線性質？', answer: '永不相交的兩直線' },
  { question: '垂直線特徵？', answer: '兩線相交成90度角' },

  // 坐標與方程式
  { question: '坐標系統？', answer: '用數字表示位置的方法' },
  { question: '方程式作用？', answer: '找出未知數的工具' },
  { question: '聯立方程式？', answer: '多個方程式同時求解' },

  // 統計與機率
  { question: '百分比意義？', answer: '以100為基準的比例' },
  { question: '平均數概念？', answer: '所有數據的總和除以個數' },
  { question: '機率定義？', answer: '事件發生的可能性' },
];

/**
 * 創建備用回應 - 根據單元和關鍵字選擇合適的觀念問題
 */
function createFallbackResponse(
  unit?: string,
  keywords?: string[]
): ConceptResult {
  console.log('使用備用方案，單元:', unit, '關鍵字:', keywords);

  // 根據單元選擇
  if (unit) {
    if (unit.includes('算式') || unit.includes('運算')) {
      const selected = CONCEPT_QUESTIONS[Math.floor(Math.random() * 3)];
      return {
        conceptQuestion: selected.question,
        conceptAnswer: selected.answer,
      };
    }
    if (unit.includes('圖形') || unit.includes('展開')) {
      const selected = CONCEPT_QUESTIONS[3 + Math.floor(Math.random() * 3)];
      return {
        conceptQuestion: selected.question,
        conceptAnswer: selected.answer,
      };
    }
    if (unit.includes('坐標') || unit.includes('方程式')) {
      const selected = CONCEPT_QUESTIONS[6 + Math.floor(Math.random() * 3)];
      return {
        conceptQuestion: selected.question,
        conceptAnswer: selected.answer,
      };
    }
  }

  // 根據關鍵字選擇
  if (keywords && keywords.length > 0) {
    const keyword = keywords[0];
    if (keyword.includes('負數') || keyword.includes('分數')) {
      return {
        conceptQuestion: CONCEPT_QUESTIONS[0].question,
        conceptAnswer: CONCEPT_QUESTIONS[0].answer,
      };
    }
    if (keyword.includes('坐標') || keyword.includes('平面')) {
      return {
        conceptQuestion: CONCEPT_QUESTIONS[6].question,
        conceptAnswer: CONCEPT_QUESTIONS[6].answer,
      };
    }
    if (keyword.includes('圖形') || keyword.includes('展開')) {
      return {
        conceptQuestion: CONCEPT_QUESTIONS[3].question,
        conceptAnswer: CONCEPT_QUESTIONS[3].answer,
      };
    }
  }

  // 隨機選擇
  const selected =
    CONCEPT_QUESTIONS[Math.floor(Math.random() * CONCEPT_QUESTIONS.length)];
  return {
    conceptQuestion: selected.question,
    conceptAnswer: selected.answer,
  };
}

/**
 * 清理題目中的圖片引用
 */
function cleanQuestionText(question: string): string {
  return question
    .replace(/如?(右|左|下)?[圖表]\s*[\(（][一二三四五六七八九十\d]+[\)）]/g, '')
    .replace(/如?(右|左|下)?[圖表]/g, '')
    .replace(/[\(（][一二三四五六七八九十\d]+[\)）]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 創建概念轉換提示詞
 */
function createConceptPrompt(
  cleanedQuestion: string,
  answer: string,
  unit?: string
): string {
  return `
你是數學老師，要從會考題目中提取**核心數學觀念**，製作簡潔的**純觀念卡片**。

【嚴格禁止】
❌ 禁止包含任何計算過程（例如：(-3) × (-3) × (-3) = -27）
❌ 禁止包含具體數字運算
❌ 禁止包含「所以答案為...」
❌ 禁止包含選項字母 (A/B/C/D)
❌ 禁止包含題目中的具體情境

【必須做到】
✅ 只說明數學規則或定義
✅ 使用通用的數學術語
✅ 簡短扼要（不超過 30 字）
✅ 適合任何相關題目，不只是這一題

會考題目：${cleanedQuestion}
標準答案：${answer}
${unit ? `數學單元：${unit}` : ''}

任務：找出這題在考什麼數學觀念，用最簡單的方式問與答。

正確範例：
會考題："(-3)³ 之值為何？"
❌ 錯誤："(-3)³ = (-3) × (-3) × (-3) = -27，所以答案為 A"（包含計算過程）
✅ 正確："負數的奇數次方？" → "負數的奇數次方結果為負數"

會考題："3/7 − (−1/4) 之值為何？"
❌ 錯誤："3/7 − (−1/4) = 3/7 + 1/4 = 19/28"（包含計算）
✅ 正確："負數減法的運算規則？" → "減去負數等於加上正數"

會考題："坐標平面上有A(2,3)、B(-1,4)、C(-2,-3)、D(1,-2)四點，判斷哪一點在第三象限？"
❌ 錯誤："C(-2,-3) 在第三象限，因為 x 和 y 都是負數"（包含具體答案）
✅ 正確："第三象限的特徵？" → "x 和 y 坐標都是負數"

【記住】
你的回答要像數學課本的「定義框」，不是「例題解答」。

回傳純 JSON：
{
  "conceptQuestion": "觀念問題（8-15字）",
  "conceptAnswer": "觀念說明（15-30字，純概念，無計算）"
}
`.trim();
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    // 驗證參數
    const params = await req.json();
    validateRequiredParams(params, ['question']);

    const { question, answer, unit, keywords } = params;

    // 檢查 API Key
    if (!process.env.GEMINI_API_KEY) {
      throw new APIError(
        500,
        '缺少 GEMINI_API_KEY 環境變數',
        ErrorCodes.INTERNAL_ERROR
      );
    }

    // 清理題目文字
    const cleanedQuestion = cleanQuestionText(question);

    // 創建提示詞
    const prompt = createConceptPrompt(cleanedQuestion, answer || '', unit);

    // 創建備用方案
    const fallback = createFallbackResponse(unit, keywords);

    try {
      // 使用統一的 Gemini Client 調用 AI
      const result = await askGeminiJSON<ConceptResult>(prompt, fallback, {
        temperature: 0.4,
      });

      // 驗證結果
      if (!result.conceptQuestion || !result.conceptAnswer) {
        console.warn('AI 回應缺少必要欄位，使用備用方案');
        return createSuccessResponse(fallback);
      }

      return createSuccessResponse(result);
    } catch (error) {
      // AI 調用失敗，使用備用方案
      console.error('概念轉換 AI 調用失敗:', error);
      return createSuccessResponse(fallback);
    }
  });
}

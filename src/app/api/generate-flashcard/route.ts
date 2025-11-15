import { NextRequest } from 'next/server';
import {
  withErrorHandler,
  createSuccessResponse,
  APIError,
  ErrorCodes,
  validateRequiredParams,
} from '@/lib/api/apiErrorHandler';
import { askGeminiJSON } from '@/lib/api/geminiClient';

interface FlashCard {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

interface FlashCardWithMetadata extends FlashCard {
  id: string;
  reviewCount: number;
  correctCount: number;
}

interface GenerateFlashCardResult {
  cards: FlashCard[];
}

interface GenerateFlashCardResponse {
  success: true;
  cards: FlashCardWithMetadata[];
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * 難度等級對應表
 */
const DIFFICULTY_MAP: Record<DifficultyLevel, string> = {
  easy: '簡單（適合初學者）',
  medium: '中等（適合一般程度）',
  hard: '困難（適合進階學習）',
};

/**
 * 創建閃卡生成提示詞
 */
function createFlashCardPrompt(
  topic: string,
  count: number,
  difficulty: DifficultyLevel
): string {
  const difficultyText = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.medium;

  return `你是一位專業的國中數學老師。請根據以下主題生成 ${count} 張閃卡，用於學生複習。

主題：${topic}
難度：${difficultyText}

請以 JSON 格式回傳，格式如下：
{
  "cards": [
    {
      "question": "問題內容（簡潔明確，適合閃卡）",
      "answer": "答案內容（清楚扼要，包含關鍵概念）",
      "category": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

注意事項：
1. 問題要簡潔，一句話說明核心概念或題目
2. 答案要完整但精簡，包含關鍵步驟或公式
3. 問題範圍涵蓋該主題的重要概念
4. 由淺入深，循序漸進
5. 適合快速複習記憶

請直接回傳 JSON，不要包含其他說明文字。`.trim();
}

/**
 * 為閃卡添加元數據（ID、統計資訊）
 */
function addCardMetadata(
  cards: FlashCard[],
  topic: string,
  difficulty: DifficultyLevel
): FlashCardWithMetadata[] {
  return cards.map((card, index) => ({
    id: `${Date.now()}-${index}`,
    question: card.question,
    answer: card.answer,
    category: card.category || topic,
    difficulty: card.difficulty || difficulty,
    reviewCount: 0,
    correctCount: 0,
  }));
}

/**
 * 創建預設閃卡（當 AI 調用失敗時）
 */
function createFallbackCards(
  topic: string,
  count: number,
  difficulty: DifficultyLevel
): FlashCardWithMetadata[] {
  const fallbackCard: FlashCard = {
    question: `${topic}的基本概念是什麼？`,
    answer: `請複習${topic}的定義和基本性質。`,
    category: topic,
    difficulty,
  };

  const cards = Array(Math.min(count, 3)).fill(fallbackCard);
  return addCardMetadata(cards, topic, difficulty);
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // 驗證參數
    const params = await request.json();
    validateRequiredParams(params, ['topic']);

    const {
      topic,
      count = 5,
      difficulty = 'medium',
    } = params as {
      topic: string;
      count?: number;
      difficulty?: DifficultyLevel;
    };

    // 驗證參數範圍
    if (count < 1 || count > 20) {
      throw new APIError(
        400,
        '閃卡數量必須在 1-20 之間',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new APIError(
        400,
        '難度必須是 easy, medium, 或 hard',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // 檢查 API Key
    if (!process.env.GEMINI_API_KEY) {
      throw new APIError(
        500,
        '缺少 GEMINI_API_KEY 環境變數',
        ErrorCodes.INTERNAL_ERROR
      );
    }

    // 創建提示詞
    const prompt = createFlashCardPrompt(topic, count, difficulty);

    // 創建備用方案
    const fallbackCards = createFallbackCards(topic, count, difficulty);
    const fallback: GenerateFlashCardResult = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cards: fallbackCards.map(({ id, reviewCount, correctCount, ...card }) => card),
    };

    try {
      // 使用統一的 Gemini Client 調用 AI
      const result = await askGeminiJSON<GenerateFlashCardResult>(
        prompt,
        fallback,
        {
          temperature: 0.7,
        }
      );

      // 驗證結果
      if (!result.cards || !Array.isArray(result.cards) || result.cards.length === 0) {
        console.warn('AI 回應格式不正確，使用備用方案');
        const response: GenerateFlashCardResponse = {
          success: true,
          cards: fallbackCards,
        };
        return createSuccessResponse(response);
      }

      // 為卡片添加元數據
      const cardsWithMetadata = addCardMetadata(result.cards, topic, difficulty);

      const response: GenerateFlashCardResponse = {
        success: true,
        cards: cardsWithMetadata,
      };

      return createSuccessResponse(response);
    } catch (error) {
      // AI 調用失敗，使用備用方案
      console.error('閃卡生成 AI 調用失敗:', error);

      const response: GenerateFlashCardResponse = {
        success: true,
        cards: fallbackCards,
      };

      return createSuccessResponse(response);
    }
  });
}

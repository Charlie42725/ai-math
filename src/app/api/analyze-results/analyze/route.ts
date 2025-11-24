import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import {
  withErrorHandler,
  createSuccessResponse,
  APIError,
  ErrorCodes,
} from '@/lib/api/apiErrorHandler';
import { askGeminiJSON } from '@/lib/api/geminiClient';
import { PromptTemplates, ALLOWED_MATH_CONCEPTS } from '@/lib/prompts';

interface UserMessage {
  conversation_id: string;
  user_id: string;
  message_index: number;
  text: string;
  timestamp: string | null;
}

interface LearningAnalysisResult {
  concepts_used: string[];
  unstable_concepts: string[];
  thinking_style: string;
  expression: string;
  ai_feedback: string[];
  confidence: number;
}

interface AnalyzedAttempt extends LearningAnalysisResult {
  id: string;
  user_id: string;
  conversation_id: string;
  message_index: number;
  text: string;
  analyzed_at: string;
}

/**
 * 數學關鍵字列表（用於初步過濾）
 */
const MATH_KEYWORDS = [
  '數學',
  '算式',
  '方程式',
  '函數',
  '幾何',
  '統計',
  '機率',
  '三角',
  '坐標',
  '圖形',
  '計算',
  '解題',
  '證明',
  '公式',
  '定理',
  '角度',
  '面積',
  '體積',
  '周長',
  '分數',
  '小數',
  '負數',
  '平方',
  '開根號',
  'x',
  'y',
  '=',
  '+',
  '-',
  '×',
  '÷',
  '°',
];

/**
 * 檢查訊息是否與數學相關
 */
function isMathRelated(text: string): boolean {
  return (
    MATH_KEYWORDS.some((keyword) => text.includes(keyword)) ||
    (!!text.match(/[0-9]+/) && text.length > 3) // 包含數字且不是太短的訊息
  );
}

/**
 * 過濾出有效的數學概念
 */
function filterMathConcepts(concepts: string[]): string[] {
  if (!Array.isArray(concepts)) {
    concepts = [concepts].filter(Boolean);
  }

  return concepts.filter(
    (concept) =>
      ALLOWED_MATH_CONCEPTS.some(
        (mathConcept) =>
          concept.includes(mathConcept) || mathConcept.includes(concept)
      ) || !!concept.match(/數學|計算|方程|函數|幾何|統計|機率/)
  );
}

/**
 * 提取對話的上下文
 */
function extractContext(
  conversations: any[],
  conversationId: string,
  messageIndex: number,
  messageText: string
): string {
  const conv = conversations.find((c) => c.id === conversationId);

  if (!conv || !Array.isArray(conv.messages)) {
    return `學生：${messageText}`;
  }

  return conv.messages
    .slice(Math.max(0, messageIndex - 3), messageIndex + 1)
    .map((m: any) => {
      if (m.role === 'user') return `學生：${m.parts?.[0]?.text ?? ''}`;
      if (m.role === 'assistant') return `AI：${m.parts?.[0]?.text ?? ''}`;
      if (m.role === 'system') return `題目：${m.parts?.[0]?.text ?? ''}`;
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * 提取所有使用者訊息
 */
function extractUserMessages(conversations: any[]): UserMessage[] {
  const userMessages: UserMessage[] = [];

  for (const conv of conversations) {
    const msgs = conv.messages || [];
    msgs.forEach((msg: any, index: number) => {
      if (msg.role === 'user') {
        userMessages.push({
          conversation_id: conv.id,
          user_id: conv.user_id,
          message_index: index + 1,
          text: msg.parts?.[0]?.text || '',
          timestamp: msg.timestamp || null,
        });
      }
    });
  }

  return userMessages;
}

/**
 * 生成唯一 UUID
 */
function generateId(): string {
  return randomUUID();
}

export async function POST(_req: NextRequest) {
  return withErrorHandler(async () => {
    console.log('Starting analysis...');

    // 檢查環境變數
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new APIError(
        500,
        '缺少 SUPABASE_URL 環境變數',
        ErrorCodes.INTERNAL_ERROR
      );
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new APIError(
        500,
        '缺少 SUPABASE_SERVICE_ROLE_KEY 環境變數',
        ErrorCodes.INTERNAL_ERROR
      );
    }

    // 創建 Supabase 客戶端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. 取得所有對話
    const { data: conversations, error } = await supabase
      .from('chat_histories')
      .select('id, user_id, messages');

    if (error) {
      console.error('Supabase error:', error);
      throw new APIError(
        500,
        `數據庫查詢失敗: ${error.message}`,
        ErrorCodes.DATABASE_ERROR
      );
    }

    console.log(`Found ${conversations?.length || 0} conversations`);

    // 2. 提取使用者訊息
    const userMessages = extractUserMessages(conversations || []);

    // 3. 只分析最新 5 筆訊息
    const latestMessages = userMessages.slice(-5);
    console.log(`Processing ${latestMessages.length} messages`);

    const resultsToSave: AnalyzedAttempt[] = [];

    // 4. 分析每個訊息
    for (const msg of latestMessages) {
      try {
        // 檢查是否為數學相關
        if (!isMathRelated(msg.text)) {
          console.log(
            `跳過非數學相關訊息: ${msg.text.substring(0, 50)}...`
          );
          continue;
        }

        // 提取上下文
        const context = extractContext(
          conversations || [],
          msg.conversation_id,
          msg.message_index,
          msg.text
        );

        // 使用統一的 Prompt 模板
        const prompt = PromptTemplates.learningAnalysis(context);

        // 呼叫 Gemini API 分析
        const fallback: LearningAnalysisResult = {
          concepts_used: [],
          unstable_concepts: [],
          thinking_style: '未知',
          expression: '模糊',
          ai_feedback: [],
          confidence: 0.5,
        };

        const parsed = await askGeminiJSON<LearningAnalysisResult>(
          prompt,
          fallback,
          { temperature: 0.7 }
        );

        // 過濾有效的數學概念
        const validConceptsUsed = filterMathConcepts(parsed.concepts_used);
        const validUnstableConcepts = filterMathConcepts(
          parsed.unstable_concepts
        );

        // 如果沒有有效的數學概念，跳過
        if (
          validConceptsUsed.length === 0 &&
          validUnstableConcepts.length === 0
        ) {
          console.log('跳過：未發現有效的數學概念');
          continue;
        }

        // 準備儲存的資料
        resultsToSave.push({
          id: generateId(),
          user_id: msg.user_id,
          conversation_id: msg.conversation_id,
          message_index: msg.message_index,
          text: msg.text,
          concepts_used: validConceptsUsed,
          unstable_concepts: validUnstableConcepts,
          thinking_style: parsed.thinking_style || '未知',
          expression: parsed.expression || '模糊',
          ai_feedback: Array.isArray(parsed.ai_feedback)
            ? parsed.ai_feedback
            : [parsed.ai_feedback].filter(Boolean),
          confidence: parsed.confidence || 0.5,
          analyzed_at: new Date().toISOString(),
        });
      } catch (msgError) {
        console.error(
          `Error processing message ${msg.conversation_id}:`,
          msgError
        );
        // 繼續處理下一個訊息
      }
    }

    // 5. 批次寫入結果
    if (resultsToSave.length > 0) {
      console.log(`準備寫入 ${resultsToSave.length} 筆資料...`);
      console.log('範例資料:', JSON.stringify(resultsToSave[0], null, 2));

      const { error: saveError } = await supabase
        .from('analyzed_attempts')
        .insert(resultsToSave);

      if (saveError) {
        console.error('[寫入失敗]', saveError);
        console.error('錯誤代碼:', saveError.code);
        console.error('錯誤詳情:', saveError.details);
        console.error('錯誤提示:', saveError.hint);
        throw new APIError(
          500,
          `寫入分析結果失敗: ${saveError.message}`,
          ErrorCodes.DATABASE_ERROR
        );
      }
    }

    console.log(`Successfully processed ${resultsToSave.length} messages`);

    return createSuccessResponse({
      count: resultsToSave.length,
      message: `成功分析 ${resultsToSave.length} 筆訊息`,
    });
  });
}

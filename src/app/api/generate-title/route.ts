/**
 * 生成對話標題 API
 * 使用 Gemini AI 根據對話內容生成簡潔的標題
 */

import { NextRequest } from 'next/server';
import { askGemini } from '@/lib/api/geminiClient';
import { createErrorResponse, createSuccessResponse, APIError, ErrorCodes } from '@/lib/api/apiErrorHandler';

interface GenerateTitleRequest {
  userMessage: string;
  aiResponse?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GenerateTitleRequest;
    const { userMessage, aiResponse } = body;

    if (!userMessage) {
      throw new APIError(400, '缺少必要參數：userMessage', ErrorCodes.VALIDATION_ERROR);
    }

    // 構建提示詞，讓 AI 生成簡潔的標題
    const prompt = `請根據以下對話內容，生成一個簡潔的中文標題（不超過 12 個字）。

規則：
1. 直接提煉對話的核心主題
2. 使用簡潔、通俗的語言
3. 不要使用引號、標點符號
4. 不要說「關於」、「討論」等多餘詞語
5. 直接用名詞或動詞短語

用戶問題：${userMessage}
${aiResponse ? `AI 回答：${aiResponse.slice(0, 150)}` : ''}

請只回傳標題文字：`;

    // 調用 Gemini API，使用較低的溫度以獲得更一致的結果
    const title = await askGemini(prompt, { temperature: 0.2 });

    // 清理標題：移除引號、換行符，限制長度
    const cleanedTitle = title
      .replace(/^["']|["']$/g, '') // 移除開頭和結尾的引號
      .replace(/\n/g, '') // 移除換行
      .trim()
      .slice(0, 30); // 最多 30 個字符

    return createSuccessResponse({ title: cleanedTitle || '新對話' });
  } catch (error) {
    console.error('[Generate Title API] Error:', error);
    return createErrorResponse(error);
  }
}

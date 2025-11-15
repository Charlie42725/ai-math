/**
 * Gemini API 統一客戶端
 * 封裝所有 Gemini API 調用邏輯
 */

import { parseGeminiJSON } from './jsonParser';
import { APIError, ErrorCodes } from './apiErrorHandler';

/**
 * Gemini 訊息格式
 */
export interface GeminiMessage {
  role: 'user' | 'assistant';
  parts: Array<{ text?: string; image?: string }>;
}

/**
 * Gemini API 選項
 */
export interface GeminiOptions {
  temperature?: number;
  maxTokens?: number;
  model?: 'gemini-2.0-flash' | 'gemini-pro-vision';
}

/**
 * Gemini API 回應
 */
export interface GeminiResponse {
  result: string;
  model?: string;
}

/**
 * 呼叫 Gemini API（基礎方法）
 */
export async function callGemini(
  messages: GeminiMessage[],
  options: GeminiOptions = {}
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new APIError(
        response.status,
        `Gemini API 調用失敗: ${response.statusText}`,
        ErrorCodes.GEMINI_API_ERROR
      );
    }

    const data = (await response.json()) as GeminiResponse;
    return data.result || '';
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    throw new APIError(
      500,
      `Gemini API 調用發生錯誤: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ErrorCodes.GEMINI_API_ERROR
    );
  }
}

/**
 * 呼叫 Gemini API 並返回文字（簡化版）
 */
export async function askGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const messages: GeminiMessage[] = [
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  return callGemini(messages, options);
}

/**
 * 呼叫 Gemini API 並解析 JSON 回應
 */
export async function askGeminiJSON<T>(
  prompt: string,
  fallback: T,
  options: GeminiOptions = {}
): Promise<T> {
  const result = await askGemini(prompt, options);
  return parseGeminiJSON<T>(result, fallback);
}

/**
 * 多輪對話呼叫 Gemini API
 */
export async function chatWithGemini(
  messages: GeminiMessage[],
  userInput: string,
  options: GeminiOptions = {}
): Promise<string> {
  const allMessages: GeminiMessage[] = [
    ...messages,
    {
      role: 'user',
      parts: [{ text: userInput }],
    },
  ];

  return callGemini(allMessages, options);
}

/**
 * 使用系統提示詞的對話
 */
export async function chatWithSystemPrompt(
  systemPrompt: string,
  systemResponse: string,
  conversationHistory: GeminiMessage[],
  userInput: string,
  options: GeminiOptions = {}
): Promise<string> {
  const messages: GeminiMessage[] = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'assistant', parts: [{ text: systemResponse }] },
    ...conversationHistory,
    { role: 'user', parts: [{ text: userInput }] },
  ];

  return callGemini(messages, options);
}

/**
 * 批次呼叫 Gemini API（平行處理）
 */
export async function batchCallGemini(
  prompts: string[],
  options: GeminiOptions = {}
): Promise<string[]> {
  const promises = prompts.map((prompt) => askGemini(prompt, options));
  return Promise.all(promises);
}

/**
 * 批次呼叫並解析 JSON
 */
export async function batchCallGeminiJSON<T>(
  prompts: string[],
  fallback: T,
  options: GeminiOptions = {}
): Promise<T[]> {
  const promises = prompts.map((prompt) =>
    askGeminiJSON<T>(prompt, fallback, options)
  );
  return Promise.all(promises);
}

/**
 * 重試機制包裝器
 */
export async function callGeminiWithRetry(
  messages: GeminiMessage[],
  options: GeminiOptions & { maxRetries?: number; retryDelay?: number } = {}
): Promise<string> {
  const { maxRetries = 3, retryDelay = 1000, ...geminiOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callGemini(messages, geminiOptions);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        // 等待後重試
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        console.log(`[Gemini Client] Retry attempt ${attempt + 1}/${maxRetries}`);
      }
    }
  }

  throw new APIError(
    500,
    `Gemini API 調用失敗（已重試 ${maxRetries} 次）: ${lastError?.message}`,
    ErrorCodes.GEMINI_API_ERROR
  );
}

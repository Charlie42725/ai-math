/**
 * 數學 AI 教學 Hook
 * 使用蘇格拉底式教學法提供數學指導
 */

import { chatWithSystemPrompt, GeminiMessage } from '@/lib/api/geminiClient';
import { PromptTemplates } from '@/lib/prompts';

/**
 * 向數學 AI 詢問問題
 * 使用蘇格拉底式教學法引導學生理解數學概念
 */
export async function askMathAI(
  messages: GeminiMessage[],
  userInput: string
): Promise<string> {
  try {
    // 使用統一的 Prompt 模板和 Gemini Client
    const response = await chatWithSystemPrompt(
      PromptTemplates.mathTeacher.primer,
      PromptTemplates.mathTeacher.initialResponse,
      messages,
      userInput
    );

    return response || 'No response.';
  } catch (error) {
    console.error('[Math AI] Error:', error);
    return '抱歉，目前無法回應。請稍後再試。';
  }
}

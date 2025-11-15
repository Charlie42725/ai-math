/**
 * 生成對話標題
 * 使用 AI 根據對話內容生成簡潔的標題
 */

import { ApiResponse } from '@/types';

interface GenerateTitleResponse {
  title: string;
}

/**
 * 根據對話內容生成標題
 * @param userMessage 用戶的問題
 * @param aiResponse AI 的回答（可選）
 * @returns 生成的標題
 */
export async function generateChatTitle(
  userMessage: string,
  aiResponse?: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate-title', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userMessage,
        aiResponse,
      }),
    });

    if (!response.ok) {
      console.error('生成標題失敗:', response.statusText);
      // 如果 API 失敗，回退到簡單截取
      return userMessage.slice(0, 30) || '新對話';
    }

    const data = await response.json() as ApiResponse<GenerateTitleResponse>;

    if (data.success && data.data?.title) {
      return data.data.title;
    }

    // 如果沒有成功，回退到簡單截取
    return userMessage.slice(0, 30) || '新對話';
  } catch (error) {
    console.error('生成標題時發生錯誤:', error);
    // 發生錯誤時回退到簡單截取
    return userMessage.slice(0, 30) || '新對話';
  }
}

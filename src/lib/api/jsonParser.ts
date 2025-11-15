/**
 * JSON 解析工具函數
 * 處理 Gemini API 回傳的 JSON 格式
 */

/**
 * 清理 Gemini 回傳的文字，提取純 JSON
 */
export function cleanGeminiJSON(rawText: string): string {
  let cleaned = rawText.trim();

  // 移除 Markdown code block 標記
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // 嘗試提取 JSON 對象
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return cleaned;
}

/**
 * 解析 Gemini 回傳的 JSON，支援容錯處理
 *
 * @param rawText - Gemini API 回傳的原始文字
 * @param fallback - 解析失敗時的預設值
 * @param options - 選項配置
 * @returns 解析後的物件或預設值
 */
export function parseGeminiJSON<T>(
  rawText: string,
  fallback: T,
  options: {
    logErrors?: boolean;
    throwOnError?: boolean;
  } = {}
): T {
  const { logErrors = true, throwOnError = false } = options;

  try {
    const cleaned = cleanGeminiJSON(rawText);
    const parsed = JSON.parse(cleaned) as T;
    return parsed;
  } catch (error) {
    if (logErrors) {
      console.error('[JSON Parser] Failed to parse Gemini response:', {
        rawText: rawText.substring(0, 200) + '...',
        error: error instanceof Error ? error.message : error,
      });
    }

    if (throwOnError) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return fallback;
  }
}

/**
 * 安全的 JSON 字串化，處理循環引用和 BigInt
 */
export function safeStringify(
  value: unknown,
  space?: string | number
): string {
  const seen = new WeakSet();

  return JSON.stringify(
    value,
    (key, val) => {
      // 處理 BigInt
      if (typeof val === 'bigint') {
        return val.toString();
      }

      // 處理循環引用
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular]';
        }
        seen.add(val);
      }

      return val;
    },
    space
  );
}

/**
 * 驗證物件是否包含必要欄位
 */
export function validateJSONFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter((field) => !(field in obj));

  return {
    valid: missingFields.length === 0,
    missingFields: missingFields as string[],
  };
}

/**
 * 嘗試從文字中提取多個 JSON 物件
 */
export function extractMultipleJSON<T = unknown>(text: string): T[] {
  const results: T[] = [];
  const jsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const matches = text.match(jsonRegex);

  if (!matches) {
    return results;
  }

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match) as T;
      results.push(parsed);
    } catch {
      // 忽略無效的 JSON
      continue;
    }
  }

  return results;
}

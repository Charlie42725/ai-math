import { ChatHistory } from "@/types";

/**
 * 標準化聊天歷史資料格式
 * 確保 messages 欄位存在且為陣列
 */
export function normalizeChatHistories(chats: ChatHistory[]): ChatHistory[] {
  return chats.map(chat => ({
    ...chat,
    messages: Array.isArray(chat.messages) ? chat.messages : []
  }));
}

/**
 * 去重聊天歷史
 * 使用 Map 確保每個 ID 唯一
 */
export function deduplicateChats(chats: ChatHistory[]): ChatHistory[] {
  const chatMap = new Map<string, ChatHistory>();

  for (const chat of chats) {
    if (chat.id && !chatMap.has(chat.id)) {
      chatMap.set(chat.id, chat);
    }
  }

  return Array.from(chatMap.values());
}

/**
 * 完整的聊天資料處理流程
 * 包含標準化、去重和排序
 */
export function processChatHistories(chats: unknown[]): ChatHistory[] {
  // 轉型並標準化
  const normalized = normalizeChatHistories(chats as ChatHistory[]);

  // 去重
  const deduplicated = deduplicateChats(normalized);

  // 按建立時間排序（最新的在前）
  return deduplicated.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * 檢查兩個聊天歷史陣列是否相同
 * 用於避免不必要的狀態更新
 */
export function areChatHistoriesEqual(chats1: ChatHistory[], chats2: ChatHistory[]): boolean {
  if (chats1.length !== chats2.length) return false;

  const ids1 = chats1.map(c => c.id).sort().join(',');
  const ids2 = chats2.map(c => c.id).sort().join(',');

  return ids1 === ids2;
}

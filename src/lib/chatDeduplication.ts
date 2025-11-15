// 聊天歷史去重工具函數
export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: any[];
  created_at?: string;
}

// 強化的去重函數 - 多重檢查機制
export function deduplicateChatHistories(chatHistories: ChatHistoryItem[]): ChatHistoryItem[] {
  const chatMap = new Map<string, ChatHistoryItem>();
  const seenTitles = new Set<string>();
  const seenContent = new Set<string>();
  
  for (const chat of chatHistories) {
    // 第一層：ID 去重
    if (chatMap.has(chat.id)) {
      continue;
    }
    
    // 第二層：標題 + 時間戳去重（避免快速重複創建）
    const timeKey = chat.created_at ? new Date(chat.created_at).toISOString().slice(0, 16) : '';
    const titleTimeKey = `${chat.title}-${timeKey}`;
    if (seenTitles.has(titleTimeKey)) {
      continue;
    }
    
    // 第三層：內容去重（比較第一條訊息內容）
    const firstMessageContent = chat.messages?.[0]?.parts?.[0]?.text || '';
    const contentKey = `${chat.title}-${firstMessageContent.slice(0, 50)}`;
    if (firstMessageContent && seenContent.has(contentKey)) {
      continue;
    }
    
    // 通過所有檢查，添加到結果中
    chatMap.set(chat.id, chat);
    seenTitles.add(titleTimeKey);
    if (firstMessageContent) {
      seenContent.add(contentKey);
    }
  }
  
  return Array.from(chatMap.values());
}

// 檢查是否為重複對話
export function isDuplicateConversation(
  newTitle: string, 
  newMessage: string, 
  existingChats: ChatHistoryItem[]
): boolean {
  const now = new Date().getTime();
  
  return existingChats.some(chat => {
    // 檢查標題相同
    if (chat.title !== newTitle) return false;
    
    // 檢查時間（5秒內視為重複）
    const chatTime = chat.created_at ? new Date(chat.created_at).getTime() : 0;
    if (now - chatTime > 5000) return false;
    
    // 檢查內容相似度
    const firstMessage = chat.messages?.[0]?.parts?.[0]?.text || '';
    return firstMessage === newMessage;
  });
}

/**
 * 清理過舊的重複檢查記錄
 * 優化版本：時間複雜度從 O(n²) 降至 O(n log n)
 */
export function cleanupOldDuplicateRecords(chatHistories: ChatHistoryItem[]): ChatHistoryItem[] {
  // 使用 Map 按標題分組（O(n)）
  const titleGroups = new Map<string, ChatHistoryItem[]>();

  for (const chat of chatHistories) {
    const group = titleGroups.get(chat.title) || [];
    group.push(chat);
    titleGroups.set(chat.title, group);
  }

  const result: ChatHistoryItem[] = [];

  // 對每個標題組進行處理（總計 O(n log n)）
  for (const [title, chats] of titleGroups) {
    // 只有一個對話，直接保留
    if (chats.length === 1) {
      result.push(chats[0]);
      continue;
    }

    // 按時間排序（降序：最新的在前）- O(k log k)，其中 k 是同標題對話數
    const sorted = chats.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA; // 降序
    });

    // 單次遍歷處理（O(k)）
    result.push(sorted[0]); // 永遠保留最新的
    let lastKeptTime = sorted[0].created_at ? new Date(sorted[0].created_at).getTime() : 0;

    for (let i = 1; i < sorted.length; i++) {
      const currentTime = sorted[i].created_at ? new Date(sorted[i].created_at).getTime() : 0;

      // 如果與上一個保留的對話時間差超過 30 秒，保留這個對話
      if (lastKeptTime - currentTime > 30000) {
        result.push(sorted[i]);
        lastKeptTime = currentTime;
      }
      // 否則，這個對話被視為重複，不保留
    }
  }

  return result;
}

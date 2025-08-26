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

// 清理過舊的重複檢查記錄
export function cleanupOldDuplicateRecords(chatHistories: ChatHistoryItem[]): ChatHistoryItem[] {
  const now = new Date().getTime();
  const titleCounts = new Map<string, ChatHistoryItem[]>();
  
  // 按標題分組
  for (const chat of chatHistories) {
    if (!titleCounts.has(chat.title)) {
      titleCounts.set(chat.title, []);
    }
    titleCounts.get(chat.title)!.push(chat);
  }
  
  const result: ChatHistoryItem[] = [];
  
  // 對每個標題組進行去重
  for (const [title, chats] of titleCounts) {
    if (chats.length === 1) {
      result.push(chats[0]);
      continue;
    }
    
    // 按時間排序，保留最新的
    const sortedChats = chats.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
    
    // 保留最新的一個，除非時間差超過30秒（說明是不同的對話）
    result.push(sortedChats[0]);
    
    for (let i = 1; i < sortedChats.length; i++) {
      const currentTime = sortedChats[i].created_at ? new Date(sortedChats[i].created_at!).getTime() : 0;
      const previousTime = sortedChats[i-1].created_at ? new Date(sortedChats[i-1].created_at!).getTime() : 0;
      
      // 如果時間差超過30秒，保留這個對話
      if (previousTime - currentTime > 30000) {
        result.push(sortedChats[i]);
      }
    }
  }
  
  return result;
}

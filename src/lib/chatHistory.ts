import { supabase } from "@/lib/supabase";

// 更新 chat history 訊息內容
export async function updateChatHistory(id: string, messages: any[]) {
  const { data, error } = await supabase
    .from("chat_histories")
    .update({ messages })
    .eq("id", id);
  return { data, error };
}
// 重新命名 chat history
export async function renameChatHistory(id: string, newTitle: string) {
  const { data, error } = await supabase
    .from("chat_histories")
    .update({ title: newTitle })
    .eq("id", id)
    .select();
  return { data, error };
}

// 刪除 chat history
export async function deleteChatHistory(id: string) {
  const { error } = await supabase
    .from("chat_histories")
    .delete()
    .eq("id", id);
  return { error };
}
// 取得單筆 chat history
export async function fetchChatHistoryById(id: string) {
  const { data, error } = await supabase
    .from("chat_histories")
    .select("id, title, messages, created_at")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function saveChatHistory(
  userId: string,
  messages: any[],
  title: string = "新對話"
): Promise<{ data: any[] | null; error: any }> {
  // 儲存一筆新的 chat history，使用提供的標題或默認值
  const { data, error } = await supabase
    .from("chat_histories")
    .insert([
      {
        user_id: userId,
        title,
        messages,
        created_at: new Date().toISOString(),
      },
    ])
    .select(); // 添加 select() 以返回插入的數據
  return { data, error };
}

export async function fetchChatHistories(userId: string) {
  const { data, error } = await supabase
    .from("chat_histories")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

// 搜尋對話功能
export async function searchChatHistories(userId: string, query: string) {
  if (!query.trim()) {
    // 若 query 為空，返回全部對話
    return fetchChatHistories(userId);
  }
  
  const { data, error } = await supabase
    .from("chat_histories")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false });
  return { data, error };
}

// 對話分組工具函數
export function groupChatsByDate(chats: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const groups = {
    today: [] as any[],
    yesterday: [] as any[],
    earlier: [] as any[]
  };

  chats.forEach(chat => {
    const chatDate = new Date(chat.created_at);
    const chatDay = new Date(chatDate.getFullYear(), chatDate.getMonth(), chatDate.getDate());

    if (chatDay.getTime() === today.getTime()) {
      groups.today.push(chat);
    } else if (chatDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(chat);
    } else {
      groups.earlier.push(chat);
    }
  });

  return groups;
}

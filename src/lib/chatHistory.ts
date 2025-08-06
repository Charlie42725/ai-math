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
    .select("messages")
    .eq("id", id)
    .single();
  return { data, error };
}
import { supabase } from "@/lib/supabase";

export async function saveChatHistory(userId: string, messages: any[]): Promise<{ data: any[] | null; error: any }> {
  // 儲存一筆新的 chat history，僅存摘要與完整訊息
  const title = messages.find(m => m.role === "user")?.parts[0]?.text?.slice(0, 20) || "新對話";
  const { data, error } = await supabase
    .from("chat_histories")
    .insert([
      {
        user_id: userId,
        title,
        messages,
        created_at: new Date().toISOString(),
      },
    ]);
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

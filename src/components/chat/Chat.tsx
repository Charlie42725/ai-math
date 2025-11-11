"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { saveChatHistory, fetchChatHistories, fetchChatHistoryById, renameChatHistory, deleteChatHistory, updateChatHistory } from "@/lib/chatHistory";
import { deduplicateChatHistories, isDuplicateConversation, cleanupOldDuplicateRecords } from "@/lib/chatDeduplication";
import ChatSidebar from "./ChatSidebar";
import ChatTopbar from "./ChatTopbar";
import ChatMain from "./ChatMain";
import { askMathAI } from "@/hooks/useMathAI";

interface ChatProps {
  initialChatId?: string;
}

export default function Chat({ initialChatId }: ChatProps = {}) {
const tags = [
  "與 AI 角色對話！",
  "AI 文字生成器",
  "數學 AI",
  "AI 詩詞生成器",
  "AI 故事創作者",
  "ChatGPT 替代方案",
  "GPT 聊天",
  "AI 程式碼",
  "更多功能",
];

// 型別定義

type MessagePart = { text?: string; image?: string };
type Message = {
  role: "user" | "assistant";
  parts: MessagePart[];
};

type ChatHistory = {
  id: string;
  title: string;
  messages: Message[];
  created_at?: string; // 添加 created_at 屬性
};

  const [user, setUser] = useState<{ id: string } | null>(null);
  // 檢查登入狀態
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  // 取得歷史紀錄
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  // 追蹤目前對話視窗的 chat id
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // 新增：防止重複創建對話的狀態
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);
  
  // 新增：檢查重複對話的函數
  const checkDuplicateChat = (newTitle: string, firstMessage: string) => {
    return isDuplicateConversation(newTitle, firstMessage, chatHistories);
  };
  
  // 防抖更新歷史記錄 - 改善版本
  const updateChatHistoriesDebounced = useRef<NodeJS.Timeout | null>(null);
  const [isUpdatingHistories, setIsUpdatingHistories] = useState(false);
  const [newChatSaved, setNewChatSaved] = useState(false); // 新增：顯示對話已保存提示
  
  // 新增：即時更新函數（用於新對話）
  const immediateUpdateHistories = async (userId: string) => {
    if (isUpdatingHistories) return;
    
    setIsUpdatingHistories(true);
    try {
      const { data } = await fetchChatHistories(userId);
      if (data) {
        const rawChats = (data as any[]).map(chat => ({ 
          ...chat, 
          messages: chat.messages || [] 
        }));
        
        let uniqueChats = deduplicateChatHistories(rawChats);
        uniqueChats = cleanupOldDuplicateRecords(uniqueChats);
        
        setChatHistories(uniqueChats);
      }
    } catch (error) {
      console.error('即時更新聊天歷史失敗:', error);
    } finally {
      setIsUpdatingHistories(false);
    }
  };
  
  const refreshChatHistories = async (userId: string) => {
    // 如果正在更新，跳過此次請求
    if (isUpdatingHistories) return;
    
    // 清除之前的定時器
    if (updateChatHistoriesDebounced.current) {
      clearTimeout(updateChatHistoriesDebounced.current);
    }
    
    // 設置新的定時器
    updateChatHistoriesDebounced.current = setTimeout(async () => {
      setIsUpdatingHistories(true);
      try {
        const { data } = await fetchChatHistories(userId);
        if (data) {
          // 使用強化的去重處理
          const rawChats = (data as any[]).map(chat => ({ 
            ...chat, 
            messages: chat.messages || [] 
          }));
          
          // 多層去重處理
          let uniqueChats = deduplicateChatHistories(rawChats);
          uniqueChats = cleanupOldDuplicateRecords(uniqueChats);
          
          // 只在有實際變化時更新狀態
          setChatHistories(prev => {
            const prevIds = prev.map(c => c.id).sort().join(',');
            const newIds = uniqueChats.map(c => c.id).sort().join(',');
            
            if (prevIds !== newIds) {
              return uniqueChats;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('更新聊天歷史失敗:', error);
      } finally {
        setIsUpdatingHistories(false);
      }
    }, 300); // 300ms 延遲
  };
  
  useEffect(() => {
    if (user) {
      refreshChatHistories(user.id);
      
      // 如果有 initialChatId，載入該對話
      if (initialChatId) {
        const loadInitialChat = async () => {
          const { data } = await fetchChatHistoryById(initialChatId);
          if (data) {
            setMessages(data.messages || []);
            setActiveChatId(initialChatId);
          }
        };
        loadInitialChat();
      }
    } else {
      setChatHistories([]);
      // 重置所有相關狀態
      setActiveChatId(null);
      setPendingChatId(null);
      setIsSavingChat(false);
    }
  }, [user, initialChatId]);

  // 清除定時器 - 增強版本
  useEffect(() => {
    return () => {
      if (updateChatHistoriesDebounced.current) {
        clearTimeout(updateChatHistoriesDebounced.current);
        updateChatHistoriesDebounced.current = null;
      }
    };
  }, []);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null!) as React.RefObject<HTMLInputElement>;

  // 側邊欄顯示狀態 (移動裝置)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 專門用於程式化發送訊息的函數
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // 先添加用戶訊息
    const userMessage: Message = { role: "user", parts: [{ text: messageText }] };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // 開始載入
    setLoading(true);
    
    try {
      // 使用 askMathAI 獲取回應，包含系統提示詞
      const reply = await askMathAI(messages, messageText);
      
      // 添加 AI 回應
      const aiMessage: Message = { role: "assistant", parts: [{ text: reply }] };
      setMessages([...newMessages, aiMessage]);
      
    } catch (error) {
      console.error('發送訊息失敗:', error);
      
      // 添加錯誤訊息
      const errorMessage: Message = { role: "assistant", parts: [{ text: "抱歉，發生錯誤，請稍後再試。" }] };
      setMessages([...newMessages, errorMessage]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    const newParts: { text?: string; image?: string }[] = [];
    if (input.trim()) newParts.push({ text: input });
    if (image) newParts.push({ image });
    const newMessages: Message[] = [
      ...messages,
      { role: "user", parts: newParts }
    ];
    setMessages(newMessages);
    setInput("");
    setImage(null);
    setLoading(true);
    try {
      let reply = "";
      if (image) {
        // 圖片與 prompt 一起送到 vision API
        const res = await fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64Image: image.split(",")[1], prompt: input }),
        });
        const data = await res.json();
        reply = data.result;
      } else {
        // 使用 askMathAI 獲取回應，包含系統提示詞
        reply = await askMathAI(messages, input);
      }
      const allMessages: Message[] = [
        ...newMessages,
        { role: "assistant", parts: [{ text: reply }] }
      ];
      setMessages(allMessages);
      // 登入狀態下儲存對話紀錄
      if (user) {
        // 使用 activeChatId 或 pendingChatId 來確定當前對話
        const currentChatId = activeChatId || pendingChatId;
        
        if (currentChatId) {
          // 更新現有 chat history
          await updateChatHistory(currentChatId, allMessages);
          
          // 如果使用的是 pendingChatId，現在設為 activeChatId
          if (pendingChatId && !activeChatId) {
            setActiveChatId(pendingChatId);
            setPendingChatId(null);
          }
          
          // 如果這是對話的第一次交互，更新 title
          if (allMessages.length === 2 && newParts[0]?.text) {
            const newTitle = newParts[0].text.slice(0, 30) || "新對話";
            await renameChatHistory(currentChatId, newTitle);
            // 使用即時更新來快速更新側邊欄
            setTimeout(async () => {
              await immediateUpdateHistories(user.id);
            }, 400); // 更快的響應時間
          }
        } else if (!isSavingChat) {
          // 創建新對話 - 只有在沒有正在保存時才執行
          setIsSavingChat(true);
          try {
            const newTitle = newParts[0]?.text?.slice(0, 30) || "新對話";
            const firstMessage = newParts[0]?.text || "";
            
            // 檢查是否有重複對話
            if (checkDuplicateChat(newTitle, firstMessage)) {
              console.log('檢測到重複對話，跳過創建');
              return;
            }
            
            const { data } = await saveChatHistory(user.id, allMessages);
            
            if (data && data[0]?.id) {
              const newChatId = data[0].id;
              
              // 檢查是否已存在此對話ID
              const existingChat = chatHistories.find(chat => chat.id === newChatId);
              if (!existingChat) {
                setActiveChatId(newChatId);
                
                // 顯示保存提示
                setNewChatSaved(true);
                setTimeout(() => setNewChatSaved(false), 3000);
                
                // 立即更新標題
                await renameChatHistory(newChatId, newTitle);
                
                // 使用即時更新 - 更快響應
                setTimeout(async () => {
                  await immediateUpdateHistories(user.id);
                }, 500); // 只延遲 0.5 秒
              } else {
                // 如果已存在，使用現有的ID
                setActiveChatId(newChatId);
              }
            }
          } catch (error) {
            console.error('保存對話失敗:', error);
          } finally {
            setIsSavingChat(false);
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", parts: [{ text: "[錯誤] 無法取得回應" }] }
      ]);
    } finally {
      setLoading(false);
      // inputRef.current?.focus(); // 移除 focus 調用，因為改用 textarea
    }
  };

  // 圖片上傳處理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen bg-slate-100 flex text-gray-800 overflow-hidden">
      {/* 左欄：對話紀錄清單 */}
      <div className={`
        fixed lg:relative z-50 lg:z-auto
        w-80 lg:w-80
        h-full bg-white border-r border-slate-200 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ChatSidebar
          user={user}
          chatHistories={chatHistories}
          menuOpenId={menuOpenId}
          renameId={renameId}
          renameValue={renameValue}
          setRenameId={setRenameId}
          setRenameValue={setRenameValue}
          setMenuOpenId={setMenuOpenId}
          setMessages={setMessages}
          setActiveChatId={setActiveChatId}
          fetchChatHistoryById={async (id: string) => {
            const { data } = await fetchChatHistoryById(id);
            if (data) {
              const chatMeta = chatHistories.find(c => c.messages === data.messages);
              return { data: { id: chatMeta?.id ?? '', title: chatMeta?.title ?? '', messages: data.messages || [] } };
            }
            return { data: null };
          }}
          fetchChatHistories={async (userId: string) => {
            const { data } = await fetchChatHistories(userId);
            if (data) {
              return { data: (data as any[]).map((c: any) => ({ ...c, messages: c.messages || [] })) };
            }
            return { data: null };
          }}
          renameChatHistory={async (id: string, title: string) => { await renameChatHistory(id, title); }}
          deleteChatHistory={async (id: string) => { await deleteChatHistory(id); }}
          setChatHistories={setChatHistories}
          loading={loading}
          tags={tags}
          sendMessage={sendMessage}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* 側邊欄遮罩 (移動裝置) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 右欄：當前對話視窗 */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        {/* 頂部工具列 */}
        <ChatTopbar
          user={user}
          onLogout={async () => {
            await supabase.auth.signOut();
          }}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* 對話主體 */}
        <ChatMain
          messages={messages}
          loading={loading}
          tags={tags}
          input={input}
          setInput={setInput}
          inputRef={inputRef}
          handleSend={handleSend}
          handleImageChange={handleImageChange}
          image={image}
          newChatSaved={newChatSaved}
        />
      </div>
    </div>
  );
}

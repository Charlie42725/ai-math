"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { saveChatHistory, fetchChatHistories, fetchChatHistoryById, renameChatHistory, deleteChatHistory, updateChatHistory } from "@/lib/chatHistory";
import ChatSidebar from "./ChatSidebar";
import ChatTopbar from "./ChatTopbar";
import ChatMain from "./ChatMain";
import { askMathAI } from "@/hooks/useMathAI";
export default function Chat() {
const tags = [
  "Chat with AI Characters!",
  "AI Text Generator",
  "Math AI",
  "AI Poem Generator",
  "AI Storyteller",
  "ChatGPT Alternative",
  "GPT Chat",
  "AI Code",
  "More",
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
  
  // 防抖更新歷史記錄
  const updateChatHistoriesDebounced = useRef<NodeJS.Timeout | null>(null);
  
  const refreshChatHistories = async (userId: string) => {
    // 清除之前的定時器
    if (updateChatHistoriesDebounced.current) {
      clearTimeout(updateChatHistoriesDebounced.current);
    }
    
    // 設置新的定時器
    updateChatHistoriesDebounced.current = setTimeout(async () => {
      const { data } = await fetchChatHistories(userId);
      if (data) {
        // 去重處理
        const uniqueChats = (data as any[])
          .map((c: any) => ({ ...c, messages: c.messages || [] }))
          .filter((chat, index, arr) => arr.findIndex(c => c.id === chat.id) === index);
        setChatHistories(uniqueChats);
      }
    }, 300); // 300ms 延遲
  };
  
  useEffect(() => {
    if (user) {
      refreshChatHistories(user.id);
    } else {
      setChatHistories([]);
    }
  }, [user]);

  // 清除定時器
  useEffect(() => {
    return () => {
      if (updateChatHistoriesDebounced.current) {
        clearTimeout(updateChatHistoriesDebounced.current);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !image) return;
    let newParts: { text?: string; image?: string }[] = [];
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
        reply = await askMathAI(messages, input);
      }
      const allMessages: Message[] = [
        ...newMessages,
        { role: "assistant", parts: [{ text: reply }] }
      ];
      setMessages(allMessages);
      // 登入狀態下儲存對話紀錄
      if (user) {
        if (activeChatId) {
          // 更新現有 chat history
          await updateChatHistory(activeChatId, allMessages);
          // 如果這是新對話的第一句，更新 title
          if (newMessages.length === 1 && newParts[0]?.text) {
            const newTitle = newParts[0].text.slice(0, 20) || "新對話";
            await renameChatHistory(activeChatId, newTitle);
            // 只有在更新標題時才重新獲取歷史紀錄
            await refreshChatHistories(user.id);
          }
        } else {
          // 新增 chat history
          const { data } = await saveChatHistory(user.id, allMessages);
          // 取得新 id
          if (data && data[0]?.id) {
            setActiveChatId(data[0].id);
            // 只在新增對話時重新獲取歷史紀錄
            await refreshChatHistories(user.id);
          }
        }
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", parts: [{ text: "[Error] 無法取得回應" }] }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex text-white overflow-hidden">
      {/* 左欄：對話紀錄清單 */}
      <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col">
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
        />
      </div>

      {/* 右欄：當前對話視窗 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 頂部工具列 */}
        <ChatTopbar 
          user={user} 
          onLogout={async () => { 
            await supabase.auth.signOut(); 
          }} 
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
        />
      </div>
    </div>
  );
}

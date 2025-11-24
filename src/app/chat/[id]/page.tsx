"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DEV_MODE, ADMIN_USER } from "@/lib/devAuth";
import { fetchChatHistoryById } from "@/lib/chatHistory";
import Chat from "@/components/chat/Chat";

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        // 開發模式：直接使用管理員帳號
        if (DEV_MODE) {
          setUser({ id: ADMIN_USER.id });
          setLoading(false);
          return;
        }

        // 正常模式：從 Supabase Auth 取得用戶
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);

        if (data?.user && conversationId) {
          // 驗證對話是否屬於該使用者
          const { data: chatData, error: chatError } = await fetchChatHistoryById(conversationId);
          if (chatError || !chatData) {
            setError("對話不存在或無法存取");
          }
        }
      } catch (err) {
        setError("載入失敗");
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // 只在非開發模式下監聽 auth 變化
    if (!DEV_MODE) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        listener?.subscription.unsubscribe();
      };
    }
  }, [conversationId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white">請先登入</div>
      </div>
    );
  }

  // 傳遞 conversationId 給 Chat 組件
  return <Chat initialChatId={conversationId} />;
}

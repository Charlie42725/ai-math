"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEV_MODE, ADMIN_USER } from "@/lib/devAuth";
import AnalyzeResults from "@/components/analyze/AnalyzeResults";
import NavigationBar from "@/components/test/NavigationBar";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AnalyzePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      // 開發模式：直接使用管理員 ID
      if (DEV_MODE) {
        setUserId(ADMIN_USER.id);
        return;
      }

      // 正常模式：從 Supabase Auth 取得用戶
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    };
    getUser();

    // 只在非開發模式下監聽 auth 變化
    if (!DEV_MODE) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUserId(session?.user?.id ?? null);
      });
      return () => {
        listener?.subscription.unsubscribe();
      };
    }
  }, []);

  return (
    <AuthGuard>
      <NavigationBar />
      <div className="h-screen bg-slate-100 text-gray-800 overflow-hidden">
        {userId && <AnalyzeResults userId={userId} />}
      </div>
    </AuthGuard>
  );
}

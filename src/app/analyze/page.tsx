"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DEV_MODE, ADMIN_USER } from "@/lib/devAuth";
import AnalyzeResults from "@/components/analyze/AnalyzeResults";

export default function AnalyzePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      // 開發模式：直接使用管理員 ID
      if (DEV_MODE) {
        setUserId(ADMIN_USER.id);
        setLoading(false);
        return;
      }

      // 正常模式：從 Supabase Auth 取得用戶
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
      setLoading(false);
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

  if (loading) {
    return (
      <div className="h-screen bg-slate-100 flex items-center justify-center text-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="h-screen bg-slate-100 flex items-center justify-center text-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-xl mb-2">請先登入</p>
          <p className="text-slate-600">需要登入才能查看分析報表</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 text-gray-800 overflow-hidden">
      <AnalyzeResults userId={userId} />
    </div>
  );
}

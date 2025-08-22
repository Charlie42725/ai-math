"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AnalyzeResults from "@/components/analyze/AnalyzeResults";

export default function AnalyzePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
      setLoading(false);
    };
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">載入中...</p>
        </div>
      </div>
    );
  }
  
  if (!userId) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-xl mb-2">請先登入</p>
          <p className="text-slate-400">需要登入才能查看分析報表</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <AnalyzeResults userId={userId} />
    </div>
  );
}

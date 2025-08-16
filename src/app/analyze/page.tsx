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

  if (loading) return <div>載入中...</div>;
  if (!userId) return <div>請先登入</div>;
  return <AnalyzeResults userId={userId} />;
}

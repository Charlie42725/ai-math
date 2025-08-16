"use client";
import { useEffect, useState } from "react";
import ConceptChart from "./ConceptChart";
import UnstableChart from "./UnstableChart";
import FeedbackList from "./FeedbackList";

type Analysis = {
  id: string;
  user_id: string;
  concepts_used: string[];
  unstable_concepts: string[];
  thinking_style: string | null;
  expression: string | null;
  ai_feedback: string[];
  analyzed_at: string;
};

export default function AnalyzeResults({ userId }: { userId: string }) {
  const [data, setData] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 取得分析結果
  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze-results`);
      const json = await res.json();
      console.log('分析結果 API 回傳:', json);
      setData(json.data || []);
    } catch (e) {
      setError("讀取分析結果失敗");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line
  }, [userId]);

  // 觸發分析
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-results/analyze", {
        method: "POST",
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "分析失敗");
      await fetchAnalysis();
    } catch (e: any) {
      setError(e.message || "分析失敗");
    }
    setAnalyzing(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4 mb-2">
        <button
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition disabled:opacity-50"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? "分析中..." : "開始分析"}
        </button>
        {loading && <span className="text-gray-500">載入分析結果中...</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>
      <ConceptChart data={data} />
      <UnstableChart data={data} />
      <FeedbackList data={data} />
    </div>
  );
}

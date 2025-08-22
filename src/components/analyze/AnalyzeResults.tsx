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
    <div className="h-full flex flex-col">
      {/* 頂部標題區 */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-xl">📊</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI分析報表
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 
                       hover:from-indigo-600 hover:to-purple-700 text-white font-semibold 
                       transition-all duration-200 shadow-md hover:shadow-lg 
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={analyzing || loading}
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                分析中...
              </div>
            ) : (
              "🚀 開始分析"
            )}
          </button>
          
          {loading && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              載入分析結果中...
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-400">
              <span>⚠️</span>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <ConceptChart data={data} />
        <UnstableChart data={data} />
        <FeedbackList data={data} />
      </div>
    </div>
  );
}

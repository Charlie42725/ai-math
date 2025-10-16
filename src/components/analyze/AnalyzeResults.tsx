"use client";
import { useEffect, useState } from "react";
import GameDashboard from "./GameDashboard";

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
      <div className="relative overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-800/30 to-pink-900/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-2xl"></div>
        
        {/* 內容 */}
        <div className="relative p-8 border-b border-slate-700/30 backdrop-blur-sm">
          {/* 標題部分 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full shadow-md animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
                  AI 學習分析報表
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                  深度分析您的數學學習狀況並提供個人化建議
                </p>
              </div>
            </div>
            
            {/* 統計卡片 */}
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
                <div className="text-xs text-slate-400 mb-1">總分析次數</div>
                <div className="text-lg font-semibold text-white">{data.length}</div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                <div className="text-xs text-purple-300 mb-1">活躍狀態</div>
                <div className="text-lg font-semibold text-purple-200">🟢 線上</div>
              </div>
            </div>
          </div>
          
          {/* 操作按鈕區 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 
                         hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 
                         text-white font-bold transition-all duration-300 
                         shadow-xl hover:shadow-2xl hover:shadow-purple-500/25
                         transform hover:-translate-y-0.5 hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         border border-white/10"
              onClick={handleAnalyze}
              disabled={analyzing || loading}
            >
              {analyzing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    AI 分析中...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xl group-hover:animate-bounce">🚀</span>
                  <span>開始 AI 分析</span>
                </div>
              )}
            </button>
            
            {/* 狀態指示器 */}
            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">載入分析結果中...</span>
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                  <span className="text-lg animate-pulse">⚠️</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <GameDashboard data={data} />
      </div>
    </div>
  );
}

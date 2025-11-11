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
      <div className="relative overflow-hidden bg-white">
        {/* 內容 */}
        <div className="relative p-4 md:p-8 border-b border-slate-200">
          {/* 標題部分 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-700 flex items-center justify-center shadow-sm">
                  <span className="text-xl md:text-2xl">📊</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full shadow-md animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-700">
                  AI 學習分析報表
                </h1>
                <p className="text-gray-600 mt-1 text-xs md:text-sm hidden sm:block">
                  深度分析您的數學學習狀況並提供個人化建議
                </p>
              </div>
            </div>

            {/* 統計卡片 */}
            <div className="flex gap-2 md:gap-3">
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-xs text-gray-600 mb-0.5 md:mb-1">總分析次數</div>
                <div className="text-base md:text-lg font-semibold text-gray-800">{data.length}</div>
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-green-50 border border-green-200">
                <div className="text-xs text-green-700 mb-0.5 md:mb-1">活躍狀態</div>
                <div className="text-base md:text-lg font-semibold text-green-600">🟢 <span className="hidden sm:inline">線上</span></div>
              </div>
            </div>
          </div>
          
          {/* 操作按鈕區 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <button
              className="group w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-2xl bg-slate-700 hover:bg-slate-800
                         text-white font-bold text-sm md:text-base transition-all duration-300
                         shadow-sm hover:shadow-md
                         transform hover:-translate-y-0.5
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleAnalyze}
              disabled={analyzing || loading}
            >
              {analyzing ? (
                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>AI 分析中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <span className="text-lg md:text-xl group-hover:animate-bounce">🚀</span>
                  <span>開始 AI 分析</span>
                </div>
              )}
            </button>

            {/* 狀態指示器 */}
            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">載入分析結果中...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700">
                  <span className="text-lg animate-pulse">⚠️</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <GameDashboard data={data} />
      </div>
    </div>
  );
}

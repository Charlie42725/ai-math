"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
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
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
        {/* 裝飾性背景 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* 內容 */}
        <div className="relative p-4 md:p-8 border-b border-indigo-200">
          {/* 標題和按鈕區 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 md:gap-6">
              {/* 主角圖片 */}
              <div className="relative flex-shrink-0 group">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white shadow-lg overflow-hidden border-4 border-white ring-2 ring-indigo-200 transition-all duration-300 group-hover:scale-105 group-hover:ring-indigo-300">
                  <Image
                    src="/bs/cute.png"
                    alt="AI Math Assistant"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-7 md:h-7 bg-green-400 rounded-full shadow-lg animate-pulse border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI 學習分析報表
                </h1>
              </div>
            </div>

            {/* 開始分析按鈕 */}
            <button
              className="group w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-2xl
                         bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                         text-white font-bold text-sm md:text-base transition-all duration-300
                         shadow-lg hover:shadow-2xl
                         transform hover:-translate-y-1 hover:scale-105
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
                         border-2 border-white/20 flex-shrink-0"
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
                  <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>開始 AI 分析</span>
                </div>
              )}
            </button>
          </div>

          {/* 統計卡片和狀態指示器 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
            <div className="flex gap-3 md:gap-4 flex-1">
              <div className="flex-1 sm:min-w-[140px] px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-xs text-indigo-700 mb-1 font-semibold uppercase tracking-wide">總分析次數</div>
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{data.length}</div>
              </div>
              <div className="flex-1 sm:min-w-[140px] px-4 md:px-5 py-3 md:py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="text-xs text-green-700 mb-1 font-semibold uppercase tracking-wide">活躍狀態</div>
                <div className="text-lg md:text-xl font-bold text-green-600 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                  線上中
                </div>
              </div>
            </div>

            {/* 狀態指示器 */}
            {loading && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-50/80 backdrop-blur-sm border-2 border-blue-200 text-blue-700 shadow-md w-full sm:w-auto">
                <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">載入分析結果中...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-50/80 backdrop-blur-sm border-2 border-red-200 text-red-700 shadow-md w-full sm:w-auto">
                <span className="text-xl">⚠️</span>
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}
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

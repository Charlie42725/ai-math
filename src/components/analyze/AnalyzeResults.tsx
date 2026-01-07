"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import GameDashboard from "./GameDashboard";
import TestStatsCard from "./TestStatsCard";
import LearningInsightsCard from "./LearningInsightsCard";

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

      // 檢查回應是否為 JSON
      const contentType = res.headers.get("content-type");
      console.log('回應狀態:', res.status, res.statusText);
      console.log('回應類型:', contentType);

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        console.error('非 JSON 回應:', text);
        throw new Error(`伺服器錯誤: ${text.substring(0, 100)}`);
      }

      const json = await res.json();
      console.log('分析 API 回應:', json);

      if (!json.success) {
        throw new Error(json.error || "分析失敗");
      }

      await fetchAnalysis();
    } catch (e: any) {
      console.error('分析失敗:', e);
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
        <div className="relative p-4 border-b border-gray-200">
          {/* 標題和按鈕區 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* 主角圖片 */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white shadow overflow-hidden border-2 border-white">
                  <Image
                    src="/bs/cute.png"
                    alt="AI Math Assistant"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full shadow border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  AI 學習分析報表
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                  <span className="px-2 py-0.5 rounded bg-white/60 border border-indigo-200">總分析 {data.length} 次</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/60 border border-green-200">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    線上中
                  </span>
                </div>
              </div>
            </div>

            {/* 開始分析按鈕 */}
            <button
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              onClick={handleAnalyze}
              disabled={analyzing || loading}
            >
              {analyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>分析中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>開始 AI 分析</span>
                </div>
              )}
            </button>
          </div>

          {/* 狀態指示器 */}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 mt-3">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm font-semibold">載入分析結果中...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 mt-3">
              <span className="text-lg">⚠️</span>
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 綜合學習洞察卡片 */}
          <LearningInsightsCard userId={userId} />
          
          {/* 測驗統計卡片 */}
          <TestStatsCard userId={userId} />
          
          {/* 聊天分析報表 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💬</span>
              對話學習分析
            </h2>
            <GameDashboard data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

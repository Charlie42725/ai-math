'use client';

import { useEffect, useState } from 'react';

interface LearningInsights {
  criticalConcepts: Array<{
    concept: string;
    chatCount: number;
    testCount: number;
    total: number;
  }>;
  testTrend: Array<{ date: string; accuracy: number }>;
  suggestions: string[];
  summary: {
    totalTests: number;
    totalChatSessions: number;
    totalWeakConcepts: number;
  };
}

interface LearningInsightsCardProps {
  userId: string;
}

export default function LearningInsightsCard({ userId }: LearningInsightsCardProps) {
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/learning-insights?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setInsights(result.data);
      } else {
        setError(result.error || '獲取學習洞察失敗');
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return null;
  }

  // 如果沒有足夠的數據
  if (insights.summary.totalTests === 0 && insights.summary.totalChatSessions === 0) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-fuchsia-50 rounded-3xl shadow-2xl p-6 md:p-8 border-4 border-purple-200 overflow-hidden">
      {/* 裝飾性背景 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-fuchsia-300/30 to-purple-400/30 rounded-full blur-3xl"></div>

      <div className="relative flex items-center gap-3 mb-8">
        <span className="text-5xl animate-pulse">💡</span>
        <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          綜合學習洞察
        </h2>
        <span className="ml-auto text-xl">✨</span>
      </div>

      {/* 統計摘要 */}
      <div className="relative grid grid-cols-3 gap-4 md:gap-5 mb-8">
        <div className="group bg-white/90 backdrop-blur rounded-2xl p-5 border-3 border-purple-200 hover:border-purple-400 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">📝</span>
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{insights.summary.totalTests}</div>
            <div className="text-xs md:text-sm font-bold text-stone-600 mt-2">測驗次數</div>
          </div>
        </div>
        <div className="group bg-white/90 backdrop-blur rounded-2xl p-5 border-3 border-pink-200 hover:border-pink-400 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2">💬</span>
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-pink-600 to-pink-800 bg-clip-text text-transparent">{insights.summary.totalChatSessions}</div>
            <div className="text-xs md:text-sm font-bold text-stone-600 mt-2">對話次數</div>
          </div>
        </div>
        <div className="group bg-white/90 backdrop-blur rounded-2xl p-5 border-3 border-orange-200 hover:border-orange-400 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-2 animate-pulse">⚠️</span>
            <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">{insights.summary.totalWeakConcepts}</div>
            <div className="text-xs md:text-sm font-bold text-stone-600 mt-2">待加強</div>
          </div>
        </div>
      </div>

      {/* 關鍵弱項概念 */}
      {insights.criticalConcepts.length > 0 && (
        <div className="relative mb-8">
          <h3 className="text-lg md:text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">重點加強概念</span>
          </h3>
          <div className="space-y-3">
            {insights.criticalConcepts.slice(0, 5).map((item, index) => (
              <div key={index} className="group relative bg-white/90 backdrop-blur rounded-2xl p-4 border-3 border-orange-200 hover:border-orange-400 shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                {/* 排名標記 */}
                <div className="absolute -left-2 -top-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-white text-xs font-black">#{index + 1}</span>
                </div>

                <div className="flex items-center justify-between mb-3 ml-4">
                  <span className="font-black text-stone-800 text-base md:text-lg">{item.concept}</span>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm font-black rounded-full border-2 border-orange-300 shadow-sm">
                    {item.total} 次
                  </span>
                </div>
                <div className="flex gap-2 text-xs md:text-sm ml-4">
                  {item.chatCount > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold border border-blue-300">
                      💬 對話 {item.chatCount}
                    </span>
                  )}
                  {item.testCount > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold border border-red-300">
                      📝 測驗錯 {item.testCount}
                    </span>
                  )}
                </div>
                {/* 閃光效果 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/0 via-orange-100/30 to-orange-100/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 學習建議 */}
      {insights.suggestions.length > 0 && (
        <div className="relative">
          <h3 className="text-lg md:text-xl font-black text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-3xl">💪</span>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI 學習建議</span>
          </h3>
          <div className="space-y-3">
            {insights.suggestions.map((suggestion, index) => (
              <div key={index} className="group relative bg-white/90 backdrop-blur rounded-2xl p-4 border-3 border-purple-200 hover:border-purple-400 shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 group-hover:scale-125 transition-transform">💡</span>
                  <p className="text-sm md:text-base text-stone-800 font-semibold flex-1">{suggestion}</p>
                </div>
                {/* 閃光效果 */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-100/0 via-purple-100/30 to-purple-100/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

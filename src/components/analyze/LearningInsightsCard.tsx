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
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">💡</span>
        <h2 className="text-xl font-bold text-stone-800">綜合學習洞察</h2>
      </div>

      {/* 統計摘要 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
          <div className="text-2xl font-bold text-purple-600">{insights.summary.totalTests}</div>
          <div className="text-xs text-stone-600 mt-1">測驗次數</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
          <div className="text-2xl font-bold text-pink-600">{insights.summary.totalChatSessions}</div>
          <div className="text-xs text-stone-600 mt-1">對話次數</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
          <div className="text-2xl font-bold text-orange-600">{insights.summary.totalWeakConcepts}</div>
          <div className="text-xs text-stone-600 mt-1">待加強</div>
        </div>
      </div>

      {/* 關鍵弱項概念 */}
      {insights.criticalConcepts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-stone-700 mb-3">🎯 重點加強概念</h3>
          <div className="space-y-2">
            {insights.criticalConcepts.slice(0, 5).map((item, index) => (
              <div key={index} className="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-stone-800 text-sm">{item.concept}</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                    {item.total} 次
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  {item.chatCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                      💬 對話 {item.chatCount}
                    </span>
                  )}
                  {item.testCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
                      📝 測驗錯 {item.testCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 學習建議 */}
      {insights.suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-stone-700 mb-3">💪 學習建議</h3>
          <div className="space-y-2">
            {insights.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white/80 backdrop-blur rounded-lg p-3 border border-purple-100">
                <div className="flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5 flex-shrink-0">•</span>
                  <p className="text-sm text-stone-700">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

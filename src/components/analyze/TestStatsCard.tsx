'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TestStats {
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  avgScore: number;
  weakConcepts: Array<{ concept: string; count: number }>;
  progressTrend: Array<{ date: string; score: number; totalQuestions: number }>;
  lastSession: {
    id: string;
    date: string;
    score: number;
    totalScore: number;
    accuracy: number;
  } | null;
}

interface TestStatsCardProps {
  userId: string;
}

export default function TestStatsCard({ userId }: TestStatsCardProps) {
  const [stats, setStats] = useState<TestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-sessions/stats?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || '獲取統計數據失敗');
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return null; // 靜默失敗，不影響其他內容
  }

  if (stats.totalSessions === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-100">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">還沒有測驗記錄</h3>
          <p className="text-stone-600 mb-4">開始測驗來追蹤你的學習進度吧！</p>
          <Link 
            href="/test"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            開始測驗
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 總覽卡片 */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            測驗統計
          </h2>
          <Link 
            href="/test-history"
            className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
          >
            查看全部
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* 統計數據網格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="text-2xl font-bold text-amber-600">{stats.totalSessions}</div>
            <div className="text-xs text-stone-600 mt-1">測驗次數</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="text-2xl font-bold text-green-600">{stats.accuracy}%</div>
            <div className="text-xs text-stone-600 mt-1">總正確率</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="text-2xl font-bold text-blue-600">{stats.avgScore.toFixed(0)}</div>
            <div className="text-xs text-stone-600 mt-1">平均分數</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
            <div className="text-xs text-stone-600 mt-1">總題數</div>
          </div>
        </div>

        {/* 最近測驗 */}
        {stats.lastSession && (
          <Link
            href={`/test-history/${stats.lastSession.id}`}
            className="block bg-white rounded-xl p-4 shadow-sm border border-stone-100 hover:border-amber-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-stone-800">最近測驗</div>
                <div className="text-xs text-stone-500 mt-1">
                  {new Date(stats.lastSession.date).toLocaleDateString('zh-TW', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.lastSession.score}/{stats.lastSession.totalScore}
                </div>
                <div className={`text-xs font-semibold ${
                  stats.lastSession.accuracy >= 60 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.lastSession.accuracy}%
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* 弱項概念 */}
      {stats.weakConcepts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            需要加強的概念
          </h3>
          <div className="space-y-2">
            {stats.weakConcepts.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-sm font-medium text-stone-700">{item.concept}</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  錯 {item.count} 次
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 進步趨勢圖 */}
      {stats.progressTrend.length > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📈</span>
            進步趨勢
          </h3>
          <div className="space-y-2">
            {stats.progressTrend.slice(-5).map((item, index) => {
              const maxScore = 100;
              const widthPercent = (item.score / maxScore) * 100;
              const color = item.score >= 80 ? 'bg-green-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-red-500';
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>{item.date}</span>
                    <span className="font-semibold">{item.score.toFixed(0)}分</span>
                  </div>
                  <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} transition-all duration-500 rounded-full`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

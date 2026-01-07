'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TestSession {
  id: string;
  user_id: string;
  total_questions: number;
  total_score: number;
  earned_score: number;
  time_spent: number;
  settings: any;
  created_at: string;
}

interface TestReviewProps {
  userId: string;
}

export default function TestReview({ userId }: TestReviewProps) {
  const [sessions, setSessions] = useState<TestSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-sessions?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setSessions(result.data);
      } else {
        setError(result.error || '獲取測驗記錄失敗');
      }
    } catch (err: any) {
      setError(err.message || '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-stone-600">載入測驗記錄中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* 標題部分 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">測驗複盤</h1>
        <p className="text-stone-600">查看你的測驗歷史記錄和詳細分析</p>
      </div>

      {/* 測驗列表 */}
      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-stone-600 mb-4">還沒有測驗記錄</p>
          <Link 
            href="/test"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            開始測驗
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const percentage = (session.earned_score / session.total_score * 100).toFixed(1);
            const isPassed = parseFloat(percentage) >= 60;

            return (
              <Link
                key={session.id}
                href={`/test-history/${session.id}`}
                className="block bg-white rounded-lg p-6 border border-stone-200 hover:border-amber-500 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* 左侧信息 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-2xl">{isPassed ? '✅' : '📝'}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-stone-800">
                          {session.settings?.mode === 'grade' && `${session.settings.selectedGrade} 年級測驗`}
                          {session.settings?.mode === 'unit' && `${session.settings.selectedUnit} 單元測驗`}
                          {session.settings?.mode === 'random' && '隨機測驗'}
                          {session.settings?.mode === 'mixed' && '混合測驗'}
                          {!session.settings?.mode && '練習測驗'}
                        </h3>
                        <p className="text-sm text-stone-500">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                      <div>
                        <span className="font-medium">題目數:</span> {session.total_questions}
                      </div>
                      <div>
                        <span className="font-medium">用时:</span> {formatTime(session.time_spent)}
                      </div>
                    </div>
                  </div>

                  {/* 右側得分 */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-stone-800 mb-1">
                        {session.earned_score}/{session.total_score}
                      </div>
                      <div className={`text-sm font-semibold ${isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                        {percentage}%
                      </div>
                    </div>

                    {/* 進度環 */}
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-stone-200"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - parseFloat(percentage) / 100)}`}
                          className={isPassed ? 'text-green-500' : 'text-amber-500'}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EnhancedAnalysisSidebar from './EnhancedAnalysisSidebar';

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

interface TestAnswer {
  id: string;
  session_id: string;
  question_id: number;
  question_content: string;
  question_type: string;
  user_answer: string;
  user_process: string;
  correct_answer: string;
  is_correct: boolean;
  points: number;
  feedback: string;
  explanation: string;
  detailed_analysis: string;
  thinking_process: string;
  thinking_score: number;
  optimization: string;
  suggestions: string[];
  step_by_step_solution: any[];
  key_points: string[];
}

interface TestSessionDetailProps {
  sessionId: string;
}

export default function TestSessionDetail({ sessionId }: TestSessionDetailProps) {
  const router = useRouter();
  const [session, setSession] = useState<TestSession | null>(null);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    fetchSessionDetail();
  }, [sessionId]);

  const fetchSessionDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test-sessions/${sessionId}`);
      const result = await response.json();

      if (result.success) {
        setSession(result.data.session);
        setAnswers(result.data.answers);
      } else {
        setError(result.error || '獲取測驗詳情失敗');
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
        <div className="text-stone-600">載入測驗詳情中...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">{error || '測驗不存在'}</div>
      </div>
    );
  }

  const currentAnswer = answers[currentQuestionIndex];
  const percentage = (session.earned_score / session.total_score * 100).toFixed(1);
  const isPassed = parseFloat(percentage) >= 60;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 頂部摘要資訊 */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push('/test-history')}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回列表
            </button>

            <div className="flex items-center gap-6">
              <div className="text-sm text-stone-600">
                <span className="font-medium">測驗時間:</span> {formatDate(session.created_at)}
              </div>
              <div className="text-sm text-stone-600">
                <span className="font-medium">用時:</span> {formatTime(session.time_spent)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-stone-800">
                  {session.earned_score}/{session.total_score}
                </span>
                <span className={`text-sm font-semibold ${isPassed ? 'text-green-600' : 'text-amber-600'}`}>
                  ({percentage}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 題目導覽和內容區 */}
      <div className="max-w-7xl mx-auto p-6">
        {/* 題目導覽 */}
        <div className="bg-white rounded-lg border border-stone-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-800">題目導覽</h3>
            <span className="text-sm text-stone-600">
              第 {currentQuestionIndex + 1} 題 / 共 {answers.length} 題
            </span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-15 gap-2">
            {answers.map((answer, index) => (
              <button
                key={answer.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-10 rounded-lg text-sm font-medium transition-all ${
                  currentQuestionIndex === index
                    ? 'bg-amber-600 text-white ring-2 ring-amber-300'
                    : answer.is_correct
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 題目詳情區域 */}
        {currentAnswer && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：題目和答案 */}
            <div className="space-y-6">
              {/* 題目卡片 */}
              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-800">
                    第 {currentQuestionIndex + 1} 題
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentAnswer.is_correct
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {currentAnswer.is_correct ? '✓ 正確' : '✗ 錯誤'}
                  </div>
                </div>

                <div className="prose max-w-none mb-4">
                  <div className="text-stone-700 whitespace-pre-wrap">
                    {currentAnswer.question_content}
                  </div>
                </div>

                <div className="text-sm text-stone-600">
                  <span className="font-medium">分值:</span> {currentAnswer.points} 分
                </div>
              </div>

              {/* 答案卡片 */}
              <div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-stone-800 mb-2">你的答案</h3>
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <div className="text-stone-700 whitespace-pre-wrap">
                      {currentAnswer.user_answer}
                    </div>
                  </div>
                </div>

                {currentAnswer.user_process && (
                  <div>
                    <h3 className="font-semibold text-stone-800 mb-2">解題過程</h3>
                    <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                      <div className="text-stone-700 whitespace-pre-wrap">
                        {currentAnswer.user_process}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-stone-800 mb-2">正確答案</h3>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-green-800 whitespace-pre-wrap">
                      {currentAnswer.correct_answer}
                    </div>
                  </div>
                </div>
              </div>

              {/* 基本反饋 */}
              <div className="bg-white rounded-lg border border-stone-200 p-6">
                <h3 className="font-semibold text-stone-800 mb-3">評語</h3>
                <div className="space-y-3">
                  {currentAnswer.feedback && (
                    <div className="text-stone-700">
                      {currentAnswer.feedback}
                    </div>
                  )}
                  {currentAnswer.explanation && (
                    <div className="text-stone-600 text-sm">
                      {currentAnswer.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：詳細分析 */}
            <div className="lg:sticky lg:top-32 lg:h-fit">
              <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    AI 詳細分析
                  </h3>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {/* 思維過程評分 */}
                  {currentAnswer.thinking_score > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-stone-800">思維過程評分</h4>
                        <span className="text-2xl font-bold text-amber-600">
                          {currentAnswer.thinking_score}/10
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${currentAnswer.thinking_score * 10}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 詳細分析 */}
                  {currentAnswer.detailed_analysis && (
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-2">詳細分析</h4>
                      <div className="text-stone-700 text-sm whitespace-pre-wrap bg-stone-50 rounded-lg p-4 border border-stone-200">
                        {currentAnswer.detailed_analysis}
                      </div>
                    </div>
                  )}

                  {/* 思維過程 */}
                  {currentAnswer.thinking_process && (
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-2">思維過程評估</h4>
                      <div className="text-stone-700 text-sm whitespace-pre-wrap bg-blue-50 rounded-lg p-4 border border-blue-200">
                        {currentAnswer.thinking_process}
                      </div>
                    </div>
                  )}

                  {/* 優化建議 */}
                  {currentAnswer.optimization && (
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-2">優化建議</h4>
                      <div className="text-stone-700 text-sm whitespace-pre-wrap bg-purple-50 rounded-lg p-4 border border-purple-200">
                        {currentAnswer.optimization}
                      </div>
                    </div>
                  )}

                  {/* 建議列表 */}
                  {currentAnswer.suggestions && currentAnswer.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-2">學習建議</h4>
                      <ul className="space-y-2">
                        {currentAnswer.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-stone-700">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 關鍵知識點 */}
                  {currentAnswer.key_points && currentAnswer.key_points.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-2">關鍵知識點</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentAnswer.key_points.map((point, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full"
                          >
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 標準解法步驟 */}
                  {currentAnswer.step_by_step_solution && currentAnswer.step_by_step_solution.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-stone-800 mb-3">標準解法步驟</h4>
                      <div className="space-y-3">
                        {currentAnswer.step_by_step_solution.map((step: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-stone-50 to-stone-100 rounded-lg p-4 border border-stone-200">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {step.step || index + 1}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-stone-800 mb-1">
                                  {step.title}
                                </h5>
                                <p className="text-sm text-stone-700 whitespace-pre-wrap">
                                  {step.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部導覽 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              上一題
            </button>

            <span className="text-stone-600 font-medium">
              {currentQuestionIndex + 1} / {answers.length}
            </span>

            <button
              onClick={() => setCurrentQuestionIndex(Math.min(answers.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === answers.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一題
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

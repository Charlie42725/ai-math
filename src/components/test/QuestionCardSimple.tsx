'use client'

import { useState, useEffect } from 'react';

interface Question {
  id: number;
  title: string;
  content: string;
  type: 'multiple' | 'essay';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface SubmissionResult {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  detailedAnalysis?: string;
  thinkingProcess?: string;
  optimization?: string;
  suggestions?: string[];
}

interface QuestionCardSimpleProps {
  question: Question;
  questionNumber: number;
  currentAnswer: string;
  currentProcess?: string; // 新增：解題過程
  onAnswerSubmit: (questionId: number, answer: string, process?: string, analysisData?: any) => void;
  disabled?: boolean;
  isSubmitted?: boolean;
  result?: SubmissionResult | null;
}

const QuestionCardSimple = ({ 
  question, 
  questionNumber, 
  currentAnswer, 
  currentProcess = '',
  onAnswerSubmit, 
  disabled = false,
  isSubmitted = false,
  result = null
}: QuestionCardSimpleProps) => {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer);
  const [localProcess, setLocalProcess] = useState(currentProcess); // 新增：本地解題過程
  const [isSubmitting, setIsSubmitting] = useState(false); // 新增：提交狀態

  // 當切換題目時，更新本地狀態
  useEffect(() => {
    setLocalAnswer(currentAnswer);
    setLocalProcess(currentProcess);
    setIsSubmitting(false); // 重置提交狀態
  }, [currentAnswer, currentProcess, question.id]); // 監聽題目 ID 變化

  const handleSubmit = async () => {
    if (localAnswer.trim()) {
      setIsSubmitting(true); // 開始提交
      try {
        // 呼叫新的分析 API
        const response = await fetch('/api/analyze-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: question.id,
            userAnswer: localAnswer,
            userProcess: localProcess,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // 將詳細分析結果傳遞給父元件
          onAnswerSubmit(question.id, localAnswer, localProcess, data);
        } else {
          console.error('分析失敗:', data.error);
          // 錯誤時仍然提交基本資料
          onAnswerSubmit(question.id, localAnswer, localProcess);
        }
      } catch (error) {
        console.error('提交失敗:', error);
        // 錯誤時仍然提交基本資料
        onAnswerSubmit(question.id, localAnswer, localProcess);
      } finally {
        setIsSubmitting(false); // 結束提交
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 題目卡片 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* 題目標題區 */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                第 {questionNumber} 題 - {question.title}
              </h2>
              <div className="text-gray-600 text-sm font-medium">
                {question.points} 分 • {question.type === 'multiple' ? '選擇題' : '計算題'}
              </div>
            </div>
          </div>
        </div>

        {/* 題目內容 */}
        <div className="p-6">
          <div className="text-lg text-gray-900 mb-6 leading-relaxed">
            {question.content}
          </div>

          {/* 選項或答案區域 */}
          {question.type === 'multiple' && question.options ? (
            <div className="space-y-6">
              {/* 選項區域 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">請選擇答案</h3>
                {question.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = localAnswer === optionLabel;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-gray-800 bg-gray-50 text-gray-900' 
                          : 'border-gray-300 hover:border-gray-500 text-gray-900'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={optionLabel}
                        checked={isSelected}
                        onChange={(e) => setLocalAnswer(e.target.value)}
                        disabled={disabled}
                        className="sr-only"
                      />
                      <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center text-sm font-bold
                        ${isSelected ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-400 text-gray-900'}
                      `}>
                        {optionLabel}
                      </div>
                      <span className="flex-1">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* 解題思路輸入區域 */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-gray-900">
                    <span className="mr-2">🧠</span>
                    解題思路與過程
                  </h3>
                  <span className="text-gray-900 text-sm">
                    (選填，有助於 AI 分析)
                  </span>
                </div>

                <textarea
                  value={localProcess}
                  onChange={(e) => setLocalProcess(e.target.value)}
                  disabled={disabled}
                  placeholder="請說明你的解題思路，例如：&#10;1. 我先看到這是一元二次方程式...&#10;2. 使用因式分解法...&#10;3. 檢驗答案..."
                  rows={3}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg 
                           text-gray-900 placeholder-gray-900 resize-none focus:outline-none 
                           focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition-all"
                />
                
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-gray-900">
                    字數：{localProcess.length}
                  </span>
                  <span className="text-gray-900">
                    💡 詳細的思考過程有助於獲得更準確的 AI 回饋
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <textarea
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                disabled={disabled}
                placeholder="請在此輸入您的解答過程和答案..."
                className="w-full h-32 p-4 bg-white border border-gray-300 rounded-lg 
                         text-gray-900 placeholder-gray-900 resize-none focus:outline-none 
                         focus:border-gray-500 transition-all duration-200"
              />
            </div>
          )}

          {/* 提交結果顯示 */}
          {result && (
            <div className="space-y-4">
              {/* 基本回饋 */}
              <div className={`p-4 rounded-xl border-2 ${
                result.isCorrect 
                  ? 'border-green-500 bg-green-500/10 text-green-300' 
                  : 'border-red-500 bg-red-500/10 text-red-300'
              }`}>
                <div className="font-semibold mb-2">{result.feedback}</div>
                {result.explanation && (
                  <div className="text-sm opacity-90">
                    <strong>解析：</strong>{result.explanation}
                  </div>
                )}
              </div>

              {/* 詳細分析結果 */}
              {result.detailedAnalysis && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10">
                  <h4 className="font-semibold text-blue-300 mb-2">🔍 詳細分析</h4>
                  <p className="text-sm text-blue-200">{result.detailedAnalysis}</p>
                </div>
              )}

              {/* 思考過程評估 */}
              {result.thinkingProcess && (
                <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10">
                  <h4 className="font-semibold text-purple-300 mb-2">🧠 思考過程評估</h4>
                  <p className="text-sm text-purple-200">{result.thinkingProcess}</p>
                </div>
              )}

              {/* 優化建議 */}
              {result.optimization && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                  <h4 className="font-semibold text-amber-300 mb-2">💡 優化建議</h4>
                  <p className="text-sm text-amber-200">{result.optimization}</p>
                </div>
              )}

              {/* 學習建議 */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                  <h4 className="font-semibold text-emerald-300 mb-2">📚 學習建議</h4>
                  <ul className="text-sm text-emerald-200 space-y-1">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-emerald-400">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 提交按鈕 */}
          {!isSubmitted && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!localAnswer.trim() || disabled || isSubmitting}
                className="bg-gray-800 hover:bg-gray-900 
                         disabled:bg-gray-400 disabled:cursor-not-allowed
                         px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 
                         shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isSubmitting 
                    ? '分析中...' 
                    : (question.type === 'multiple' ? '提交答案與解題過程' : '提交答案')
                  }
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCardSimple;

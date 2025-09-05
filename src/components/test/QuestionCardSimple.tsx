'use client'

import { useState } from 'react';

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
}

interface QuestionCardSimpleProps {
  question: Question;
  questionNumber: number;
  currentAnswer: string;
  currentProcess?: string; // 新增：解題過程
  onAnswerSubmit: (questionId: number, answer: string, process?: string) => void;
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

  const handleSubmit = () => {
    if (localAnswer.trim()) {
      onAnswerSubmit(question.id, localAnswer, localProcess);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 題目卡片 */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        {/* 題目標題區 */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                第 {questionNumber} 題 - {question.title}
              </h2>
              <div className="text-blue-300 text-sm font-medium">
                {question.points} 分 • {question.type === 'multiple' ? '選擇題' : '計算題'}
              </div>
            </div>
          </div>
        </div>

        {/* 題目內容 */}
        <div className="p-6">
          <div className="text-lg text-slate-200 mb-6 leading-relaxed">
            {question.content}
          </div>

          {/* 選項或答案區域 */}
          {question.type === 'multiple' && question.options ? (
            <div className="space-y-6">
              {/* 選項區域 */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white mb-4">請選擇答案</h3>
                {question.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = localAnswer === optionLabel;
                  
                  return (
                    <label
                      key={index}
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-500/10 text-blue-300' 
                          : 'border-slate-600 hover:border-slate-500 text-slate-300'
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
                        ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-500'}
                      `}>
                        {optionLabel}
                      </div>
                      <span className="flex-1">{option}</span>
                    </label>
                  );
                })}
              </div>

              {/* 解題思路輸入區域 */}
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-white">
                    <span className="mr-2">🧠</span>
                    解題思路與過程
                  </h3>
                  <span className="text-slate-400 text-sm">
                    (選填，有助於 AI 分析)
                  </span>
                </div>

                <textarea
                  value={localProcess}
                  onChange={(e) => setLocalProcess(e.target.value)}
                  disabled={disabled}
                  placeholder="請說明你的解題思路，例如：&#10;1. 我先看到這是一元二次方程式...&#10;2. 使用因式分解法...&#10;3. 檢驗答案..."
                  rows={3}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg 
                           text-slate-200 placeholder-slate-400 resize-none focus:outline-none 
                           focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-400">
                    字數：{localProcess.length}
                  </span>
                  <span className="text-slate-400">
                    💡 詳細思考過程有助於獲得更準確回饋
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
                className="w-full h-32 p-4 bg-slate-700/50 border border-slate-600 rounded-xl 
                         text-white placeholder-slate-400 resize-none focus:outline-none 
                         focus:border-blue-500 focus:bg-slate-700/70 transition-all duration-200"
              />
            </div>
          )}

          {/* 提交結果顯示 */}
          {result && (
            <div className={`mb-6 p-4 rounded-xl border-2 ${
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
          )}

          {/* 提交按鈕 */}
          {!isSubmitted && (
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={!localAnswer.trim() || disabled}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed
                         px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 
                         shadow-md hover:shadow-blue-500/25 hover:scale-105"
              >
                {question.type === 'multiple' ? '提交答案與解題過程' : '提交答案'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCardSimple;

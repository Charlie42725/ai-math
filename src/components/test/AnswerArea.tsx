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
  image?: string;
}

interface AnswerAreaProps {
  question: Question;
  currentAnswer: string;
  currentProcess?: string; // 新增：解題過程
  onAnswerSubmit: (questionId: number, answer: string, process?: string, analysisData?: any) => void;
  disabled?: boolean;
}

export default function AnswerArea({ 
  question, 
  currentAnswer, 
  currentProcess = '',
  onAnswerSubmit, 
  disabled = false 
}: AnswerAreaProps) {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer);
  const [localProcess, setLocalProcess] = useState(currentProcess); // 新增：本地解題過程
  const [isSubmitted, setIsSubmitted] = useState(!!currentAnswer);
  const [isSubmitting, setIsSubmitting] = useState(false); // 新增：提交狀態

  // 當切換題目時，更新本地狀態
  useEffect(() => {
    setLocalAnswer(currentAnswer);
    setLocalProcess(currentProcess);
    setIsSubmitted(!!currentAnswer);
    setIsSubmitting(false); // 重置提交狀態
  }, [currentAnswer, currentProcess, question.id]); // 監聽題目 ID 變化

  const handleSubmit = async () => {
    if (localAnswer.trim()) {
      setIsSubmitting(true); // 開始提交，顯示載入狀態

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
        
        setIsSubmitted(true);
      } catch (error) {
        console.error('提交失敗:', error);
        // 錯誤時仍然提交基本資料
        onAnswerSubmit(question.id, localAnswer, localProcess);
        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false); // 結束提交，隱藏載入狀態
      }
    }
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  // 選擇題組件
  if (question.type === 'multiple' && question.options) {
    return (
      <div className="space-y-6">
        {/* 選項區域 */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">請選擇答案</h3>
            {isSubmitted && (
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm">✓ 已提交</span>
                {!disabled && (
                  <button
                    onClick={handleEdit}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    修改答案
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const optionLetter = String.fromCharCode(65 + index);
              const isSelected = localAnswer === optionLetter;
              
              return (
                <label
                  key={index}
                  className={`
                    flex items-start space-x-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-slate-600/50 bg-slate-700/20 hover:border-slate-500/70 hover:bg-slate-700/30'
                    }
                    ${disabled || isSubmitted ? 'cursor-not-allowed opacity-70' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={optionLetter}
                    checked={isSelected}
                    onChange={(e) => !disabled && !isSubmitted && setLocalAnswer(e.target.value)}
                    disabled={disabled || isSubmitted}
                    className="sr-only"
                  />
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 font-medium text-sm transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : 'border-slate-500 text-slate-400'
                    }
                  `}>
                    {optionLetter}
                  </div>
                  <span className="text-slate-200 flex-1 leading-relaxed">
                    {option}
                  </span>
                  {isSelected && (
                    <div className="text-blue-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* 解題思路輸入區域 */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">
              <span className="mr-2">🧠</span>
              解題思路與過程
            </h3>
            <span className="text-slate-400 text-sm">
              (選填，有助於 AI 分析你的思考方式)
            </span>
          </div>

          <div className="space-y-4">
            <textarea
              value={localProcess}
              onChange={(e) => !disabled && !isSubmitted && setLocalProcess(e.target.value)}
              disabled={disabled || isSubmitted}
              placeholder="請說明你的解題思路和計算過程，例如：&#10;1. 我先看到這是一元二次方程式...&#10;2. 使用因式分解法...&#10;3. 檢驗答案..."
              rows={4}
              className={`
                w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl 
                text-slate-200 placeholder-slate-400 resize-none focus:outline-none 
                focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all
                ${disabled || isSubmitted ? 'cursor-not-allowed opacity-70' : ''}
              `}
            />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                字數：{localProcess.length}
              </span>
              <span className="text-slate-400">
                💡 詳細的思考過程有助於獲得更準確的 AI 回饋
              </span>
            </div>
          </div>
        </div>

        {/* 提交按鈕 */}
        {!isSubmitted && !disabled && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!localAnswer || isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                         disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed
                         text-white font-medium rounded-xl transition-all duration-200
                         shadow-lg hover:shadow-blue-500/25 text-lg flex items-center space-x-2"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{isSubmitting ? '分析中...' : '提交答案與解題過程'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 開放題組件
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">請輸入您的答案</h3>
        {isSubmitted && (
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-sm">✓ 已提交</span>
            {!disabled && (
              <button
                onClick={handleEdit}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                修改答案
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <textarea
          value={localAnswer}
          onChange={(e) => !disabled && !isSubmitted && setLocalAnswer(e.target.value)}
          disabled={disabled || isSubmitted}
          placeholder="請在此輸入您的答案..."
          rows={6}
          className={`
            w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl 
            text-slate-200 placeholder-slate-400 resize-none focus:outline-none 
            focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all
            ${disabled || isSubmitted ? 'cursor-not-allowed opacity-70' : ''}
          `}
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            字數：{localAnswer.length}
          </span>
          <span className="text-slate-400">
            建議詳細說明解題過程
          </span>
        </div>
      </div>

      {/* 提交按鈕 */}
      {!isSubmitted && !disabled && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!localAnswer.trim() || isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                       disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed
                       text-white font-medium rounded-xl transition-all duration-200
                       shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSubmitting ? '分析中...' : '提交答案'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

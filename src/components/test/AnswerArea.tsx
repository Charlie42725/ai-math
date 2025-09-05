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
  image?: string;
}

interface AnswerAreaProps {
  question: Question;
  currentAnswer: string;
  onAnswerSubmit: (questionId: number, answer: string) => void;
  disabled?: boolean;
}

export default function AnswerArea({ 
  question, 
  currentAnswer, 
  onAnswerSubmit, 
  disabled = false 
}: AnswerAreaProps) {
  const [localAnswer, setLocalAnswer] = useState(currentAnswer);
  const [isSubmitted, setIsSubmitted] = useState(!!currentAnswer);

  const handleSubmit = () => {
    if (localAnswer.trim()) {
      onAnswerSubmit(question.id, localAnswer);
      setIsSubmitted(true);
    }
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  // 選擇題組件
  if (question.type === 'multiple' && question.options) {
    return (
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

        {/* 提交按鈕 */}
        {!isSubmitted && !disabled && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!localAnswer}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                         disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed
                         text-white font-medium rounded-xl transition-all duration-200
                         shadow-lg hover:shadow-blue-500/25"
            >
              提交答案
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
            disabled={!localAnswer.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                       disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed
                       text-white font-medium rounded-xl transition-all duration-200
                       shadow-lg hover:shadow-blue-500/25"
          >
            提交答案
          </button>
        </div>
      )}
    </div>
  );
}

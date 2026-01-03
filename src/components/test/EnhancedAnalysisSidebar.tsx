'use client'

import { useState } from 'react';

interface StepSolution {
  step: number;
  title: string;
  content: string;
}

interface SubmissionResult {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  detailedAnalysis?: string;
  thinkingProcess?: string;
  thinkingScore?: number;
  optimization?: string;
  suggestions?: string[];
  stepByStepSolution?: StepSolution[];
  keyPoints?: string[];
}

interface EnhancedAnalysisSidebarProps {
  result: SubmissionResult | null;
  isVisible: boolean;
  onToggle: () => void;
  userAnswer?: string;
  correctAnswer?: string;
  options?: { [key: string]: string };
}

const EnhancedAnalysisSidebar = ({
  result,
  isVisible,
  onToggle,
  userAnswer,
  correctAnswer,
  options
}: EnhancedAnalysisSidebarProps) => {
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(true);
  const [revealStage, setRevealStage] = useState(2); // 直接顯示完整解析

  // 調試：打印接收到的 result
  console.log('[EnhancedAnalysisSidebar] Result:', result);
  console.log('[EnhancedAnalysisSidebar] detailedAnalysis:', result?.detailedAnalysis);
  console.log('[EnhancedAnalysisSidebar] explanation:', result?.explanation);
  console.log('[EnhancedAnalysisSidebar] stepByStepSolution:', result?.stepByStepSolution);

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < score ? 'text-amber-400' : 'text-stone-400'}`}>
        ⭐
      </span>
    ));
  };

  const handleRevealAnswer = () => {
    setRevealStage(1);
  };

  const handleShowAnalysis = () => {
    setRevealStage(2);
  };

  if (!result) {
    return (
      <div className={`
        fixed inset-0 lg:top-6 lg:right-6 lg:bottom-24 lg:inset-auto
        w-full lg:w-1/2 bg-stone-50 backdrop-blur-sm border-0 lg:border border-stone-200
        transform transition-transform duration-300 z-40 shadow-2xl lg:rounded-2xl overflow-hidden
        flex flex-col
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex-shrink-0 p-6 border-b border-stone-200 bg-stone-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-stone-800 flex items-center space-x-2">
              <span>📊</span>
              <span>分析結果</span>
            </h3>
            <button
              onClick={onToggle}
              className="text-stone-500 hover:text-stone-700 transition-colors p-1 hover:bg-stone-200 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 text-center text-stone-700 flex flex-col items-center justify-center h-full">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xl mb-2">提交答案後</p>
            <p className="text-lg text-stone-600">分析結果將在此顯示</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      fixed inset-0 lg:top-6 lg:right-6 lg:bottom-24 lg:inset-auto
      w-full lg:w-1/2 bg-white backdrop-blur-sm border-0 lg:border border-stone-200
      transform transition-transform duration-300 z-40 shadow-2xl lg:rounded-2xl overflow-hidden
      flex flex-col
      ${isVisible ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* 標題欄 */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 border-b border-stone-200 bg-stone-50 animate-slide-in-right">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800 flex items-center space-x-1.5 sm:space-x-2">
            <span className="text-xl sm:text-2xl">📊</span>
            <span>分析結果</span>
          </h3>
          <button
            onClick={onToggle}
            className="text-stone-500 hover:text-stone-700 transition-colors p-2 hover:bg-stone-100 rounded touch-manipulation"
            aria-label="關閉側邊欄"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 引導說明 */}
        <div className="flex items-start gap-2 bg-white px-2.5 sm:px-3 py-2 rounded-lg text-[10px] sm:text-xs text-stone-600 border border-stone-200">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-stone-800 mb-0.5 sm:mb-1">💡 閱讀指南</p>
            <ul className="space-y-0.5 sm:space-y-1">
              <li>• 先看答案正確性與評分</li>
              <li>• 理解關鍵知識點</li>
              <li>• 學習詳細解題步驟</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 分析內容 - 可滾動區域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d6d3d1 #fafaf9' }}>
        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">

          {/* 第一階段：答題結果 */}
          {revealStage === 0 && (
            <div className="text-center space-y-6">
              <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                <h3 className="text-lg font-semibold text-stone-700 mb-4">已完成答題</h3>
                <p className="text-stone-600 mb-6">準備好查看結果了嗎？</p>
                <button
                  onClick={handleRevealAnswer}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                >
                  🎯 揭曉正解
                </button>
              </div>
            </div>
          )}

          {/* 第二階段：顯示正確性和答案對比 */}
          {revealStage >= 1 && (
            <>
              {/* 答案正確性 - 大字體 + icon */}
              <div className={`text-center p-4 sm:p-5 lg:p-6 rounded-xl animate-fade-in ${
                result.isCorrect
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg'
                  : 'bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 shadow-lg'
              }`}>
                <div className="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-bounce-subtle">
                  {result.isCorrect ? '✅' : '❌'}
                </div>
                <div className={`text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2 ${
                  result.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.isCorrect ? '答案正確！' : '答案錯誤'}
                </div>
                <p className={`text-xs sm:text-sm ${
                  result.isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.isCorrect ? '很棒！繼續保持' : '沒關係，從錯誤中學習'}
                </p>
              </div>

              {/* 答案對比 */}
              {userAnswer && correctAnswer && options && (
                <div className="grid grid-cols-1 gap-2.5 sm:gap-4">
                  <div className={`p-3 sm:p-4 rounded-lg border-2 ${
                    result.isCorrect
                      ? 'border-green-300 bg-green-50'
                      : 'border-red-300 bg-red-50'
                  }`}>
                    <h4 className={`font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base ${
                      result.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      你的答案
                    </h4>
                    <p className="text-gray-800 text-xs sm:text-sm">
                      <span className="font-bold">{userAnswer}</span>: {options[userAnswer]}
                    </p>
                  </div>

                  {!result.isCorrect && (
                    <div className="p-3 sm:p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <h4 className="text-green-700 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">正確答案</h4>
                      <p className="text-gray-800 text-xs sm:text-sm">
                        <span className="font-bold">{correctAnswer}</span>: {options[correctAnswer]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 思考過程評分 */}
              {result.thinkingScore && (
                <div className="p-3 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-md animate-fade-in">
                  <h4 className="text-amber-800 font-semibold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <span className="text-lg sm:text-xl">🧠</span>
                    <span>思考過程評分</span>
                  </h4>
                  <div className="flex items-center justify-center space-x-0.5 sm:space-x-1 mb-2 sm:mb-3 bg-white rounded-lg py-2 sm:py-3 border border-amber-100">
                    {renderStars(result.thinkingScore)}
                  </div>
                  <div className="text-center mb-2 sm:mb-3">
                    <span className="text-xl sm:text-2xl font-bold text-amber-700">
                      {result.thinkingScore}/5
                    </span>
                    <span className="text-xs sm:text-sm text-amber-600 ml-1.5 sm:ml-2">
                      {result.thinkingScore >= 4 ? '優秀' : result.thinkingScore >= 3 ? '良好' : '需加強'}
                    </span>
                  </div>
                  {result.thinkingProcess && (
                    <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-amber-100">
                      <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">{result.thinkingProcess}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 關鍵知識點 */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="p-3 sm:p-4 bg-stone-50 border-2 border-stone-200 rounded-xl shadow-md animate-fade-in">
                  <h4 className="text-stone-800 font-semibold mb-2.5 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <span className="text-lg sm:text-xl">🎯</span>
                    <span>關鍵知識點</span>
                    <span className="ml-auto text-[10px] sm:text-xs bg-amber-100 text-amber-700 px-2 py-0.5 sm:py-1 rounded-full">
                      {result.keyPoints.length} 個重點
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {result.keyPoints.map((point, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white border-2 border-amber-200 text-stone-800 rounded-full text-xs sm:text-sm font-medium hover:bg-amber-50 transition-colors cursor-default shadow-sm"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 查看詳細解析按鈕 */}
              {revealStage === 1 && (
                <div className="text-center">
                  <button
                    onClick={handleShowAnalysis}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                  >
                    📚 查看詳細解析
                  </button>
                </div>
              )}
            </>
          )}

          {/* 第三階段：詳細解析 */}
          {revealStage >= 2 && (
            <>
              {/* 步驟式解題 */}
              {result.stepByStepSolution && result.stepByStepSolution.length > 0 && (
                <div className="p-3 sm:p-4 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-md animate-fade-in">
                  <h4 className="text-amber-800 font-semibold mb-2.5 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <span className="text-lg sm:text-xl">📝</span>
                    <span>解題步驟</span>
                    <span className="ml-auto text-[10px] sm:text-xs bg-amber-200 text-amber-700 px-2 py-0.5 sm:py-1 rounded-full">
                      共 {result.stepByStepSolution.length} 步
                    </span>
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {result.stepByStepSolution.map((step, index) => (
                      <div key={index} className="flex space-x-2 sm:space-x-3 bg-white rounded-lg p-2.5 sm:p-3 border border-amber-100 hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-stone-800 mb-1 sm:mb-1.5 text-xs sm:text-sm">{step.title}</h5>
                          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 詳細分析（可收合） */}
              {(result.detailedAnalysis || result.explanation) && (
                <div className="border border-stone-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                    className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between"
                  >
                    <h4 className="font-semibold text-stone-800">🔍 詳細分析</h4>
                    <svg
                      className={`w-5 h-5 transition-transform ${showDetailedAnalysis ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showDetailedAnalysis && (
                    <div className="p-4 border-t border-stone-200 bg-white">
                      <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                        {result.detailedAnalysis || result.explanation || '暫無詳細分析'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 改進建議 */}
              {result.optimization && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-amber-800 font-semibold mb-2">💡 改進建議</h4>
                  <p className="text-stone-700">{result.optimization}</p>
                </div>
              )}

              {/* 學習建議 */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-green-800 font-semibold mb-3">📚 學習建議</h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisSidebar;

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
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [revealStage, setRevealStage] = useState(0); // 0: 隱藏, 1: 顯示結果, 2: 顯示解析

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-xl ${i < score ? 'text-yellow-400' : 'text-gray-600'}`}>
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
        fixed top-6 right-6 bottom-24 w-1/2 bg-slate-50 backdrop-blur-sm border border-gray-200 
        transform transition-transform duration-300 z-40 shadow-2xl rounded-2xl overflow-hidden
        flex flex-col
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <span>🤖</span>
              <span>AI 分析結果</span>
            </h3>
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xl mb-2">提交答案後</p>
            <p className="text-lg text-gray-400">AI 分析結果將在此顯示</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      fixed top-6 right-6 bottom-24 w-1/2 bg-white backdrop-blur-sm border border-gray-200 
      transform transition-transform duration-300 z-40 shadow-2xl rounded-2xl overflow-hidden
      flex flex-col
      ${isVisible ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* 標題欄 */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>🤖</span>
            <span>AI 分析結果</span>
          </h3>
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 分析內容 - 可滾動區域 */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
        <div className="p-6 space-y-6">
          
          {/* 第一階段：答題結果 */}
          {revealStage === 0 && (
            <div className="text-center space-y-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">已完成答題</h3>
                <p className="text-gray-600 mb-6">準備好查看結果了嗎？</p>
                <button
                  onClick={handleRevealAnswer}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
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
              <div className={`text-center p-6 rounded-xl ${
                result.isCorrect 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="text-6xl mb-2">
                  {result.isCorrect ? '✅' : '❌'}
                </div>
                <div className={`text-2xl font-bold ${
                  result.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.isCorrect ? '答案正確！' : '答案錯誤'}
                </div>
              </div>

              {/* 答案對比 */}
              {userAnswer && correctAnswer && options && (
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    result.isCorrect 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-red-300 bg-red-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      result.isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      你的答案
                    </h4>
                    <p className="text-gray-800">
                      <span className="font-bold">{userAnswer}</span>: {options[userAnswer]}
                    </p>
                  </div>
                  
                  {!result.isCorrect && (
                    <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                      <h4 className="text-green-700 font-semibold mb-2">正確答案</h4>
                      <p className="text-gray-800">
                        <span className="font-bold">{correctAnswer}</span>: {options[correctAnswer]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 思考過程評分 */}
              {result.thinkingScore && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-yellow-800 font-semibold mb-3 flex items-center">
                    🧠 思考過程評分
                  </h4>
                  <div className="flex items-center space-x-2">
                    {renderStars(result.thinkingScore)}
                    <span className="text-yellow-700 font-medium ml-2">
                      {result.thinkingScore}/5 分
                    </span>
                  </div>
                  {result.thinkingProcess && (
                    <p className="text-gray-700 mt-3 text-sm">{result.thinkingProcess}</p>
                  )}
                </div>
              )}

              {/* 關鍵知識點 */}
              {result.keyPoints && result.keyPoints.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-blue-800 font-semibold mb-3">🎯 關鍵知識點</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keyPoints.map((point, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
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
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors"
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
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-gray-800 font-semibold mb-4 flex items-center">
                    📝 解題步驟
                  </h4>
                  <div className="space-y-4">
                    {result.stepByStepSolution.map((step, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">{step.title}</h5>
                          <p className="text-gray-600 text-sm">{step.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 詳細分析（可收合） */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                  className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <h4 className="font-semibold text-gray-800">🔍 詳細分析</h4>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showDetailedAnalysis ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showDetailedAnalysis && result.detailedAnalysis && (
                  <div className="p-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{result.detailedAnalysis}</p>
                  </div>
                )}
              </div>

              {/* 改進建議 */}
              {result.optimization && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="text-orange-800 font-semibold mb-2">💡 改進建議</h4>
                  <p className="text-gray-700">{result.optimization}</p>
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
      
      {/* 底部操作 */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <button
            onClick={() => setRevealStage(2)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            跳過動畫，直接查看完整分析
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAnalysisSidebar;

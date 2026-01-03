'use client'

import { useState, useEffect } from 'react';
import { getAvailableGrades, getAvailableUnits, QuestionSource } from '../../test/questionBank';

interface ExamSettingsProps {
  onStartExam: (questionCount: number, settings?: ExamSettings) => void;
}

interface ExamSettings {
  mode: 'random' | 'grade' | 'unit' | 'mixed';
  selectedGrade?: string;
  selectedUnit?: string;
  questionSource?: QuestionSource;
}

const ExamSettings = ({ onStartExam }: ExamSettingsProps) => {
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [examMode, setExamMode] = useState<'random' | 'grade' | 'unit' | 'mixed'>('mixed');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [questionSource, setQuestionSource] = useState<QuestionSource>('historical');
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // 載入可用的年級和單元（根據選擇的題目來源）
    try {
      const grades = getAvailableGrades(questionSource);
      const units = getAvailableUnits(questionSource);
      setAvailableGrades(grades);
      setAvailableUnits(units);
      // 重置選擇的年級和單元
      setSelectedGrade('');
      setSelectedUnit('');
    } catch (error) {
      console.error('載入年級和單元失敗:', error);
    }
  }, [questionSource]);

  const questionOptions = [
    { count: 5, label: '5題 - 快速練習', duration: '15分鐘', description: '適合課間練習' },
    { count: 10, label: '10題 - 標準測驗', duration: '30分鐘', description: '完整單元複習' },
    { count: 15, label: '15題 - 進階練習', duration: '45分鐘', description: '深度理解檢測' },
    { count: 20, label: '20題 - 完整會考', duration: '60分鐘', description: '仿真會考體驗' },
  ];

  const modeOptions = [
    { 
      mode: 'mixed' as const, 
      label: '混合出題', 
      description: '從各年級各單元平均選題', 
      icon: '🎲' 
    },
    { 
      mode: 'random' as const, 
      label: '隨機出題', 
      description: '完全隨機選擇題目', 
      icon: '🔀' 
    },
    { 
      mode: 'grade' as const, 
      label: '指定年級', 
      description: '只從特定年級選題', 
      icon: '📚' 
    },
    { 
      mode: 'unit' as const, 
      label: '指定單元', 
      description: '只從特定單元選題', 
      icon: '📖' 
    },
  ];

  const handleStartExam = () => {
    setIsLoading(true);
    const settings: ExamSettings = {
      mode: examMode,
      selectedGrade: selectedGrade || undefined,
      selectedUnit: selectedUnit || undefined,
      questionSource: questionSource,
    };

    // 延遲以顯示loading動畫
    setTimeout(() => {
      onStartExam(selectedCount, settings);
    }, 800);
  };

  // 一键开始函数
  const quickStart = (count: number, mode: 'random' | 'grade' | 'unit' | 'mixed', grade?: string) => {
    setIsLoading(true);
    const settings: ExamSettings = {
      mode,
      selectedGrade: grade,
      questionSource: 'historical',
    };

    // 延遲以顯示loading動畫
    setTimeout(() => {
      onStartExam(count, settings);
    }, 800);
  };

  const sourceOptions = [
    {
      value: 'historical' as const,
      label: '歷屆會考題',
      description: '真實會考題目，檢驗實戰能力',
      icon: '📚',
      badge: '真題'
    },
    {
      value: 'simulated' as const,
      label: 'AI 模擬題',
      description: 'AI 生成的模擬題目，補充練習',
      icon: '🤖',
      badge: '模擬'
    },
    {
      value: 'all' as const,
      label: '混合題庫',
      description: '歷屆真題與 AI 模擬題混合',
      icon: '🎯',
      badge: '混合'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 sm:p-6 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-2xl max-w-md mx-4 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-pulse">📚</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-2">準備題目中</h3>
            <p className="text-stone-600 mb-4">正在為您精選題目...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full">
        {/* 標題區域 */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 px-2">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl mb-4 sm:mb-5 lg:mb-6 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-800 mb-3 sm:mb-4">
            開始你的練習
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-stone-600 mb-4 sm:mb-5 max-w-2xl mx-auto">
            點擊下方卡片立即開始，或自訂設定調整難度
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-sm sm:text-base border-2 border-amber-200 shadow-sm">
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">新手推薦：會考衝刺</span>
          </div>
        </div>

        {/* 一鍵開始區域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {/* 會考衝刺 - 推薦 */}
          <button
            onClick={() => quickStart(10, 'mixed')}
            className="group relative bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:via-amber-700 hover:to-orange-700 text-white p-6 sm:p-7 lg:p-9 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 touch-manipulation border-2 border-amber-400"
          >
            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              ⭐ 推薦
            </div>
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 lg:mb-5 group-hover:scale-110 transition-transform duration-300">📚</div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 drop-shadow-sm">會考衝刺</h3>
            <div className="flex items-center justify-center gap-2 text-amber-50 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4">
              <span className="font-semibold">10 題</span>
              <span>·</span>
              <span className="font-semibold">30 分鐘</span>
            </div>
            <div className="text-xs sm:text-sm lg:text-base text-white bg-white/20 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-medium">
              ✨ 全面檢測，穩紮穩打
            </div>
            <div className="mt-3 text-xs text-amber-100 opacity-80">
              點擊立即開始 →
            </div>
          </button>

          {/* 基礎鞏固 */}
          <button
            onClick={() => quickStart(8, 'grade', '七年級')}
            className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 text-stone-800 p-6 sm:p-7 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-stone-200 hover:border-blue-300 touch-manipulation transform hover:scale-105"
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">📖</div>
            <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-2 text-stone-800">基礎鞏固</h3>
            <div className="flex items-center justify-center gap-2 text-stone-600 text-sm sm:text-base mb-3">
              <span className="font-semibold">8 題</span>
              <span>·</span>
              <span className="font-semibold">24 分鐘</span>
            </div>
            <div className="text-xs sm:text-sm text-stone-700 bg-stone-100 group-hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors">
              循序漸進，打好基礎
            </div>
          </button>

          {/* 快速練習 */}
          <button
            onClick={() => quickStart(5, 'random')}
            className="group relative bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 text-stone-800 p-6 sm:p-7 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-stone-200 hover:border-green-300 touch-manipulation transform hover:scale-105"
          >
            <div className="text-4xl sm:text-5xl lg:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-2 text-stone-800">快速練習</h3>
            <div className="flex items-center justify-center gap-2 text-stone-600 text-sm sm:text-base mb-3">
              <span className="font-semibold">5 題</span>
              <span>·</span>
              <span className="font-semibold">15 分鐘</span>
            </div>
            <div className="text-xs sm:text-sm text-stone-700 bg-stone-100 group-hover:bg-green-100 rounded-lg px-3 py-2 transition-colors">
              輕鬆練習，保持手感
            </div>
          </button>
        </div>

        {/* 自訂設定 - 可折疊 */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-200">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left hover:bg-stone-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-100 group-hover:bg-stone-200 rounded-xl flex items-center justify-center transition-colors">
                <span className="text-xl sm:text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800">需要更多選項？</h3>
                <p className="text-xs sm:text-sm text-gray-500">自訂題數、年級、難度</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-stone-500 font-medium hidden sm:inline">
                {showAdvanced ? '收起' : '展開'}
              </span>
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              <div className="space-y-6">
                {/* 題目來源選擇 */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📖 題目來源</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sourceOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => setQuestionSource(option.value)}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                  ${questionSource === option.value
                    ? 'border-slate-700 bg-slate-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <span className="text-3xl">{option.icon}</span>
                  <div className="w-full">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <h3 className={`font-bold ${questionSource === option.value ? 'text-gray-800' : 'text-gray-700'}`}>
                        {option.label}
                      </h3>
                      <span className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${questionSource === option.value
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-600'
                        }
                      `}>
                        {option.badge}
                      </span>
                    </div>
                    <p className={`text-sm ${questionSource === option.value ? 'text-gray-600' : 'text-gray-500'}`}>
                      {option.description}
                    </p>
                  </div>
                  {questionSource === option.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
                </div>

                {/* 出題模式和題目數量 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 左側：出題模式選擇 */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">🎯 出題模式</h2>

                    <div className="space-y-3">
                      {modeOptions.map((option) => (
                        <div
                          key={option.mode}
                          onClick={() => setExamMode(option.mode)}
                          className={`
                            p-3 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${examMode === option.mode
                              ? 'border-slate-700 bg-slate-50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{option.icon}</span>
                            <div className="flex-1">
                              <h3 className={`font-bold text-sm ${examMode === option.mode ? 'text-gray-800' : 'text-gray-700'}`}>
                                {option.label}
                              </h3>
                              <p className={`text-xs ${examMode === option.mode ? 'text-gray-600' : 'text-gray-500'}`}>
                                {option.description}
                              </p>
                            </div>
                            {examMode === option.mode && (
                              <div className="w-4 h-4 bg-slate-700 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 年級選擇 */}
                    {examMode === 'grade' && (
                      <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                        <h3 className="text-gray-800 font-bold mb-2 text-sm">選擇年級</h3>
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="w-full p-2 bg-slate-50 text-gray-800 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none text-sm"
                        >
                          <option value="">請選擇年級</option>
                          {availableGrades.map((grade) => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* 單元選擇 */}
                    {examMode === 'unit' && (
                      <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                        <h3 className="text-gray-800 font-bold mb-2 text-sm">選擇單元</h3>
                        <select
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnit(e.target.value)}
                          className="w-full p-2 bg-slate-50 text-gray-800 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none text-sm"
                        >
                          <option value="">請選擇單元</option>
                          {availableUnits.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 右側：題目數量選擇 */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">📊 題目數量</h2>

                    <div className="space-y-3">
                      {questionOptions.map((option) => (
                        <div
                          key={option.count}
                          onClick={() => setSelectedCount(option.count)}
                          className={`
                            p-3 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${selectedCount === option.count
                              ? 'border-slate-700 bg-slate-50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`
                              flex items-center justify-center w-10 h-10 rounded-lg font-bold text-base
                              ${selectedCount === option.count
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-100 text-slate-600'
                              }
                            `}>
                              {option.count}
                            </div>

                            <div className="flex-1">
                              <h3 className={`font-bold text-sm ${selectedCount === option.count ? 'text-gray-800' : 'text-gray-700'}`}>
                                {option.label}
                              </h3>
                              <div className="flex items-center space-x-2 text-xs">
                                <svg className={`w-3 h-3 ${selectedCount === option.count ? 'text-slate-700' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className={selectedCount === option.count ? 'text-slate-700' : 'text-slate-600'}>
                                  {option.duration}
                                </span>
                              </div>
                            </div>

                            {selectedCount === option.count && (
                              <div className="w-4 h-4 bg-slate-700 rounded-full flex items-center justify-center">
                                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 開始按鈕 */}
                <div className="text-center mt-6">
                  <button
                    onClick={handleStartExam}
                    disabled={
                      (examMode === 'grade' && !selectedGrade) ||
                      (examMode === 'unit' && !selectedUnit)
                    }
                    className="px-10 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                               text-white font-bold text-base rounded-xl transition-all duration-300 transform hover:scale-105
                               shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-300
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    🚀 開始自訂測驗 ({selectedCount} 題)
                  </button>

                  <p className="text-gray-500 text-xs mt-3">
                    💡 每題提交後將立即顯示 AI 分析
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSettings;

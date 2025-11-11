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
    const settings: ExamSettings = {
      mode: examMode,
      selectedGrade: selectedGrade || undefined,
      selectedUnit: selectedUnit || undefined,
      questionSource: questionSource,
    };
    onStartExam(selectedCount, settings);
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* 標題區域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-200 text-slate-700 rounded-2xl mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📝 會考數學模擬測驗</h1>
          <p className="text-xl text-gray-600">設定您的專屬測驗</p>
        </div>

        {/* 題目來源選擇 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">📖 題目來源</h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：出題模式選擇 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 出題模式</h2>

            <div className="space-y-3">
              {modeOptions.map((option) => (
                <div
                  key={option.mode}
                  onClick={() => setExamMode(option.mode)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${examMode === option.mode
                      ? 'border-slate-700 bg-slate-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold ${examMode === option.mode ? 'text-gray-800' : 'text-gray-700'}`}>
                        {option.label}
                      </h3>
                      <p className={`text-sm ${examMode === option.mode ? 'text-gray-600' : 'text-gray-500'}`}>
                        {option.description}
                      </p>
                    </div>
                    {examMode === option.mode && (
                      <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <h3 className="text-gray-800 font-bold mb-3">選擇年級</h3>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-3 bg-slate-50 text-gray-800 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none"
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
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <h3 className="text-gray-800 font-bold mb-3">選擇單元</h3>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-3 bg-slate-50 text-gray-800 rounded-lg border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 focus:outline-none"
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 題目數量</h2>

            <div className="space-y-4">
              {questionOptions.map((option) => (
                <div
                  key={option.count}
                  onClick={() => setSelectedCount(option.count)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${selectedCount === option.count
                      ? 'border-slate-700 bg-slate-50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg
                      ${selectedCount === option.count
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-600'
                      }
                    `}>
                      {option.count}
                    </div>

                    <div className="flex-1">
                      <h3 className={`font-bold ${selectedCount === option.count ? 'text-gray-800' : 'text-gray-700'}`}>
                        {option.label}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className={`w-4 h-4 ${selectedCount === option.count ? 'text-slate-700' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={selectedCount === option.count ? 'text-slate-700' : 'text-slate-600'}>
                          預計時間：{option.duration}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${selectedCount === option.count ? 'text-gray-600' : 'text-gray-500'}`}>
                        {option.description}
                      </p>
                    </div>

                    {selectedCount === option.count && (
                      <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center">
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
        </div>

        {/* 開始按鈕 */}
        <div className="text-center mt-8">
          <button
            onClick={handleStartExam}
            disabled={
              (examMode === 'grade' && !selectedGrade) ||
              (examMode === 'unit' && !selectedUnit)
            }
            className="px-12 py-4 bg-slate-700 hover:bg-slate-800
                       text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105
                       shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            🚀 開始測驗 ({selectedCount} 題)
          </button>

          <p className="text-gray-600 text-sm mt-4">
            💡 每題提交後將立即顯示結果和詳細解析
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamSettings;

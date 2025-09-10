'use client'

import { useState, useEffect } from 'react';
import { getAvailableGrades, getAvailableUnits } from '../../test/questionBank';

interface ExamSettingsProps {
  onStartExam: (questionCount: number, settings?: ExamSettings) => void;
}

interface ExamSettings {
  mode: 'random' | 'grade' | 'unit' | 'mixed';
  selectedGrade?: string;
  selectedUnit?: string;
}

const ExamSettings = ({ onStartExam }: ExamSettingsProps) => {
  const [selectedCount, setSelectedCount] = useState<number>(10);
  const [examMode, setExamMode] = useState<'random' | 'grade' | 'unit' | 'mixed'>('mixed');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  useEffect(() => {
    // 載入可用的年級和單元
    try {
      const grades = getAvailableGrades();
      const units = getAvailableUnits();
      setAvailableGrades(grades);
      setAvailableUnits(units);
    } catch (error) {
      console.error('載入年級和單元失敗:', error);
    }
  }, []);

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
    };
    onStartExam(selectedCount, settings);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* 標題區域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 text-blue-400 rounded-2xl mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">📝 會考數學模擬測驗</h1>
          <p className="text-xl text-slate-400">設定您的專屬測驗</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：出題模式選擇 */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">🎯 出題模式</h2>
            
            <div className="space-y-3">
              {modeOptions.map((option) => (
                <div
                  key={option.mode}
                  onClick={() => setExamMode(option.mode)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${examMode === option.mode
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-slate-600/50 bg-slate-800/40 hover:border-slate-500/70 hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold ${examMode === option.mode ? 'text-white' : 'text-slate-300'}`}>
                        {option.label}
                      </h3>
                      <p className={`text-sm ${examMode === option.mode ? 'text-slate-300' : 'text-slate-500'}`}>
                        {option.description}
                      </p>
                    </div>
                    {examMode === option.mode && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-600/50">
                <h3 className="text-white font-bold mb-3">選擇年級</h3>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-600/50">
                <h3 className="text-white font-bold mb-3">選擇單元</h3>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full p-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
            <h2 className="text-2xl font-bold text-white mb-4">📊 題目數量</h2>
            
            <div className="space-y-4">
              {questionOptions.map((option) => (
                <div
                  key={option.count}
                  onClick={() => setSelectedCount(option.count)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${selectedCount === option.count
                      ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-slate-600/50 bg-slate-800/40 hover:border-slate-500/70 hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-lg font-bold text-lg
                      ${selectedCount === option.count
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-700/50 text-slate-400'
                      }
                    `}>
                      {option.count}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-bold ${selectedCount === option.count ? 'text-white' : 'text-slate-300'}`}>
                        {option.label}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <svg className={`w-4 h-4 ${selectedCount === option.count ? 'text-blue-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={selectedCount === option.count ? 'text-blue-400' : 'text-slate-400'}>
                          預計時間：{option.duration}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${selectedCount === option.count ? 'text-slate-300' : 'text-slate-500'}`}>
                        {option.description}
                      </p>
                    </div>

                    {selectedCount === option.count && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                       text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105
                       shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            🚀 開始測驗 ({selectedCount} 題)
          </button>
          
          <p className="text-slate-400 text-sm mt-4">
            💡 每題提交後將立即顯示結果和詳細解析
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExamSettings;

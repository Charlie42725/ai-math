'use client'

import { useState } from 'react';

interface ExamSettingsProps {
  onStartExam: (questionCount: number) => void;
}

const ExamSettings = ({ onStartExam }: ExamSettingsProps) => {
  const [selectedCount, setSelectedCount] = useState<number>(10);

  const questionOptions = [
    { count: 5, label: '5題 - 快速練習', duration: '10分鐘', description: '適合課間練習' },
    { count: 10, label: '10題 - 標準測驗', duration: '20分鐘', description: '完整單元複習' },
    { count: 15, label: '15題 - 進階練習', duration: '30分鐘', description: '深度理解檢測' },
    { count: 20, label: '20題 - 完整會考', duration: '40分鐘', description: '仿真會考體驗' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* 標題區域 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 text-blue-400 rounded-2xl mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">📝 會考數學模擬測驗</h1>
          <p className="text-xl text-slate-400">選擇您要挑戰的題目數量</p>
        </div>

        {/* 選項卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {questionOptions.map((option) => (
            <div
              key={option.count}
              onClick={() => setSelectedCount(option.count)}
              className={`
                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105
                ${selectedCount === option.count
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-slate-600/50 bg-slate-800/40 hover:border-slate-500/70 hover:bg-slate-800/60'
                }
              `}
            >
              {/* 選中指示器 */}
              {selectedCount === option.count && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <div className={`
                  flex items-center justify-center w-16 h-16 rounded-xl font-bold text-2xl
                  ${selectedCount === option.count
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-slate-700/50 text-slate-400'
                  }
                `}>
                  {option.count}
                </div>
                
                <div className="flex-1">
                  <h3 className={`
                    text-xl font-bold mb-2
                    ${selectedCount === option.count ? 'text-white' : 'text-slate-300'}
                  `}>
                    {option.label}
                  </h3>
                  
                  <div className="space-y-1">
                    <div className={`
                      flex items-center space-x-2 text-sm
                      ${selectedCount === option.count ? 'text-blue-400' : 'text-slate-400'}
                    `}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>預計時間：{option.duration}</span>
                    </div>
                    
                    <p className={`
                      text-sm
                      ${selectedCount === option.count ? 'text-slate-300' : 'text-slate-500'}
                    `}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 開始按鈕 */}
        <div className="text-center">
          <button
            onClick={() => onStartExam(selectedCount)}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                       text-white font-bold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105
                       shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
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

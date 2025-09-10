'use client'

import { useState } from 'react';

interface SubmissionResult {
  isCorrect: boolean;
  feedback: string;
  explanation: string;
  detailedAnalysis?: string;
  thinkingProcess?: string;
  optimization?: string;
  suggestions?: string[];
}

interface AnalysisSidebarProps {
  result: SubmissionResult | null;
  isVisible: boolean;
  onToggle: () => void;
}

const AnalysisSidebar = ({ result, isVisible, onToggle }: AnalysisSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['feedback']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 'feedback',
      title: '🎯 回饋結果',
      content: result?.feedback,
      explanation: result?.explanation,
      color: result?.isCorrect ? 'green' : 'red'
    },
    {
      id: 'detailedAnalysis',
      title: '🔍 詳細分析',
      content: result?.detailedAnalysis,
      color: 'blue'
    },
    {
      id: 'thinkingProcess',
      title: '🧠 思考過程評估',
      content: result?.thinkingProcess,
      color: 'purple'
    },
    {
      id: 'optimization',
      title: '💡 優化建議',
      content: result?.optimization,
      color: 'amber'
    },
    {
      id: 'suggestions',
      title: '📚 學習建議',
      content: result?.suggestions,
      color: 'emerald'
    }
  ];

  const getColorClasses = (color: string, isExpanded: boolean = false) => {
    const colors = {
      green: {
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        text: 'text-green-300',
        contentText: 'text-green-200',
        hover: 'hover:bg-green-500/20'
      },
      red: {
        border: 'border-red-500/30',
        bg: 'bg-red-500/10',
        text: 'text-red-300',
        contentText: 'text-red-200',
        hover: 'hover:bg-red-500/20'
      },
      blue: {
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        text: 'text-blue-300',
        contentText: 'text-blue-200',
        hover: 'hover:bg-blue-500/20'
      },
      purple: {
        border: 'border-purple-500/30',
        bg: 'bg-purple-500/10',
        text: 'text-purple-300',
        contentText: 'text-purple-200',
        hover: 'hover:bg-purple-500/20'
      },
      amber: {
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        text: 'text-amber-300',
        contentText: 'text-amber-200',
        hover: 'hover:bg-amber-500/20'
      },
      emerald: {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        contentText: 'text-emerald-200',
        hover: 'hover:bg-emerald-500/20'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (!result) {
    return (
      <div className={`
        fixed top-6 right-6 bottom-24 w-1/2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 
        transform transition-transform duration-300 z-40 shadow-2xl rounded-2xl overflow-hidden
        flex flex-col
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>🤖</span>
              <span>AI 分析結果</span>
            </h3>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1e293b'
          }}
        >
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center h-full">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-xl mb-2">提交答案後</p>
            <p className="text-lg text-slate-500">AI 分析結果將在此顯示</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      fixed top-6 right-6 bottom-24 w-1/2 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 
      transform transition-transform duration-300 z-40 shadow-2xl rounded-2xl overflow-hidden
      flex flex-col
      ${isVisible ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* 標題欄 */}
      <div className="flex-shrink-0 p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>🤖</span>
            <span>AI 分析結果</span>
          </h3>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 分析內容 - 可滾動區域 */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden" 
        style={{ 
          height: 0,
          scrollbarWidth: 'thin',
          scrollbarColor: '#475569 #1e293b'
        }}
      >
        <div className="p-6 space-y-4 min-h-full">
          {sections.map((section) => {
            if (!section.content) return null;
            
            const isExpanded = expandedSections.has(section.id);
            const colors = getColorClasses(section.color, isExpanded);
            
            return (
              <div key={section.id} className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden shadow-lg`}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full p-4 text-left transition-all duration-200 ${colors.hover}`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-base ${colors.text}`}>
                      {section.title}
                    </h4>
                    <svg 
                      className={`w-5 h-5 transition-transform duration-200 ${colors.text} ${
                        isExpanded ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4">
                    {section.id === 'feedback' ? (
                      <div>
                        <p className={`text-base ${colors.contentText} mb-3 leading-relaxed`}>{section.content}</p>
                        {section.explanation && (
                          <div className={`text-sm ${colors.contentText} opacity-80 bg-black/20 p-3 rounded-lg`}>
                            <strong>解析：</strong>{section.explanation}
                          </div>
                        )}
                      </div>
                    ) : section.id === 'suggestions' ? (
                      <ul className={`text-base ${colors.contentText} space-y-2`}>
                        {Array.isArray(section.content) && section.content.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className={`${colors.text} mt-1`}>•</span>
                            <span className="leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-base ${colors.contentText} leading-relaxed`}>
                        {section.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 底部操作 */}
      <div className="flex-shrink-0 p-5 border-t border-slate-700/50 bg-slate-800/50">
        <button
          onClick={() => setExpandedSections(new Set(['feedback', 'detailedAnalysis', 'thinkingProcess', 'optimization', 'suggestions']))}
          className="w-full py-3 px-4 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50 border border-slate-600/50 hover:border-slate-500/50"
        >
          📖 展開所有區塊
        </button>
      </div>
    </div>
  );
};

export default AnalysisSidebar;

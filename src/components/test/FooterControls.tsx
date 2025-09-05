'use client'

interface FooterControlsProps {
  currentQuestion: number;
  totalQuestions: number;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onSubmitExam: () => void;
  isSubmitted: boolean;
  canSubmit: boolean;
}

export default function FooterControls({
  currentQuestion,
  totalQuestions,
  onPreviousQuestion,
  onNextQuestion,
  onSubmitExam,
  isSubmitted,
  canSubmit
}: FooterControlsProps) {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const progress = Math.round(((currentQuestion + 1) / totalQuestions) * 100);

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* 左側：上一題 */}
        <button
          onClick={onPreviousQuestion}
          disabled={isFirstQuestion}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${isFirstQuestion
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>上一題</span>
        </button>

        {/* 中間：進度和提交 */}
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-slate-300 font-medium">
              {progress}% 完成
            </div>
            <div className="text-xs text-slate-400">
              第 {currentQuestion + 1} 題 / 共 {totalQuestions} 題
            </div>
          </div>

          {!isSubmitted && canSubmit && (
            <button
              onClick={onSubmitExam}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                         text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              結束測驗
            </button>
          )}

          {isSubmitted && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">已完成</span>
            </div>
          )}
        </div>

        {/* 右側：下一題 */}
        <button
          onClick={onNextQuestion}
          disabled={isLastQuestion}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${isLastQuestion
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }
          `}
        >
          <span>下一題</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

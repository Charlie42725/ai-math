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

interface ProgressSidebarProps {
  questions: Question[];
  currentQuestion: number;
  onQuestionSelect: (index: number) => void;
  getQuestionStatus: (index: number) => 'unanswered' | 'answered' | 'correct' | 'incorrect';
  answeredCount: number;
  totalQuestions: number;
}

export default function ProgressSidebar({
  questions,
  currentQuestion,
  onQuestionSelect,
  getQuestionStatus,
  answeredCount,
  totalQuestions
}: ProgressSidebarProps) {
  const progress = (answeredCount / totalQuestions) * 100;

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-blue-500 text-white border-blue-400 ring-2 ring-blue-400/50';
    }
    
    switch (status) {
      case 'correct':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'incorrect':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'answered':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-700 text-slate-400 border-slate-600 hover:bg-slate-600';
    }
  };

  return (
    <div className="w-20 bg-slate-800/30 backdrop-blur-sm border-r border-slate-700/50 flex flex-col items-center py-6">
      {/* 標題 */}
      <div className="text-slate-300 text-sm font-medium mb-4 writing-vertical">
        答題進度
      </div>

      {/* 進度條 */}
      <div className="w-3 flex-1 bg-slate-700 rounded-full overflow-hidden mb-4 relative">
        <div 
          className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 transition-all duration-700 rounded-full"
          style={{ height: `${progress}%` }}
        />
        
        {/* 進度文字 */}
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
          {Math.round(progress)}%
        </div>
      </div>

      {/* 題號方塊 */}
      <div className="space-y-2">
        {questions.map((question, index) => {
          const status = getQuestionStatus(index);
          const isCurrent = index === currentQuestion;
          
          return (
            <button
              key={question.id}
              onClick={() => onQuestionSelect(index)}
              className={`
                relative w-10 h-10 rounded-lg border font-medium text-sm transition-all duration-200
                ${getStatusColor(status, isCurrent)}
                hover:scale-110 focus:outline-none
              `}
            >
              {index + 1}
              
              {/* 狀態小角標 */}
              {status === 'correct' && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              {status === 'incorrect' && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✗</span>
                </div>
              )}
              {status === 'answered' && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 底部統計 */}
      <div className="mt-4 text-center text-xs text-slate-400">
        <div>{answeredCount}/{totalQuestions}</div>
        <div className="text-slate-500">已答</div>
      </div>
    </div>
  );
}

import Timer from "./Timer";
import ScoreBadge from "./ScoreBadge";

interface HeaderInfoProps {
  examTitle: string;
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining: number; // 秒
  score?: number;
  maxScore: number;
}

export default function HeaderInfo({
  examTitle,
  currentQuestion,
  totalQuestions,
  timeRemaining,
  score,
  maxScore
}: HeaderInfoProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左側：卷名和題號 */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-xl font-bold text-white">{examTitle}</h1>
            <p className="text-slate-400 text-sm">
              第 {currentQuestion} 小題 / 共 {totalQuestions} 題
            </p>
          </div>
        </div>

        {/* 中間：得分（如果有） */}
        {score !== undefined && (
          <div className="flex items-center space-x-4">
            <ScoreBadge 
              score={score} 
              maxScore={maxScore}
              showStars={true}
            />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {score} / {maxScore}
              </div>
              <div className="text-xs text-slate-400">
                得分 ({Math.round((score / maxScore) * 100)}%)
              </div>
            </div>
          </div>
        )}

        {/* 右側：計時器 */}
        <div className="flex items-center space-x-4">
          <Timer timeRemaining={timeRemaining} />
          
          {/* 進度指示器 */}
          <div className="flex items-center space-x-2">
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-sm text-slate-400 min-w-max">
              {currentQuestion} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

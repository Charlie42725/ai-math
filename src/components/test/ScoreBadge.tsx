interface ScoreBadgeProps {
  score: number;
  maxScore: number;
  showStars?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ScoreBadge({ 
  score, 
  maxScore, 
  showStars = false, 
  size = 'md',
  className = ''
}: ScoreBadgeProps) {
  const percentage = Math.round((score / maxScore) * 100);
  
  // 根據得分比例決定等級和顏色
  const getGrade = () => {
    if (percentage >= 90) return { level: 'A+', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (percentage >= 80) return { level: 'A', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    if (percentage >= 70) return { level: 'B+', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (percentage >= 60) return { level: 'B', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
    if (percentage >= 50) return { level: 'C', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
    return { level: 'D', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
  };

  const grade = getGrade();
  
  // 計算星星數量
  const getStarCount = () => {
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 70) return 3;
    if (percentage >= 60) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const starCount = getStarCount();

  // 根據尺寸決定樣式
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-3 py-1.5',
          text: 'text-sm',
          starSize: 'text-sm'
        };
      case 'lg':
        return {
          container: 'px-6 py-3',
          text: 'text-lg',
          starSize: 'text-lg'
        };
      default:
        return {
          container: 'px-4 py-2',
          text: 'text-base',
          starSize: 'text-base'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`
      inline-flex items-center space-x-3 rounded-xl border transition-all duration-200
      ${grade.bg} ${grade.border} ${sizeClasses.container} ${className}
    `}>
      {/* 分數顯示 */}
      <div className="flex items-center space-x-2">
        <span className={`font-bold ${grade.color} ${sizeClasses.text}`}>
          {score}/{maxScore}
        </span>
        <span className={`text-xs ${grade.color} opacity-80`}>
          ({percentage}%)
        </span>
      </div>

      {/* 等級標示 */}
      <div className={`
        px-2 py-1 rounded-lg font-bold text-xs
        ${grade.color} ${grade.bg} border ${grade.border}
      `}>
        {grade.level}
      </div>

      {/* 星星評分 */}
      {showStars && (
        <div className="flex items-center space-x-0.5">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`${sizeClasses.starSize} ${
                index < starCount ? 'text-yellow-400' : 'text-slate-600'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      )}

      {/* 進度條（小尺寸） */}
      {size === 'sm' && (
        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              percentage >= 80 ? 'bg-green-500' :
              percentage >= 60 ? 'bg-blue-500' :
              percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

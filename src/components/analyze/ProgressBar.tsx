"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  showPercentage?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max,
  label,
  color = 'blue',
  showPercentage = true,
  animated = true
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    green: 'from-green-400 via-emerald-400 to-green-600',
    blue: 'from-blue-400 via-cyan-400 to-blue-600',
    purple: 'from-purple-400 via-pink-400 to-purple-600',
    orange: 'from-orange-400 via-amber-400 to-orange-600',
    red: 'from-red-400 via-rose-400 to-red-600'
  };

  const bgColorClasses = {
    green: 'bg-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100',
    red: 'bg-red-100'
  };

  const iconMap = {
    green: '🌟',
    blue: '💎',
    purple: '🔮',
    orange: '🔥',
    red: '⚡'
  };

  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl transform group-hover:scale-125 transition-transform duration-300">
            {iconMap[color]}
          </span>
          <span className="text-base md:text-lg font-black text-gray-900">{label}</span>
        </div>
        {showPercentage && (
          <span className="text-sm md:text-base font-black text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border-2 border-gray-200">
            {value}/{max} ({Math.round(percentage)}%)
          </span>
        )}
      </div>
      <div className={`relative w-full h-7 rounded-full ${bgColorClasses[color]} overflow-hidden shadow-inner border-3 border-gray-200`}>
        {/* 背景裝飾 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        {/* 進度條 */}
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} ${animated ? 'transition-all duration-1000 ease-out' : ''} relative flex items-center justify-end pr-3 shadow-lg`}
          style={{ width: `${percentage}%` }}
        >
          {/* 動畫閃光效果 */}
          {animated && (
            <>
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
            </>
          )}

          {/* 百分比文字 */}
          {percentage > 15 && (
            <span className="relative text-white text-sm md:text-base font-black drop-shadow-lg z-10">
              {Math.round(percentage)}%
            </span>
          )}

          {/* 末端光點 */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
        </div>

        {/* 刻度線 (裝飾) */}
        {[25, 50, 75].map(mark => (
          <div
            key={mark}
            className="absolute top-0 h-full w-0.5 bg-gray-300/50"
            style={{ left: `${mark}%` }}
          />
        ))}
      </div>

      {/* 進度提示 */}
      {percentage >= 100 && (
        <div className="text-center animate-bounce">
          <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full shadow-sm">
            🎉 已達成！
          </span>
        </div>
      )}
    </div>
  );
}

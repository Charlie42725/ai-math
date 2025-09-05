'use client'

interface TimerProps {
  timeRemaining: number; // 秒
}

export default function Timer({ timeRemaining }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // 根據剩餘時間決定顏色
  const getTimeColor = () => {
    if (timeRemaining > 900) return 'text-green-400'; // 超過15分鐘
    if (timeRemaining > 300) return 'text-amber-400'; // 超過5分鐘
    return 'text-red-400'; // 少於5分鐘
  };

  const getBackgroundColor = () => {
    if (timeRemaining > 900) return 'bg-green-500/10 border-green-500/20'; 
    if (timeRemaining > 300) return 'bg-amber-500/10 border-amber-500/20'; 
    return 'bg-red-500/10 border-red-500/20'; 
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const getProgressPercentage = (totalTime: number = 75 * 60) => {
    return (timeRemaining / totalTime) * 100;
  };

  return (
    <div className={`
      flex items-center space-x-3 px-4 py-2 rounded-xl border transition-all duration-300
      ${getBackgroundColor()}
    `}>
      {/* 時鐘圖標 */}
      <div className={`${getTimeColor()}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>
      
      {/* 時間顯示 */}
      <div className="flex flex-col">
        <div className={`font-mono text-lg font-bold ${getTimeColor()}`}>
          {formatTime(minutes)}:{formatTime(seconds)}
        </div>
        <div className="text-xs text-slate-400">
          剩餘時間
        </div>
      </div>
      
      {/* 進度條 */}
      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            timeRemaining > 900 ? 'bg-green-500' :
            timeRemaining > 300 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${Math.max(0, getProgressPercentage())}%` }}
        />
      </div>
      
      {/* 警告指示 */}
      {timeRemaining <= 300 && timeRemaining > 0 && (
        <div className="animate-pulse">
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* 時間結束 */}
      {timeRemaining === 0 && (
        <div className="text-red-400 font-medium text-sm">
          時間結束
        </div>
      )}
    </div>
  );
}

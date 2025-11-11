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
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    red: 'from-red-400 to-red-600'
  };

  const bgColorClasses = {
    green: 'bg-green-500/20',
    blue: 'bg-blue-500/20',
    purple: 'bg-purple-500/20',
    orange: 'bg-orange-500/20',
    red: 'bg-red-500/20'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {showPercentage && (
          <span className="text-xs text-gray-700">
            {value}/{max} ({Math.round(percentage)}%)
          </span>
        )}
      </div>
      <div className={`w-full h-3 rounded-full ${bgColorClasses[color]} overflow-hidden`}>
        <div 
          className={`h-full bg-gradient-to-r ${colorClasses[color]} ${animated ? 'transition-all duration-700 ease-out' : ''} relative`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}

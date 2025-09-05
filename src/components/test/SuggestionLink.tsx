import Link from 'next/link';

interface SuggestionLinkProps {
  title: string;
  href: string;
  type: 'concept' | 'practice' | 'video' | 'reading';
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  className?: string;
}

export default function SuggestionLink({
  title,
  href,
  type,
  description,
  difficulty,
  className = ''
}: SuggestionLinkProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'concept':
        return {
          icon: '📚',
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          hoverBg: 'hover:bg-blue-500/20'
        };
      case 'practice':
        return {
          icon: '✏️',
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/20',
          hoverBg: 'hover:bg-green-500/20'
        };
      case 'video':
        return {
          icon: '🎥',
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/20',
          hoverBg: 'hover:bg-purple-500/20'
        };
      case 'reading':
        return {
          icon: '📖',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          hoverBg: 'hover:bg-amber-500/20'
        };
    }
  };

  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return {
          text: '簡單',
          color: 'text-green-400',
          dots: '●○○'
        };
      case 'medium':
        return {
          text: '中等',
          color: 'text-amber-400',
          dots: '●●○'
        };
      case 'hard':
        return {
          text: '困難',
          color: 'text-red-400',
          dots: '●●●'
        };
      default:
        return null;
    }
  };

  const typeConfig = getTypeConfig();
  const difficultyConfig = getDifficultyConfig();

  return (
    <Link
      href={href}
      className={`
        group inline-flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200
        ${typeConfig.bg} ${typeConfig.border} ${typeConfig.hoverBg}
        hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50
        ${className}
      `}
    >
      {/* 圖標 */}
      <div className="text-xl">
        {typeConfig.icon}
      </div>

      {/* 內容區域 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className={`font-medium ${typeConfig.color} group-hover:text-white transition-colors`}>
            {title}
          </h4>
          
          {/* 難度指示 */}
          {difficultyConfig && (
            <div className="flex items-center space-x-1">
              <span className={`text-xs ${difficultyConfig.color}`}>
                {difficultyConfig.dots}
              </span>
              <span className={`text-xs ${difficultyConfig.color}`}>
                {difficultyConfig.text}
              </span>
            </div>
          )}
        </div>
        
        {/* 描述 */}
        {description && (
          <p className="text-sm text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">
            {description}
          </p>
        )}
      </div>

      {/* 箭頭圖標 */}
      <div className={`${typeConfig.color} group-hover:text-white transition-colors`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

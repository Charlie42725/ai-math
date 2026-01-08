"use client";

interface BadgeProps {
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function LearningBadge({ title, description, icon, earned, rarity = 'common' }: BadgeProps) {
  const rarityColors = {
    common: 'from-gray-400 via-gray-500 to-gray-600',
    rare: 'from-blue-400 via-blue-500 to-blue-600',
    epic: 'from-purple-400 via-purple-500 to-purple-600',
    legendary: 'from-yellow-400 via-orange-400 to-orange-600'
  };

  const rarityBorders = {
    common: 'border-gray-400',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  };

  const rarityGlow = {
    common: 'shadow-gray-300',
    rare: 'shadow-blue-300',
    epic: 'shadow-purple-300',
    legendary: 'shadow-yellow-300'
  };

  const rarityText = {
    common: '普通',
    rare: '稀有',
    epic: '史詩',
    legendary: '傳說'
  };

  return (
    <div className={`relative p-5 rounded-2xl border-4 transition-all duration-500 ${
      earned
        ? `bg-gradient-to-br ${rarityColors[rarity]} ${rarityBorders[rarity]} shadow-2xl ${rarityGlow[rarity]} hover:scale-110 transform cursor-pointer`
        : 'bg-gray-200 border-gray-300 grayscale opacity-40 hover:opacity-60'
    }`}>
      {/* 獲得徽章標記 */}
      {earned && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white z-10 animate-bounce">
          <span className="text-white text-lg font-black">✓</span>
        </div>
      )}

      {/* 稀有度標籤 */}
      {earned && rarity !== 'common' && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[rarity]} text-white text-xs font-black shadow-lg border-2 border-white`}>
            {rarityText[rarity]}
          </div>
        </div>
      )}

      {/* 光環效果 (只在獲得且高級稀有度時顯示) */}
      {earned && (rarity === 'epic' || rarity === 'legendary') && (
        <>
          <div className={`absolute -inset-2 bg-gradient-to-r ${rarityColors[rarity]} rounded-2xl blur-lg opacity-60 animate-pulse`}></div>
          <div className={`absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rounded-2xl animate-shimmer`}></div>
        </>
      )}

      <div className="relative text-center space-y-3">
        {/* 圖標 */}
        <div className={`text-6xl mb-3 ${earned ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }}>
          {icon}
        </div>

        {/* 標題 */}
        <h4 className={`font-black text-base mb-2 ${earned ? 'text-white drop-shadow-lg' : 'text-gray-600'}`}>
          {title}
        </h4>

        {/* 描述 */}
        <p className={`text-xs ${earned ? 'text-white/95 drop-shadow' : 'text-gray-500'}`}>
          {description}
        </p>

        {/* 獲得狀態指示 */}
        {!earned && (
          <div className="mt-3 pt-3 border-t-2 border-gray-400">
            <span className="text-xs font-bold text-gray-600">🔒 尚未解鎖</span>
          </div>
        )}

        {/* 閃光裝飾點 */}
        {earned && rarity !== 'common' && (
          <div className="absolute top-2 right-2">
            <div className={`w-3 h-3 rounded-full bg-white animate-ping`}></div>
          </div>
        )}

        {/* 傳說級別特殊效果 */}
        {earned && rarity === 'legendary' && (
          <>
            <div className="absolute top-1 left-1 text-yellow-200 animate-pulse text-lg">✨</div>
            <div className="absolute top-1 right-1 text-yellow-200 animate-pulse text-lg" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-1 left-1 text-yellow-200 animate-pulse text-lg" style={{ animationDelay: '1s' }}>✨</div>
            <div className="absolute bottom-1 right-1 text-yellow-200 animate-pulse text-lg" style={{ animationDelay: '1.5s' }}>✨</div>
          </>
        )}
      </div>
    </div>
  );
}

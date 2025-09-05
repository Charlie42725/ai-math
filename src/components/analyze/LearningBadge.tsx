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
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };

  const rarityBorders = {
    common: 'border-gray-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-yellow-500/50'
  };

  return (
    <div className={`relative p-4 rounded-lg border ${rarityBorders[rarity]} transition-all duration-300 ${
      earned 
        ? `bg-gradient-to-br ${rarityColors[rarity]} shadow-lg hover:scale-105` 
        : 'bg-slate-700/30 border-slate-600/50 grayscale opacity-50'
    }`}>
      {earned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
      
      <div className="text-center">
        <div className="text-3xl mb-2">{icon}</div>
        <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
        <p className="text-xs text-white/80">{description}</p>
      </div>
      
      {rarity !== 'common' && (
        <div className="absolute top-1 left-1">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rarityColors[rarity]} animate-pulse`}></div>
        </div>
      )}
    </div>
  );
}

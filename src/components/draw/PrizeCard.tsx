import React from "react";
import { isPrizePoints } from "./utils";

interface PrizeCardProps {
  prize: string;
  flipped: boolean;
  onReset?: () => void;
  className?: string;
}

const PrizeCard: React.FC<PrizeCardProps> = ({
  prize,
  flipped,
  onReset,
  className = "",
}) => {
  const isPoints = isPrizePoints(prize);

  return (
    <div className={`text-center mt-8 ${className}`}>
      <h2 className="success-indicator text-4xl font-bold text-yellow-400 mb-4">
        🎉 恭喜獲得 🎉
      </h2>
      
      <div className="flex justify-center mb-6">
        <div 
          className={`
            w-52 h-72 relative transition-transform duration-500 ease-out
            ${flipped ? '' : 'translate-y-10'}
          `}
          style={{ perspective: '1000px' }}
        >
          <div 
            className={`
              relative w-full h-full transition-transform duration-600 
              ${flipped ? '' : ''}
            `}
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* 卡片背面 */}
            <div 
              className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-yellow-400 via-pink-500 to-teal-400 flex items-center justify-center text-6xl text-white shadow-2xl"
              style={{ backfaceVisibility: 'hidden' }}
            >
              🎁
            </div>
            
            {/* 卡片正面 */}
            <div 
              className={`
                absolute inset-0 w-full h-full rounded-2xl flex items-center justify-center text-2xl font-bold shadow-2xl
                ${isPoints 
                  ? 'bg-gradient-to-br from-yellow-300 via-pink-500 to-purple-600 text-white animate-pulse' 
                  : 'bg-gradient-to-br from-yellow-100 via-yellow-400 to-orange-500 text-gray-800'
                }
              `}
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              {prize}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-xl font-bold text-yellow-400">
        {isPoints ? "🌟 太棒了！獲得珍貴獎勵！🌟" : "💪 再接再厲，下次一定更好！💪"}
      </div>
      
      {onReset && (
        <button
          onClick={onReset}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          再抽一次
        </button>
      )}
    </div>
  );
};

export default PrizeCard;

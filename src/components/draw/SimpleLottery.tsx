import React from "react";

interface SimpleLotteryProps {
  onPrizeWon?: (prize: string) => void;
}

const SimpleLottery: React.FC<SimpleLotteryProps> = ({ onPrizeWon }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">🎰 抽卡系統</h1>
      <p className="text-xl">抽獎組件開發中...</p>
      <button 
        className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        onClick={() => onPrizeWon?.("測試獎品")}
      >
        測試抽獎
      </button>
    </div>
  );
};

export default SimpleLottery;

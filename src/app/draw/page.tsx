"use client";
import React from "react";
import Link from "next/link";
import LotteryBox from "../../components/draw/LotteryBox";
import "./drawStyles.css";
import "./drawAnimations.css";

export default function LotteryPage() {
  const handlePrizeWon = (prize: string) => {
    console.log("Prize won:", prize);
    // 這裡可以添加其他邏輯，比如更新用戶積分、顯示通知等
  };

  return (
    <div className="animated-background min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* 星星背景效果 */}
      <div className="stars">
        <div className="star" style={{top: '10%', left: '20%'}}></div>
        <div className="star" style={{top: '20%', left: '80%'}}></div>
        <div className="star" style={{top: '60%', left: '10%'}}></div>
        <div className="star" style={{top: '80%', left: '70%'}}></div>
        <div className="star" style={{top: '30%', left: '50%'}}></div>
      </div>

      {/* 返回首頁按鈕 */}
      <div className="fixed top-3 md:top-4 left-3 md:left-4 z-50">
        <Link
          href="/"
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
        >
          ← <span className="hidden sm:inline">返回首頁</span><span className="sm:hidden">首頁</span>
        </Link>
      </div>

      {/* 頁面標題 */}
      <div className="fixed top-3 md:top-4 right-3 md:right-4 z-50">
        <h1 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg">
          🎰 抽卡系統
        </h1>
      </div>

      {/* 抽獎組件 */}
      <div className="pt-4 md:pt-8 px-4"> {/* 大幅減少頂部間距 */}
        <LotteryBox onPrizeWon={handlePrizeWon} />
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import FlashCard from "./FlashCard";

export interface FlashCardData {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  nextReview?: Date;
  reviewCount: number;
  correctCount: number;
}

interface FlashCardDeckProps {
  cards: FlashCardData[];
  onComplete?: (stats: { correct: number; total: number }) => void;
  onAskAI?: (question: string, answer: string) => void;
}

const FlashCardDeck: React.FC<FlashCardDeckProps> = ({ cards, onComplete, onAskAI }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set());
  const [showCard, setShowCard] = useState(true);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleCorrect = () => {
    setCorrectCards(prev => new Set([...prev, currentCard.id]));
    setReviewedCards(prev => new Set([...prev, currentCard.id]));
    moveToNext();
  };

  const handleIncorrect = () => {
    setReviewedCards(prev => new Set([...prev, currentCard.id]));
    moveToNext();
  };

  const moveToNext = () => {
    setShowCard(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowCard(true);
      } else {
        // 完成所有卡片
        onComplete?.({
          correct: correctCards.size,
          total: cards.length
        });
      }
    }, 300);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setReviewedCards(new Set());
    setCorrectCards(new Set());
    setShowCard(true);
  };

  const handleAskAI = () => {
    onAskAI?.(currentCard.question, currentCard.answer);
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-slate-400">
          <p className="text-xl">沒有可用的閃卡</p>
          <p className="text-sm mt-2">請先生成或選擇閃卡</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">完成複習！</h2>
            <p className="text-xl text-slate-300">
              答對 {correctCards.size} / {cards.length} 題
            </p>
            <p className="text-lg text-slate-400 mt-2">
              正確率：{Math.round((correctCards.size / cards.length) * 100)}%
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            🔄 再複習一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 進度條 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">
            卡片 {currentIndex + 1} / {cards.length}
          </span>
          <span className="text-sm text-slate-300">
            {Math.round(progress)}% 完成
          </span>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 分類與難度標籤 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
          {currentCard.category}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${
          currentCard.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
          currentCard.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-red-500/20 text-red-300'
        }`}>
          {currentCard.difficulty === 'easy' ? '簡單' :
           currentCard.difficulty === 'medium' ? '中等' : '困難'}
        </span>
      </div>

      {/* 閃卡 */}
      {showCard && (
        <div className="animate-fadeIn">
          <FlashCard
            question={currentCard.question}
            answer={currentCard.answer}
            onDontUnderstand={handleAskAI}
            onClose={() => {}}
            onRestart={handleRestart}
            loading={false}
          />
        </div>
      )}

      {/* 答題按鈕 */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleIncorrect}
          className="px-6 py-3 bg-red-500/20 text-red-300 border-2 border-red-500/50 rounded-lg hover:bg-red-500/30 transition-all duration-200 font-medium"
        >
          ❌ 不會
        </button>
        <button
          onClick={handleCorrect}
          className="px-6 py-3 bg-green-500/20 text-green-300 border-2 border-green-500/50 rounded-lg hover:bg-green-500/30 transition-all duration-200 font-medium"
        >
          ✅ 會了
        </button>
      </div>

      {/* 統計資訊 */}
      <div className="mt-6 text-center text-sm text-slate-400">
        <p>已複習：{reviewedCards.size} 張</p>
        <p>答對：{correctCards.size} 張</p>
      </div>
    </div>
  );
};

export default FlashCardDeck;

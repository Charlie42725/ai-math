import React, { useState, useRef, useEffect } from "react";
import OrbitContainer from "./OrbitContainer";
import PrizeCard from "./PrizeCard";
import ExplosionEffect from "./ExplosionEffect";
import { getRandomPrize } from "./utils";

interface LotteryBoxProps {
  onPrizeWon?: (prize: string) => void;
}

const LotteryBox: React.FC<LotteryBoxProps> = ({ onPrizeWon }) => {
  const [packs] = useState(["🎁", "🎪", "🎊", "🎉", "🎈", "🎀"]);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [showExplosion, setShowExplosion] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  const [showPrizeCard, setShowPrizeCard] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  
  const dragStartY = useRef(0);
  const packRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, idx: number) => {
    if (selectedPack !== null && selectedPack !== idx) return;
    
    setSelectedPack(idx);
    setIsDragging(true);
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
    
    e.preventDefault();
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || selectedPack === null) return;
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = Math.max(0, dragStartY.current - clientY);
    setDragY(deltaY);
    
    // 当拖拽距离超过阈值时触发开包
    if (deltaY > 150 && !isOpening) {
      setIsOpening(true);
      openPack();
    }
  };

  const handleDragEnd = () => {
    if (!isOpening) {
      // 如果没有开包，重置状态
      setIsDragging(false);
      setDragY(0);
      setSelectedPack(null);
    }
  };

  const openPack = () => {
    setShowExplosion(true);
    
    setTimeout(() => {
      const newPrize = getRandomPrize();
      setPrize(newPrize);
      setShowExplosion(false);
      setShowPrizeCard(true);
      onPrizeWon?.(newPrize);
    }, 1000);
  };

  const handlePackClick = (idx: number) => {
    if (selectedPack === null) {
      setSelectedPack(idx);
    } else if (selectedPack === idx && !isDragging && !isOpening) {
      setIsOpening(true);
      openPack();
    }
  };

  const resetLottery = () => {
    setSelectedPack(null);
    setIsDragging(false);
    setDragY(0);
    setShowExplosion(false);
    setPrize(null);
    setShowPrizeCard(false);
    setIsOpening(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleTouchEnd = () => handleDragEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, selectedPack, isOpening]);

  return (
    <div className="lottery-container min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {!showPrizeCard ? (
        <>
          <div className="text-center mb-8">
            <h1 className="lottery-title text-4xl font-bold text-white mb-4">
              🎰 選擇一個禮包
            </h1>
            <p className="instruction-text text-white text-lg">
              {selectedPack !== null 
                ? isDragging 
                  ? `向上拖拽打開禮包！(${dragY}px)` 
                  : "點擊或向上拖拽打開禮包"
                : "點擊選擇一個禮包"
              }
            </p>
          </div>

          <OrbitContainer
            packs={packs}
            selectedPack={selectedPack}
            isDragging={isDragging}
            dragY={dragY}
            onDragStart={handleDragStart}
            onPackClick={handlePackClick}
          />

          {showExplosion && <ExplosionEffect />}
        </>
      ) : (
        prize && (
          <PrizeCard
            prize={prize}
            flipped={true}
            onReset={resetLottery}
            className="prize-card flipped"
          />
        )
      )}
    </div>
  );
};

export default LotteryBox;

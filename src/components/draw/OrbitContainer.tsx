import React, { useState, useEffect, useRef } from 'react';

interface OrbitContainerProps {
  packs: string[];
  selectedPack: number | null;
  isDragging: boolean;
  dragY: number;
  onDragStart: (e: React.MouseEvent | React.TouchEvent, idx: number) => void;
  onPackClick: (idx: number) => void;
}

const OrbitContainer: React.FC<OrbitContainerProps> = ({
  packs,
  selectedPack,
  isDragging,
  dragY,
  onDragStart,
  onPackClick,
}) => {
  // 3D 軌道旋轉狀態
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number | null>(null);
  const isAnimating = useRef(true);

  // 軌道旋轉動畫控制
  useEffect(() => {
    // 當選中禮包時暫停動畫
    isAnimating.current = selectedPack === null;
    
    if (selectedPack !== null && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      if (isAnimating.current) {
        setRotation(prev => prev + 2); // 增加旋轉速度來測試
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPack]);

  // 3D 軌道位置計算 - 水平軌道
  const getPackPosition = (index: number) => {
    const totalPacks = packs.length;
    const angleStep = (360 / totalPacks) * (Math.PI / 180);
    const currentAngle = (rotation * Math.PI / 180) + (index * angleStep);
    
    // 3D 軌道參數 - 水平軌道
    const radiusX = 320; // 增加X軸半徑，讓水平擴展更明顯
    const radiusZ = 120; // 減少Z軸半徑，降低深度變化
    const centerY = 0;   // Y軸固定，不波動
    
    // 計算3D位置 - 保持水平
    const x = Math.cos(currentAngle) * radiusX;
    const z = Math.sin(currentAngle) * radiusZ;
    const y = centerY; // 固定Y軸，確保所有卡片在同一水平面
    
    // 計算縮放比例（模擬透視效果）
    const scale = 0.8 + (z + radiusZ) / (radiusZ * 4);
    
    return {
      transform: `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`,
      zIndex: Math.round(z + radiusZ), // 根據深度設置層級
    };
  };

  return (
    <div className="pack-scroll">
      <div className="orbit-container">
        {packs.map((pack, idx) => {
          const isSelected = selectedPack === idx;
          const isDraggingThis = isSelected && isDragging;
          const position = getPackPosition(idx);
          
          return (
            <div
              key={pack}
              className={`card-pack ${isSelected ? "selected" : ""} ${
                isDraggingThis ? "dragging" : ""
              }`}
              onClick={() => onPackClick(idx)}
              onMouseDown={(e) => onDragStart(e, idx)}
              onTouchStart={(e) => onDragStart(e, idx)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: isDraggingThis 
                  ? `${position.transform} translateY(-${dragY}px)` 
                  : position.transform,
                transition: isDraggingThis ? 'none' : 'all 0.3s ease-out',
                zIndex: isSelected ? 100 : position.zIndex,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
              }}
            >
              {pack}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrbitContainer;

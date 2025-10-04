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
  // 移除軌道動畫，因為改成平面卡片佈局
  // const [rotation, setRotation] = useState(0);
  // const animationRef = useRef<number | null>(null);
  // const isAnimating = useRef(true);

  // 3D 軌道旋轉狀態
  const [rotation, setRotation] = useState(0);
  const [isHovering, setIsHovering] = useState(false); // 新增懸停狀態
  const animationRef = useRef<number | null>(null);
  const isAnimating = useRef(true);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 防抖動計時器

  // 防抖動懸停處理函數
  const handleMouseEnter = () => {
    // 清除之前的計時器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // 添加 300ms 延遲才觸發懸停
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    // 清除計時器
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // 立即恢復動畫，但添加 100ms 延遲避免閃爍
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
    }, 100);
  };

  // 清理計時器
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // 軌道旋轉動畫控制
  useEffect(() => {
    // 當選中禮包或鼠標懸停時暫停動畫
    isAnimating.current = selectedPack === null && !isHovering;
    
    if ((selectedPack !== null || isHovering) && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      if (isAnimating.current) {
        setRotation(prev => prev + 0.3); // 大幅減慢旋轉速度
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedPack, isHovering]); // 添加 isHovering 依賴

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
      <div className={`orbit-container ${
        selectedPack !== null ? 'paused' : ''
      } ${isHovering ? 'hovering' : ''}`}>
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
              onMouseEnter={handleMouseEnter} // 使用防抖動函數
              onMouseLeave={handleMouseLeave} // 使用防抖動函數
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

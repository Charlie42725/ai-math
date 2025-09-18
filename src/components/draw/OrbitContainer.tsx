import React from "react";

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
  return (
    <div className="pack-scroll">
      <div 
        className={`orbit-container ${selectedPack !== null ? 'paused' : ''}`}
      >
        {packs.map((pack, idx) => (
          <div
            key={pack}
            className={`card-pack ${selectedPack === idx ? "selected" : ""} ${
              selectedPack === idx && isDragging ? "dragging" : ""
            }`}
            onClick={() => onPackClick(idx)}
            onMouseDown={(e) => onDragStart(e, idx)}
            onTouchStart={(e) => onDragStart(e, idx)}
            style={{
              animationDelay: `${idx * -1.33}s`, // 8s / 6 packs = 1.33s per pack
              animationPlayState: selectedPack !== null ? 'paused' : 'running',
              transform: selectedPack === idx && isDragging ? `translateY(-${dragY}px)` : undefined,
              '--drag-y': `${dragY}px`,
            } as React.CSSProperties}
          >
            {pack}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrbitContainer;

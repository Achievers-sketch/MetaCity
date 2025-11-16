'use client';
import { useState, useRef, WheelEvent, MouseEvent } from 'react';
import { useGame } from '@/contexts/GameContext';
import { GRID_SIZE } from '@/lib/constants';
import Tile from './Tile';
import Building from './Building';

export default function GameGrid() {
  const { state } = useGame();
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: WheelEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const newZoom = Math.max(0.5, Math.min(3, view.zoom - e.deltaY * 0.001));
    setView({ ...view, zoom: newZoom });
  };
  
  const handleMouseDown = (e: MouseEvent) => {
    setIsPanning(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setView({ ...view, x: view.x + dx, y: view.y + dy });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }

    if (state.buildMode && gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const tileSize = (rect.width / GRID_SIZE) * view.zoom;
        const gridX = e.clientX - rect.left - view.x;
        const gridY = e.clientY - rect.top - view.y;
        
        const x = Math.floor(gridX / tileSize);
        const y = Math.floor(gridY / tileSize);
        
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            setHoveredTile({ x, y });
        } else {
            setHoveredTile(null);
        }
    } else {
        setHoveredTile(null);
    }
  };

  const tileSize = 64; // Base size in px

  return (
    <div
      ref={gridRef}
      className="flex-1 bg-background overflow-hidden cursor-grab"
      style={{ touchAction: 'none' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div
        className="transition-transform duration-100 ease-linear"
        style={{
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
          width: GRID_SIZE * tileSize,
          height: GRID_SIZE * tileSize,
        }}
      >
        <div
          className="grid bg-grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${tileSize}px)`,
            backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: `${tileSize}px ${tileSize}px`,
          }}
        >
          {state.grid.flat().map((tile) => (
            <Tile key={tile.id} tile={tile} size={tileSize} />
          ))}

          {state.buildMode && hoveredTile && (
            <div 
              className="absolute pointer-events-none opacity-50"
              style={{
                  left: hoveredTile.x * tileSize,
                  top: hoveredTile.y * tileSize,
                  width: tileSize,
                  height: tileSize
              }}>
                <Building type={state.buildMode} level={1} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

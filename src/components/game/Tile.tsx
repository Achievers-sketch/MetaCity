'use client';
import { useGame } from '@/contexts/GameContext';
import { TileData } from '@/lib/types';
import Building from './Building';

interface TileProps {
  tile: TileData;
  size: number;
}

export default function Tile({ tile, size }: TileProps) {
  const { state, dispatch } = useGame();
  const { buildings, buildMode, selectedTile, wallet } = state;
  const building = tile.buildingId ? buildings[tile.buildingId] : null;

  const isSelected = selectedTile?.x === tile.x && selectedTile?.y === tile.y;
  const canBuild = buildMode && !building && tile.owner === wallet.address;

  const handleClick = () => {
    if (buildMode) {
      if (canBuild) {
        dispatch({ type: 'PLACE_BUILDING', payload: { position: { x: tile.x, y: tile.y }, type: buildMode } });
      }
    } else {
      dispatch({ type: 'SELECT_TILE', payload: { x: tile.x, y: tile.y } });
    }
  };

  const tileClasses = [
    'relative flex items-center justify-center border-t border-l border-transparent transition-colors',
    tile.owner === wallet.address ? 'bg-primary/5' : '',
    isSelected ? 'ring-2 ring-accent z-10' : '',
    buildMode ? 'cursor-pointer' : 'cursor-default',
    canBuild ? 'hover:bg-green-500/20' : (buildMode && !canBuild ? 'hover:bg-red-500/20' : 'hover:bg-primary/10'),
  ].join(' ');

  return (
    <div
      className={tileClasses}
      style={{ width: size, height: size }}
      onClick={handleClick}
    >
      {building && <Building type={building.type} level={building.level} />}
    </div>
  );
}

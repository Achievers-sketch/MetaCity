'use client';
import { useGame } from '@/contexts/GameContext';
import { calculateResourceGains } from '@/lib/game-logic';

export default function BottomBar() {
  const { state } = useGame();
  const totalBuildings = Object.keys(state.buildings).length;
  const gains = calculateResourceGains(state, 1000); // Calculate for 1 second

  return (
    <footer className="flex items-center justify-center gap-6 p-1 border-t bg-card/50 backdrop-blur-sm text-xs text-muted-foreground">
      <span>Total Buildings: <strong>{totalBuildings}</strong></span>
      <span>Gold/sec: <strong className="text-yellow-400">{gains.gold.toFixed(2)}</strong></span>
      <span>Citizens/sec: <strong className="text-blue-400">{gains.citizens.toFixed(2)}</strong></span>
      <span>Happiness Trend: <strong className={gains.happiness >= 0 ? "text-green-400" : "text-red-400"}>{gains.happiness.toFixed(2)}</strong></span>
    </footer>
  );
}

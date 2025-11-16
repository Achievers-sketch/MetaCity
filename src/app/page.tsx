'use client';

import { GameProvider } from '@/contexts/GameContext';
import GameLayout from '@/components/game/GameLayout';

export default function Home() {
  return (
    <main className="overflow-hidden">
      <GameProvider>
        <GameLayout />
      </GameProvider>
    </main>
  );
}

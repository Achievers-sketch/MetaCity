'use client';
import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import TopBar from './TopBar';
import SidePanel from './SidePanel';
import GameGrid from './GameGrid';
import BottomBar from './BottomBar';
import TutorialOverlay from '@/components/modals/TutorialOverlay';
import GovernanceModal from '@/components/modals/GovernanceModal';
import MarketplaceModal from '@/components/modals/MarketplaceModal';
import NewsTicker from './NewsTicker';
import { Landmark, ShoppingCart, HelpCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export default function GameLayout() {
  const { state } = useGame();
  const [isGovernanceOpen, setGovernanceOpen] = useState(false);
  const [isMarketplaceOpen, setMarketplaceOpen] = useState(false);
  const [isTutorialOpen, setTutorialOpen] = useState(true);

  if (state.isLoading) {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-background p-4">
            <h1 className="text-4xl font-bold mb-4 text-primary">MetaCity</h1>
            <p className="text-lg text-muted-foreground mb-8">Loading your metropolis...</p>
            <div className="w-full max-w-4xl space-y-4">
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-4">
                    <Skeleton className="h-96 w-3/4" />
                    <Skeleton className="h-96 w-1/4" />
                </div>
                 <Skeleton className="h-12 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col relative">
          <GameGrid />
          <NewsTicker />
          <BottomBar />
          <div className="absolute top-4 left-4 flex gap-2">
            <Button onClick={() => setGovernanceOpen(true)}><Landmark className="mr-2 h-4 w-4" />Governance</Button>
            <Button onClick={() => setMarketplaceOpen(true)}><ShoppingCart className="mr-2 h-4 w-4" />Marketplace</Button>
            <Button variant="outline" onClick={() => setTutorialOpen(true)}><HelpCircle className="mr-2 h-4 w-4" />Help</Button>
          </div>
        </main>
        <SidePanel />
      </div>

      <TutorialOverlay isOpen={isTutorialOpen} onClose={() => setTutorialOpen(false)} />
      <GovernanceModal isOpen={isGovernanceOpen} onClose={() => setGovernanceOpen(false)} />
      <MarketplaceModal isOpen={isMarketplaceOpen} onClose={() => setMarketplaceOpen(false)} />
    </div>
  );
}

'use client';
import { useGame } from '@/contexts/GameContext';
import ResourceDisplay from './ResourceDisplay';
import WalletConnectModal from '../modals/WalletConnectModal';
import { Coins, Users, Smile, Wallet } from 'lucide-react';

export default function TopBar() {
  const { state, dispatch } = useGame();
  const { resources, wallet } = state;

  return (
    <header className="flex items-center justify-between p-2 border-b bg-card/50 backdrop-blur-sm z-10">
      <h1 className="text-2xl font-bold text-primary tracking-tighter">MetaCity</h1>
      <div className="flex items-center gap-4">
        <ResourceDisplay icon={<Coins className="text-yellow-400" />} value={Math.floor(resources.gold)} name="Gold" />
        <ResourceDisplay icon={<Users className="text-blue-400" />} value={Math.floor(resources.citizens)} name="Citizens" />
        <ResourceDisplay icon={<Smile className="text-green-400" />} value={Math.floor(resources.happiness)} name="Happiness" />
      </div>
      <WalletConnectModal />
    </header>
  );
}

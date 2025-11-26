'use client';

import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { useEffect } from 'react';

export default function WalletConnectModal() {
  const { state, dispatch } = useGame();
  const { wallet } = state;

  const handleConnect = () => {
    // In a real app, this would trigger a wallet connection flow.
    // For this demo, we'll simulate a connection.
    if (wallet && !wallet.connected) {
      dispatch({ type: 'CONNECT_WALLET', payload: '0xPlayer1...' });
    }
  };

  useEffect(() => {
    // Automatically connect on load for demo purposes
    handleConnect();
  }, []);

  if (wallet?.connected && wallet?.address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">
          <p className="font-bold">Connected</p>
          <p className="text-xs text-muted-foreground">{wallet.address.substring(0, 6)}...{wallet.address.substring(wallet.address.length - 4)}</p>
        </div>
        <Button variant="outline" onClick={() => dispatch({ type: 'DISCONNECT_WALLET' })}>Disconnect</Button>
      </div>
    );
  }

  return <Button onClick={handleConnect}>Connect Wallet</Button>;
}

'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useGame } from '@/contexts/GameContext';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function WalletConnectModal() {
  const { state, dispatch } = useGame();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    // Safely access wallet state
    const walletConnected = state.wallet?.connected;
    const walletAddress = state.wallet?.address;

    if (isConnected && address) {
      if (!walletConnected || walletAddress !== address) {
        dispatch({ type: 'CONNECT_WALLET', payload: address });
      }
    } else if (walletConnected) {
      dispatch({ type: 'DISCONNECT_WALLET' });
    }
  }, [isConnected, address, state.wallet, dispatch]);

  return <ConnectButton />;
}

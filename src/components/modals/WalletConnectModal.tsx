'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useGame } from '@/contexts/GameContext';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function WalletConnectModal() {
  const { state, dispatch } = useGame();
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      if (!state.wallet.connected || state.wallet.address !== address) {
        dispatch({ type: 'CONNECT_WALLET', payload: address });
      }
    } else if (state.wallet.connected) {
      dispatch({ type: 'DISCONNECT_WALLET' });
    }
  }, [isConnected, address, state.wallet.connected, state.wallet.address, dispatch]);

  return <ConnectButton />;
}

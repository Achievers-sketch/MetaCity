'use client';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Wallet } from 'lucide-react';

export default function WalletConnectModal() {
  const { state, dispatch } = useGame();
  const { wallet } = state;

  const handleConnect = () => {
    dispatch({ type: 'CONNECT_WALLET' });
    dispatch({ type: 'SET_TUTORIAL_STEP', payload: 1 });
  };

  if (wallet.connected) {
    return (
      <div className="flex items-center gap-2 text-sm font-mono p-2 rounded-md bg-muted text-muted-foreground">
        <Wallet className="h-4 w-4 text-primary" />
        <span>{wallet.address?.substring(0, 6)}...{wallet.address?.substring(wallet.address.length - 4)}</span>
      </div>
    );
  }

  return (
    <Dialog onOpenChange={(open) => !open && wallet.connected ? null : dispatch({ type: 'TOGGLE_TUTORIAL', payload: open })}>
      <DialogTrigger asChild>
        <Button>
          <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Your Wallet</DialogTitle>
          <DialogDescription>
            Connect your wallet to start building your MetaCity. This is a simulation and will not connect to a real wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={handleConnect} className="w-full">
            Connect Mock Wallet
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By connecting, you agree to the Terms of Service.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

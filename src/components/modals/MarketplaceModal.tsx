'use client';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Building from '../game/Building';
import { Coins } from 'lucide-react';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MarketplaceModal({ isOpen, onClose }: MarketplaceModalProps) {
  const { state, dispatch } = useGame();
  const { market, resources } = state;

  const handleBuy = (marketItemId: string) => {
    dispatch({ type: 'BUY_ITEM', payload: { marketItemId } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>NFT Marketplace</DialogTitle>
          <DialogDescription>Buy and sell building NFTs. This is a simulation with pre-populated items.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {market.map(item => (
            <Card key={item.id}>
              <CardHeader>
                <div className="w-full h-24 rounded-md overflow-hidden">
                    <Building type={item.item.type} level={item.item.level} />
                </div>
                <CardTitle className="text-lg mt-2">{state.gameParameters.buildingStats[item.item.type].name} Lvl {item.item.level}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Seller: {item.seller.substring(0, 10)}...</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleBuy(item.id)} disabled={resources.gold < item.price}>
                  <Coins className="mr-2 h-4 w-4" /> Buy for {item.price}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

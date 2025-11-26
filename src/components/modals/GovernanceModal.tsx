'use client';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface GovernanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GovernanceModal({ isOpen, onClose }: GovernanceModalProps) {
  const { state, dispatch } = useGame();
  const { proposals, wallet } = state;

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    dispatch({ type: 'VOTE_ON_PROPOSAL', payload: { proposalId, vote } });
  };
  
  const votingPower = state.nfts.filter(nft => (nft as any).owner === state.wallet?.address).length || 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Governance DAO</DialogTitle>
          <DialogDescription>Vote on proposals to shape the future of MetaCity. Your vote power is based on your NFT count ({votingPower}).</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-1 space-y-4">
          <h3 className="text-lg font-semibold">Active Proposals</h3>
          {proposals.filter(p => p.status === 'active').map(p => {
            const totalVotes = p.votes.for + p.votes.against;
            const forPercentage = totalVotes > 0 ? (p.votes.for / totalVotes) * 100 : 0;
            const hasVoted = wallet.address && p.voters[wallet.address];

            return (
              <Card key={p.id}>
                <CardHeader>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">Proposed by: {p.proposer.substring(0,10)}... | Ends {formatDistanceToNow(p.endsAt, { addSuffix: true })}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{p.description}</p>
                  <Progress value={forPercentage} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-green-400">For: {p.votes.for}</span>
                    <span className="text-red-400">Against: {p.votes.against}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-green-400 hover:text-green-400" onClick={() => handleVote(p.id, 'for')} disabled={!!hasVoted}>Vote For</Button>
                  <Button size="sm" variant="outline" className="text-red-400 hover:text-red-400" onClick={() => handleVote(p.id, 'against')} disabled={!!hasVoted}>Vote Against</Button>
                  {hasVoted && <span className="text-xs text-muted-foreground">You have voted.</span>}
                </CardFooter>
              </Card>
            )
          })}
          {proposals.filter(p => p.status === 'active').length === 0 && (
             <p className="text-sm text-muted-foreground text-center py-8">No active proposals.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

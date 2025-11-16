'use client';
import { useGame } from '@/contexts/GameContext';
import { getTutorialSuggestion } from '@/lib/game-logic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
    "Connect your wallet to begin.",
    "Select a 'Commercial' building from the menu on the right.",
    "Click on one of your owned (lightly colored) empty tiles to place the building.",
    "Select your new building on the map to see its info.",
    "Try upgrading your building from the info panel.",
    "Explore Governance and the Marketplace using the buttons on the top left.",
];

export default function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const { state, dispatch } = useGame();
  const { tutorialStep } = state;
  const suggestion = getTutorialSuggestion(state);

  const handleNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      dispatch({ type: 'SET_TUTORIAL_STEP', payload: tutorialStep + 1 });
    }
  };

  const handlePrev = () => {
    if (tutorialStep > 0) {
      dispatch({ type: 'SET_TUTORIAL_STEP', payload: tutorialStep - 1 });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to MetaCity!</DialogTitle>
          <DialogDescription>Here's a quick guide to get you started.</DialogDescription>
        </DialogHeader>
        
        <div className="my-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold text-primary">Next Step Suggestion</h4>
            <p className="text-sm text-foreground/80">{suggestion.description}</p>
        </div>

        <div>
            <h4 className="font-semibold">Tutorial Progress</h4>
            <p className="text-sm text-muted-foreground mt-2">
                Step {tutorialStep + 1} of {tutorialSteps.length}: {tutorialSteps[tutorialStep]}
            </p>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={handlePrev} disabled={tutorialStep === 0}><ArrowLeft className="mr-2 h-4 w-4" /> Prev</Button>
          <Button onClick={handleNext} disabled={tutorialStep === tutorialSteps.length - 1}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

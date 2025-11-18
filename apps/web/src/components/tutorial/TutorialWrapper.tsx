'use client';

import { hostTutorialSteps, playerTutorialSteps } from '@parlay-party/shared';
import { TutorialOverlay } from './TutorialOverlay';
import { X } from 'lucide-react';

interface TutorialWrapperProps {
  onComplete: () => void;
  onClose?: () => void;
  isHost?: boolean;
}

export default function TutorialWrapper({ onComplete, onClose, isHost = false }: TutorialWrapperProps) {
  // Use appropriate tutorial steps based on role
  const steps = isHost ? hostTutorialSteps : playerTutorialSteps;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-[10000]"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <TutorialOverlay 
        steps={steps} 
        onComplete={onComplete}
        isActive={true}
      />
    </div>
  );
}

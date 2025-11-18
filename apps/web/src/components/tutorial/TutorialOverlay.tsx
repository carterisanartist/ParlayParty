'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Target, Sparkles } from 'lucide-react';
import { type TutorialStep } from '@parlay-party/shared';
import { cn } from '@/components/ui/utils';

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onComplete: () => void;
  socket?: any;
  isActive: boolean;
}

export function TutorialOverlay({ steps, onComplete, socket, isActive }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  
  const currentStep = steps[currentStepIndex];
  
  useEffect(() => {
    if (!isActive) return;
    
    // Highlight target element if specified
    if (currentStep?.target) {
      setIsHighlighting(true);
      const element = document.querySelector(currentStep.target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tutorial-highlight');
      }
    }
    
    return () => {
      // Clean up highlights
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
      setIsHighlighting(false);
    };
  }, [currentStep, isActive]);
  
  useEffect(() => {
    if (!isActive || !currentStep || !socket) return;
    
    // Listen for socket events if step requires it
    if (currentStep.nextTrigger === 'socket-event' && currentStep.socketEvent) {
      const handler = () => {
        handleNextStep();
      };
      
      socket.on(currentStep.socketEvent, handler);
      return () => {
        socket.off(currentStep.socketEvent, handler);
      };
    }
    
    // Auto-advance after delay
    if (currentStep.nextTrigger === 'auto') {
      const timer = setTimeout(() => {
        handleNextStep();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, socket, isActive]);
  
  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStepIndex, steps.length, onComplete]);
  
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  const handleAction = () => {
    if (currentStep.nextTrigger === 'click' && !currentStep.requiresAction) {
      handleNextStep();
    }
  };
  
  const getPositionClasses = (position?: string) => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-4';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-4';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-4';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-4';
      default:
        return 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };
  
  if (!isActive || !currentStep) return null;
  
  return (
    <>
      {/* Dark overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[60]"
          onClick={handleAction}
        />
      </AnimatePresence>
      
      {/* Spotlight effect for highlighted elements */}
      {isHighlighting && currentStep.target && (
        <div className="tutorial-spotlight" />
      )}
      
      {/* Tutorial card */}
      <motion.div
        key={currentStep.id}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={cn(
          "z-[70] min-w-[320px] max-w-md",
          currentStep.target ? "absolute" : "fixed",
          getPositionClasses(currentStep.position)
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
                <p className="text-xs text-purple-300">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <p className="text-white/90 mb-6">{currentStep.description}</p>
          
          {/* Action hint */}
          <div className="flex items-center gap-2 mb-6 text-sm">
            <Target className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">{currentStep.action}</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-black/30 rounded-full mb-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all",
                currentStepIndex === 0
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-purple-800/50 text-white hover:bg-purple-700/50"
              )}
            >
              Previous
            </button>
            
            {currentStep.nextTrigger === 'click' && !currentStep.requiresAction && (
              <button
                onClick={handleNextStep}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
      
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 65;
          animation: tutorial-pulse 2s ease-in-out infinite;
        }
        
        .tutorial-spotlight::before {
          content: '';
          position: absolute;
          inset: -10px;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.8) 100%
          );
          pointer-events: none;
          z-index: 61;
        }
        
        @keyframes tutorial-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0);
          }
        }
      `}</style>
    </>
  );
}

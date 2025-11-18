'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useGestures, usePullToRefresh } from '../hooks/useGestures';

interface MobileOptimizedWrapperProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onRefresh?: () => void | Promise<void>;
  enableGestures?: boolean;
  enablePullToRefresh?: boolean;
  enableHaptic?: boolean;
}

export function MobileOptimizedWrapper({
  children,
  onSwipeLeft,
  onSwipeRight,
  onRefresh,
  enableGestures = true,
  enablePullToRefresh = true,
  enableHaptic = true
}: MobileOptimizedWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Gesture handling
  const { triggerHaptic } = useGestures(containerRef, {
    onSwipeLeft: enableGestures ? onSwipeLeft : undefined,
    onSwipeRight: enableGestures ? onSwipeRight : undefined,
    enableHaptic,
    threshold: 75,
    velocity: 0.5
  });

  // Pull to refresh
  const { isPulling, pullDistance, isReady } = usePullToRefresh(
    async () => {
      if (!enablePullToRefresh || !onRefresh) return;
      
      setIsRefreshing(true);
      triggerHaptic('medium');
      
      // Show refresh animation
      await controls.start({
        rotate: 360,
        transition: { duration: 0.5, ease: 'linear' }
      });
      
      await onRefresh();
      
      setIsRefreshing(false);
      controls.set({ rotate: 0 });
    },
    { enableHaptic }
  );

  // Add viewport meta tag for better mobile experience
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
  }, []);

  // Native-style page transitions
  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen overscroll-none"
      style={{
        touchAction: enableGestures ? 'pan-y' : 'auto',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <AnimatePresence>
          {(isPulling || isRefreshing) && (
            <motion.div
              initial={{ opacity: 0, y: -60 }}
              animate={{ 
                opacity: 1, 
                y: isPulling ? Math.min(pullDistance - 60, 0) : 0,
                scale: isReady ? 1.1 : 1
              }}
              exit={{ opacity: 0, y: -60 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
            >
              <motion.div
                animate={controls}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isReady || isRefreshing ? 'bg-accent-1' : 'bg-bg-1'}
                  shadow-lg
                `}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Main content with native transitions */}
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        style={{
          transform: isPulling && !isRefreshing ? `translateY(${pullDistance}px)` : undefined,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </motion.div>

      {/* iOS-style safe area spacer */}
      <div className="h-safe-area-inset-bottom" />
    </div>
  );
}

/**
 * Mobile optimized button with haptic feedback
 */
interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  className?: string;
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  haptic = true,
  className = ''
}: MobileButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    
    // Haptic feedback
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    onClick?.();
  };

  const baseClasses = 'font-semibold rounded-xl transition-all active:scale-95 select-none';
  
  const variantClasses = {
    primary: 'bg-accent-1 text-bg-0 active:bg-accent-1/80',
    secondary: 'bg-bg-1 text-fg-0 active:bg-bg-1/80',
    danger: 'bg-danger text-white active:bg-danger/80'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const widthClasses = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${widthClasses}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}

/**
 * Mobile optimized card with gesture support
 */
interface MobileCardProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  swipeable?: boolean;
  onSwipeAway?: () => void;
  className?: string;
}

export function MobileCard({
  children,
  onPress,
  onLongPress,
  swipeable = false,
  onSwipeAway,
  className = ''
}: MobileCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const controls = useAnimation();

  const handlePress = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
    setIsPressed(true);
    onPress?.();
    
    setTimeout(() => setIsPressed(false), 150);
  };

  const handleDragEnd = async (event: any, info: any) => {
    const shouldDismiss = Math.abs(info.offset.x) > 100;
    
    if (shouldDismiss && swipeable) {
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
      
      await controls.start({
        x: info.offset.x > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.2 }
      });
      
      onSwipeAway?.();
    } else {
      controls.start({ x: 0, transition: { type: 'spring' } });
    }
  };

  return (
    <motion.div
      animate={controls}
      drag={swipeable ? 'x' : false}
      dragConstraints={{ left: -100, right: 100 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: onPress ? 0.98 : 1 }}
      onClick={handlePress}
      className={`
        card-neon p-4 cursor-pointer select-none
        ${isPressed ? 'ring-2 ring-accent-1' : ''}
        ${className}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Mobile optimized bottom sheet
 */
interface MobileBottomSheetProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  height?: 'auto' | 'half' | 'full';
}

export function MobileBottomSheet({
  children,
  isOpen,
  onClose,
  height = 'auto'
}: MobileBottomSheetProps) {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const heightClasses = {
    auto: 'max-h-[80vh]',
    half: 'h-1/2',
    full: 'h-full'
  };

  // Handle swipe down to close
  const { triggerHaptic } = useGestures(containerRef, {
    onSwipeDown: () => {
      triggerHaptic('light');
      onClose();
    },
    threshold: 50
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Sheet */}
          <motion.div
            ref={containerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              bg-bg-0 rounded-t-3xl overflow-hidden
              ${heightClasses[height]}
            `}
          >
            {/* Drag indicator */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-1 bg-fg-subtle/30 rounded-full" />
            </div>
            
            {/* Content */}
            <div className="pt-8 px-4 pb-safe h-full overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

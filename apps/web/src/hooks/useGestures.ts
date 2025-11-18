import { useEffect, useRef, useCallback, useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

interface UseGesturesOptions extends SwipeHandlers {
  threshold?: number; // Minimum distance for swipe
  velocity?: number; // Minimum velocity for swipe
  enableHaptic?: boolean; // Enable haptic feedback
}

/**
 * Custom hook for handling touch gestures on mobile
 */
export function useGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: UseGesturesOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocity = 0.3,
    enableHaptic = true
  } = options;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  /**
   * Trigger haptic feedback if supported
   */
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHaptic) return;
    
    // Check if Vibration API is supported
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
      }
    }
  }, [enableHaptic]);

  /**
   * Calculate swipe direction and velocity
   */
  const calculateSwipe = useCallback((start: TouchPoint, end: TouchPoint): SwipeDirection | null => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const deltaTime = end.time - start.time;
    
    const velocityX = Math.abs(deltaX / deltaTime);
    const velocityY = Math.abs(deltaY / deltaTime);
    
    // Check if swipe meets threshold and velocity requirements
    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
      return null;
    }
    
    if (Math.max(velocityX, velocityY) < velocity) {
      return null;
    }
    
    // Determine primary direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, [threshold, velocity]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      touchEnd.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      
      const touch = e.touches[0];
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = () => {
      if (!touchStart.current || !touchEnd.current) return;
      
      const direction = calculateSwipe(touchStart.current, touchEnd.current);
      
      if (direction) {
        triggerHaptic('light');
        
        switch (direction) {
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
        }
      }
      
      touchStart.current = null;
      touchEnd.current = null;
    };

    // Add event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [elementRef, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, calculateSwipe, triggerHaptic]);

  return { triggerHaptic };
}

/**
 * Hook for pull-to-refresh functionality
 */
export function usePullToRefresh(
  onRefresh: () => void | Promise<void>,
  options: { threshold?: number; enableHaptic?: boolean } = {}
) {
  const { threshold = 80, enableHaptic = true } = options;
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;
    
    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, threshold * 1.5));
      
      // Haptic feedback at threshold
      if (enableHaptic && distance > threshold && pullDistance <= threshold) {
        if ('vibrate' in navigator) {
          navigator.vibrate(15);
        }
      }
    }
  }, [isPulling, pullDistance, threshold, enableHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    if (pullDistance > threshold) {
      // Trigger refresh
      if (enableHaptic && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
      
      await onRefresh();
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [isPulling, pullDistance, threshold, onRefresh, enableHaptic]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    pullDistance,
    isReady: pullDistance > threshold
  };
}

/**
 * Hook for double tap detection
 */
export function useDoubleTap(
  onDoubleTap: () => void,
  options: { delay?: number; enableHaptic?: boolean } = {}
) {
  const { delay = 300, enableHaptic = true } = options;
  const lastTap = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    if (now - lastTap.current < delay) {
      // Double tap detected
      if (enableHaptic && 'vibrate' in navigator) {
        navigator.vibrate([10, 10, 10]);
      }
      onDoubleTap();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [delay, enableHaptic, onDoubleTap]);

  return { handleTap };
}

/**
 * Hook for long press detection
 */
export function useLongPress(
  onLongPress: () => void,
  options: { delay?: number; enableHaptic?: boolean } = {}
) {
  const { delay = 500, enableHaptic = true } = options;
  const timer = useRef<NodeJS.Timeout | null>(null);
  const isPressed = useRef(false);

  const handlePressStart = useCallback(() => {
    isPressed.current = true;
    timer.current = setTimeout(() => {
      if (isPressed.current) {
        if (enableHaptic && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
        onLongPress();
      }
    }, delay);
  }, [delay, enableHaptic, onLongPress]);

  const handlePressEnd = useCallback(() => {
    isPressed.current = false;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return {
    onTouchStart: handlePressStart,
    onTouchEnd: handlePressEnd,
    onTouchCancel: handlePressEnd,
    onMouseDown: handlePressStart,
    onMouseUp: handlePressEnd,
    onMouseLeave: handlePressEnd
  };
}

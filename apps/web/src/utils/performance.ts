/**
 * Performance optimization utilities
 */

/**
 * Lazy load component with loading fallback
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <React.Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}

/**
 * Measure React component render performance
 */
export function withPerformanceMonitoring<T extends {}>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return React.memo(function PerformanceMonitoredComponent(props: T) {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Longer than 1 frame at 60fps
        console.warn(`Slow render detected in ${componentName}:`, renderTime + 'ms');
      }
    });
    
    return <Component {...props} />;
  });
}

/**
 * Optimize large lists with virtualization
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  return {
    visibleItems,
    startIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight,
    setScrollTop,
  };
}

import { useState, useCallback } from 'react';
import { logger } from '../lib/logger';

interface ErrorState {
  error: string | null;
  hasError: boolean;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    hasError: false,
  });

  const setError = useCallback((error: string | Error | null) => {
    if (error === null) {
      setErrorState({ error: null, hasError: false });
      return;
    }

    const errorMessage = typeof error === 'string' ? error : error.message;
    
    setErrorState({
      error: errorMessage,
      hasError: true,
    });

    // Log error for monitoring
    logger.error('User error encountered', { error: errorMessage });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({ error: null, hasError: false });
  }, []);

  const handleAsyncError = useCallback(async (asyncFn: () => Promise<void>) => {
    try {
      await asyncFn();
    } catch (error) {
      setError(error as Error);
    }
  }, [setError]);

  return {
    error: errorState.error,
    hasError: errorState.hasError,
    setError,
    clearError,
    handleAsyncError,
  };
}

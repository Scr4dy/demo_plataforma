import { useState, useCallback } from 'react';
import { ApiError } from '../services/apiClient';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface UseApiOptions {
  initialData?: any;
  autoFetch?: boolean;
}

export const useApi = <T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) => {
  const { initialData = null, autoFetch = true } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: autoFetch,
    error: null,
    initialized: !autoFetch
  });

  const execute = useCallback(async (): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({
        data,
        loading: false,
        error: null,
        initialized: true
      });
      return data;
    } catch (err) {
      let errorMessage = 'Error desconocido';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        initialized: true
      }));
      
      return null;
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      initialized: false
    });
  }, [initialData]);

  const setData = useCallback((data: T) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    refetch: execute
  };
};

export const useApiMutation = <T, V = any>(
  mutation: (variables: V) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (variables: V): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await mutation(variables);
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      let errorMessage = 'Error desconocido';
      
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [mutation, options]);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    execute,
    reset
  };
};
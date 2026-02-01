
import { useState, useCallback } from 'react';

export const useRefreshState = (initialLoading = true) => {
  const [refreshing, setRefreshing] = useState(false);

  const startRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  const endRefresh = useCallback(() => {
    setRefreshing(false);
  }, []);

  return {
    refreshing,
    setRefreshing,
    startRefresh,
    endRefresh,
  };
};
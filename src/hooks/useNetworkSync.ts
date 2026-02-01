

import { useState, useEffect, useCallback } from 'react';
import { networkSyncService } from '../services/networkSyncService';
import { syncQueueService } from '../services/syncQueueService';
import { SyncState } from '../types/cache.types';
import { on } from '../utils/eventBus';

export function useNetworkSync() {
  const [syncState, setSyncState] = useState<SyncState>(syncQueueService.getState());
  const [isRefreshing, setIsRefreshing] = useState(false);

  
  useEffect(() => {
    
    setSyncState(syncQueueService.getState());

    const unsubscribe = on('sync:state', () => {
      try { setSyncState(syncQueueService.getState()); } catch (e) {  }
    });

    return () => { unsubscribe(); };
  }, []);

  
  const syncNow = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await networkSyncService.syncNow();
      setSyncState(syncQueueService.getState());
      return result;
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  
  const retryFailed = useCallback(async () => {
    await networkSyncService.retryFailed();
    setSyncState(syncQueueService.getState());
  }, []);

  
  const clearCompleted = useCallback(async () => {
    await networkSyncService.clearCompleted();
    setSyncState(syncQueueService.getState());
  }, []);

  
  const getStats = useCallback(() => {
    return networkSyncService.getSyncStats();
  }, []);

  return {
    syncState,
    isRefreshing,
    syncNow,
    retryFailed,
    clearCompleted,
    getStats,
  };
}

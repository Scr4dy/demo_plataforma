

import NetInfo from '@react-native-community/netinfo';
import { offlineCacheService } from './offlineCacheService';
import { syncQueueService } from './syncQueueService';
import { logger } from '../utils/logger';
import { SyncQueueAction } from '../types/cache.types';
import { DEFAULT_CACHE_CONFIG } from '../config/cache.config';

class NetworkSyncService {
  private isInitialized = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private unsubscribeNetInfo: (() => void) | null = null;

  
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.network.sync('NetworkSyncService ya inicializado');
      return;
    }

    try {
      
      await offlineCacheService.initialize();
      await syncQueueService.initialize();

      
      this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
        this.handleNetworkChange(state.isConnected || false);
      });

      
      const netState = await NetInfo.fetch();
      await syncQueueService.setOnlineStatus(netState.isConnected || false);

      
      if (DEFAULT_CACHE_CONFIG.enableAutoSync) {
        this.startAutoSync();
      }

      this.isInitialized = true;
      logger.network.sync('NetworkSyncService inicializado correctamente');
    } catch (error) {
      logger.network.error('Error al inicializar NetworkSyncService:', error);
      throw error;
    }
  }

  
  destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }

    this.stopAutoSync();
    this.isInitialized = false;

    logger.network.sync('NetworkSyncService detenido');
  }

  
  private async handleNetworkChange(isConnected: boolean): Promise<void> {
    logger.network.sync(`Red ${isConnected ? 'conectada' : 'desconectada'}`);
    
    await syncQueueService.setOnlineStatus(isConnected);

    
    if (isConnected) {
      logger.network.sync('Conexión restaurada, iniciando sync...');
      await this.syncNow();
    }
  }

  
  private startAutoSync(): void {
    if (this.syncTimer) {
      return;
    }

    this.syncTimer = setInterval(() => {
      const state = syncQueueService.getState();
      
      if (state.isOnline && state.pendingActions > 0 && !state.isSyncing) {
        logger.network.sync('Auto-sync activado');
        this.syncNow();
      }
    }, DEFAULT_CACHE_CONFIG.autoSyncInterval);

    logger.network.sync('Auto-sync iniciado');
  }

  
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      logger.network.sync('Auto-sync stopped');
    }
  }

  
  async syncNow(): Promise<{ success: number; failed: number }> {
    try {
      const state = syncQueueService.getState();

      if (!state.isOnline) {
        logger.network.sync('Cannot sync: offline');
        return { success: 0, failed: 0 };
      }

      if (state.isSyncing) {
        logger.network.sync('Sync already in progress');
        return { success: 0, failed: 0 };
      }

      logger.network.sync('Starting manual sync...');
      
      const result = await syncQueueService.syncAll(async (action) => {
        await this.executeSyncAction(action);
      });

      logger.network.sync(`Sync completed: ${result.success} success, ${result.failed} failed`);
      
      return result;
    } catch (error) {
      logger.network.error('Error in syncNow:', error);
      return { success: 0, failed: 0 };
    }
  }

  
  private async executeSyncAction(action: SyncQueueAction): Promise<void> {
    logger.network.sync(`Syncing action: ${action.type} ${action.entityType} ${action.entityId}`);

    
    
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 500));

      
      
      
      

      switch (action.entityType) {
        case 'courses':
          
          break;
        case 'certificates':
          
          break;
        case 'progress':
          
          break;
        
      }

      
      await offlineCacheService.invalidate(action.entityType);
      
      logger.network.sync(`Action synced: ${action.id}`);
    } catch (error) {
      logger.network.error(`Error syncing action ${action.id}:`, error);
      throw error;
    }
  }

  
  async getNetworkState(): Promise<{ isConnected: boolean; type: string }> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected || false,
      type: state.type,
    };
  }

  
  isOnline(): boolean {
    return syncQueueService.getState().isOnline;
  }

  
  getSyncStats() {
    const state = syncQueueService.getState();
    const queue = syncQueueService.getQueue();
    
    return {
      ...state,
      totalActions: queue.length,
      completedActions: queue.filter(a => a.status === 'completed').length,
      failedActions: queue.filter(a => a.status === 'failed').length,
    };
  }

  
  async retryFailed(): Promise<void> {
    await syncQueueService.retryFailed();
    
    
    if (this.isOnline()) {
      await this.syncNow();
    }
  }

  
  async clearCompleted(): Promise<void> {
    await syncQueueService.clearCompleted();
  }
}

export const networkSyncService = new NetworkSyncService();

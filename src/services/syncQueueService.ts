

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SyncQueueAction,
  SyncState,
  CacheEntityType,
} from '../types/cache.types';
import {
  CACHE_STORAGE_KEYS,
  MAX_SYNC_QUEUE_SIZE,
  RETRY_DELAYS,
} from '../config/cache.config';

import { logger } from '../utils/logger';
import { emit } from '../utils/eventBus';

class SyncQueueService {
  private queue: SyncQueueAction[] = [];
  private state: SyncState = {
    isSyncing: false,
    lastSyncTime: null,
    pendingActions: 0,
    hasErrors: false,
    isOnline: true,
  };
  private syncInProgress = false;

  
  async initialize(): Promise<void> {
    try {
      
      const savedQueue = await AsyncStorage.getItem(CACHE_STORAGE_KEYS.SYNC_QUEUE);
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
      }

      
      const savedState = await AsyncStorage.getItem(CACHE_STORAGE_KEYS.SYNC_STATE);
      if (savedState) {
        this.state = { ...this.state, ...JSON.parse(savedState) };
      }

      this.state.pendingActions = this.queue.filter(a => a.status === 'pending').length;
      await this.saveState();

      logger.info(`SyncQueueService initialized with ${this.queue.length} actions`);
    } catch (error) {
      logger.error('Error initializing sync queue:', error);
    }
  }

  
  async enqueue(
    type: 'create' | 'update' | 'delete',
    entityType: CacheEntityType,
    entityId: string | number,
    payload: any
  ): Promise<string> {
    try {
      
      if (this.queue.length >= MAX_SYNC_QUEUE_SIZE) {
        
        await this.pruneQueue();
      }

      const action: SyncQueueAction = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        entityType,
        entityId,
        payload,
        timestamp: Date.now(),
        retries: 0,
        status: 'pending',
      };

      this.queue.push(action);
      this.state.pendingActions++;

      await this.saveQueue();
      await this.saveState();

      logger.info(`Action enqueued: ${action.id}`);
      return action.id;
    } catch (error) {
      logger.error('Error enqueueing action:', error);
      throw error;
    }
  }

  
  getQueue(): SyncQueueAction[] {
    return [...this.queue];
  }

  
  getPendingActions(): SyncQueueAction[] {
    return this.queue.filter(action => action.status === 'pending');
  }

  
  getState(): SyncState {
    return { ...this.state };
  }

  
  async setOnlineStatus(isOnline: boolean): Promise<void> {
    this.state.isOnline = isOnline;
    await this.saveState();
  }

  
  async syncAll(
    syncHandler: (action: SyncQueueAction) => Promise<void>
  ): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      return { success: 0, failed: 0 };
    }

    if (!this.state.isOnline) {
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    this.state.isSyncing = true;
    await this.saveState();

    let successCount = 0;
    let failedCount = 0;

    const pendingActions = this.getPendingActions();
    logger.info(`Starting sync of ${pendingActions.length} actions`);

    for (const action of pendingActions) {
      try {
        
        action.status = 'syncing';
        await this.saveQueue();

        
        await syncHandler(action);

        
        action.status = 'completed';
        successCount++;

        logger.info(`Action synced successfully: ${action.id}`);
      } catch (error) {
        action.retries++;

        if (action.retries >= RETRY_DELAYS.length) {
          action.status = 'failed';
          action.error = error instanceof Error ? error.message : 'Unknown error';
          failedCount++;

          logger.error(`Action failed permanently: ${action.id}`, error);
        } else {
          action.status = 'pending';

          logger.warn(`Action failed, will retry: ${action.id}`, error);
        }
      }

      await this.saveQueue();
    }

    
    await this.pruneQueue();

    
    this.state.isSyncing = false;
    this.state.lastSyncTime = Date.now();
    this.state.pendingActions = this.queue.filter(a => a.status === 'pending').length;
    this.state.hasErrors = this.queue.some(a => a.status === 'failed');
    await this.saveState();

    this.syncInProgress = false;

    logger.info(`Sync completed: ${successCount} success, ${failedCount} failed`);
    return { success: successCount, failed: failedCount };
  }

  
  async retryFailed(): Promise<void> {
    const failedActions = this.queue.filter(action => action.status === 'failed');

    for (const action of failedActions) {
      action.status = 'pending';
      action.retries = 0;
      action.error = undefined;
    }

    this.state.pendingActions = this.queue.filter(a => a.status === 'pending').length;
    this.state.hasErrors = false;

    await this.saveQueue();
    await this.saveState();
  }

  
  async removeAction(actionId: string): Promise<void> {
    const index = this.queue.findIndex(a => a.id === actionId);

    if (index !== -1) {
      const action = this.queue[index];
      this.queue.splice(index, 1);

      if (action.status === 'pending') {
        this.state.pendingActions--;
      }

      await this.saveQueue();
      await this.saveState();
    }
  }

  
  private async pruneQueue(): Promise<void> {
    const completedActions = this.queue.filter(a => a.status === 'completed');

    
    const toRemove = completedActions
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, Math.max(0, completedActions.length - 20));

    this.queue = this.queue.filter(a => !toRemove.includes(a));

    await this.saveQueue();

    if (toRemove.length > 0) {
    }
  }

  
  async clearCompleted(): Promise<void> {
    const before = this.queue.length;
    this.queue = this.queue.filter(a => a.status !== 'completed');
    const removed = before - this.queue.length;

    await this.saveQueue();
  }

  
  async clearAll(): Promise<void> {
    this.queue = [];
    this.state.pendingActions = 0;
    this.state.hasErrors = false;

    await this.saveQueue();
    await this.saveState();
  }

  
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_STORAGE_KEYS.SYNC_QUEUE,
        JSON.stringify(this.queue)
      );
      try { emit('sync:state', this.state); } catch (e) { logger.warn('emit sync:state failed', e); }
    } catch (error) {
      logger.error('Error saving queue:', error);
    }
  }

  
  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        CACHE_STORAGE_KEYS.SYNC_STATE,
        JSON.stringify(this.state)
      );
      
      try { emit('sync:state', this.state); } catch (e) { logger.warn('emit sync:state failed', e); }
    } catch (error) {
      logger.error('Error saving state:', error);
    }
  }

  
  getActionsByEntity(entityType: CacheEntityType): SyncQueueAction[] {
    return this.queue.filter(action => action.entityType === entityType);
  }

  
  hasPendingActions(entityType: CacheEntityType, entityId?: string | number): boolean {
    return this.queue.some(
      action =>
        action.entityType === entityType &&
        action.status === 'pending' &&
        (entityId === undefined || action.entityId === entityId)
    );
  }
}

export const syncQueueService = new SyncQueueService();

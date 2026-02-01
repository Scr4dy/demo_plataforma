

import { CacheConfig } from '../types/cache.types';

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  
  defaultTTL: 5 * 60 * 1000,
  
  
  maxCacheSize: 50 * 1024 * 1024,
  
  
  enablePersistence: true,
  
  
  enableAutoSync: true,
  
  
  autoSyncInterval: 2 * 60 * 1000,
  
  
  maxRetries: 3,
};

export const CACHE_STORAGE_KEYS = {
  
  CACHE_PREFIX: '@flut_cache_',
  
  
  SYNC_QUEUE: '@flut_sync_queue',
  
  
  SYNC_STATE: '@flut_sync_state',
  
  
  CACHE_STATS: '@flut_cache_stats',
  
  
  CACHE_CONFIG: '@flut_cache_config',
  
  
  LAST_CLEANUP: '@flut_cache_last_cleanup',
};

export const CACHE_CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

export const RETRY_DELAYS = [
  1000,   
  5000,   
  15000,  
];

export const MAX_SYNC_QUEUE_SIZE = 100;

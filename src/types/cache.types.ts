

export type CacheEntityType = 
  | 'courses' 
  | 'categories' 
  | 'certificates' 
  | 'users' 
  | 'progress'
  | 'profile'
  | 'schema';

export type CacheStrategy = 
  | 'cache-first'     
  | 'network-first'   
  | 'cache-only'      
  | 'network-only';   

export interface CacheEntry<T = any> {
  
  key: string;
  
  
  data: T;
  
  
  timestamp: number;
  
  
  ttl: number;
  
  
  entityType: CacheEntityType;
  
  
  version?: string;
  
  
  metadata?: Record<string, any>;
}

export interface CacheOptions {
  
  strategy?: CacheStrategy;
  
  
  ttl?: number;
  
  
  forceRefresh?: boolean;
  
  
  allowStale?: boolean;
  
  
  version?: string;
}

export const CACHE_TTL: Record<CacheEntityType, number> = {
  courses: 10 * 60 * 1000,      
  categories: 30 * 60 * 1000,   
  certificates: 5 * 60 * 1000,  
  users: 15 * 60 * 1000,        
  progress: 2 * 60 * 1000,      
  profile: 5 * 60 * 1000,       
  schema: 24 * 60 * 60 * 1000,  
};

export interface SyncQueueAction {
  
  id: string;
  
  
  type: 'create' | 'update' | 'delete';
  
  
  entityType: CacheEntityType;
  
  
  entityId: string | number;
  
  
  payload: any;
  
  
  timestamp: number;
  
  
  retries: number;
  
  
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  
  
  error?: string;
}

export interface SyncState {
  
  isSyncing: boolean;
  
  
  lastSyncTime: number | null;
  
  
  pendingActions: number;
  
  
  hasErrors: boolean;
  
  
  isOnline: boolean;
}

export interface CacheConfig {
  
  defaultTTL: number;
  
  
  maxCacheSize: number;
  
  
  enablePersistence: boolean;
  
  
  enableAutoSync: boolean;
  
  
  autoSyncInterval: number;
  
  
  maxRetries: number;
}

export interface CacheResult<T = any> {
  
  data: T | null;
  
  
  fromCache: boolean;
  
  
  isStale: boolean;
  
  
  timestamp: number | null;
  
  
  error?: string;
}

export interface CacheStats {
  
  entries: number;
  
  
  size: number;
  
  
  hits: number;
  
  
  misses: number;
  
  
  hitRate: number;
  
  
  lastCleanup: number | null;
}

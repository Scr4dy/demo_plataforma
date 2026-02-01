

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CacheEntry,
  CacheEntityType,
  CacheOptions,
  CacheResult,
  CacheStats,
  CacheStrategy,
} from '../types/cache.types';
import {
  DEFAULT_CACHE_CONFIG,
  CACHE_STORAGE_KEYS,
  CACHE_CLEANUP_INTERVAL,
} from '../config/cache.config';

class OfflineCacheService {
  private config = DEFAULT_CACHE_CONFIG;
  private stats: CacheStats = {
    entries: 0,
    size: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    lastCleanup: null,
  };

  
  async initialize(): Promise<void> {
    try {
      
      const savedConfig = await AsyncStorage.getItem(CACHE_STORAGE_KEYS.CACHE_CONFIG);
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      
      const savedStats = await AsyncStorage.getItem(CACHE_STORAGE_KEYS.CACHE_STATS);
      if (savedStats) {
        this.stats = JSON.parse(savedStats);
      }

      
      this.scheduleAutoCleanup();
    } catch (error) {
      
    }
  }

  
  private getCacheKey(entityType: CacheEntityType, id?: string | number): string {
    const suffix = id ? `_${id}` : '_all';
    return `${CACHE_STORAGE_KEYS.CACHE_PREFIX}${entityType}${suffix}`;
  }

  
  async set<T>(
    entityType: CacheEntityType,
    data: T,
    id?: string | number,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const key = this.getCacheKey(entityType, id);
      const ttl = options?.ttl || this.config.defaultTTL;

      const entry: CacheEntry<T> = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
        entityType,
        version: options?.version,
        metadata: {},
      };

      await AsyncStorage.setItem(key, JSON.stringify(entry));

      
      this.stats.entries++;
      await this.updateStats();
    } catch (error) {
      
      throw error;
    }
  }

  
  async get<T>(
    entityType: CacheEntityType,
    id?: string | number,
    options?: CacheOptions
  ): Promise<CacheResult<T>> {
    try {
      const key = this.getCacheKey(entityType, id);
      const cached = await AsyncStorage.getItem(key);

      if (!cached) {
        this.stats.misses++;
        await this.updateStats();

        return {
          data: null,
          fromCache: false,
          isStale: false,
          timestamp: null,
        };
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const age = Date.now() - entry.timestamp;
      const isStale = age > entry.ttl;

      
      if (isStale && !options?.allowStale) {
        this.stats.misses++;
        await this.updateStats();

        return {
          data: null,
          fromCache: false,
          isStale: true,
          timestamp: entry.timestamp,
        };
      }

      
      if (options?.version && entry.version !== options.version) {
        this.stats.misses++;
        await this.updateStats();

        return {
          data: null,
          fromCache: false,
          isStale: true,
          timestamp: entry.timestamp,
        };
      }

      this.stats.hits++;
      await this.updateStats();

      return {
        data: entry.data,
        fromCache: true,
        isStale,
        timestamp: entry.timestamp,
      };
    } catch (error) {
      

      return {
        data: null,
        fromCache: false,
        isStale: false,
        timestamp: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  
  async remove(entityType: CacheEntityType, id?: string | number): Promise<void> {
    try {
      const key = this.getCacheKey(entityType, id);
      await AsyncStorage.removeItem(key);

      this.stats.entries = Math.max(0, this.stats.entries - 1);
      await this.updateStats();
    } catch (error) {
      
    }
  }

  
  async invalidate(entityType: CacheEntityType): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefix = `${CACHE_STORAGE_KEYS.CACHE_PREFIX}${entityType}`;
      const keysToRemove = keys.filter(key => key.startsWith(prefix));

      await AsyncStorage.multiRemove(keysToRemove);

      this.stats.entries = Math.max(0, this.stats.entries - keysToRemove.length);
      await this.updateStats();
    } catch (error) {
      
    }
  }

  
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_STORAGE_KEYS.CACHE_PREFIX));

      await AsyncStorage.multiRemove(cacheKeys);

      this.stats.entries = 0;
      this.stats.size = 0;
      this.stats.hits = 0;
      this.stats.misses = 0;
      this.stats.hitRate = 0;
      await this.updateStats();
    } catch (error) {
      
    }
  }

  
  async cleanup(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_STORAGE_KEYS.CACHE_PREFIX));

      let removedCount = 0;

      for (const key of cacheKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (!cached) continue;

          const entry: CacheEntry = JSON.parse(cached);
          const age = Date.now() - entry.timestamp;

          if (age > entry.ttl) {
            await AsyncStorage.removeItem(key);
            removedCount++;
          }
        } catch (error) {
          
          await AsyncStorage.removeItem(key);
          removedCount++;
        }
      }

      this.stats.entries = Math.max(0, this.stats.entries - removedCount);
      this.stats.lastCleanup = Date.now();
      await this.updateStats();
      return removedCount;
    } catch (error) {
      
      return 0;
    }
  }

  
  private scheduleAutoCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, CACHE_CLEANUP_INTERVAL);
  }

  
  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  
  private async updateStats(): Promise<void> {
    try {
      
      const total = this.stats.hits + this.stats.misses;
      this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;

      await AsyncStorage.setItem(
        CACHE_STORAGE_KEYS.CACHE_STATS,
        JSON.stringify(this.stats)
      );
    } catch (error) {
      
    }
  }

  
  async getOrFetch<T>(
    entityType: CacheEntityType,
    fetchFn: () => Promise<T>,
    id?: string | number,
    options?: CacheOptions
  ): Promise<T> {
    const strategy = options?.strategy || 'cache-first';

    try {
      switch (strategy) {
        case 'cache-only': {
          const result = await this.get<T>(entityType, id, options);
          if (!result.data) {
            throw new Error('No cache available and cache-only strategy specified');
          }
          return result.data;
        }

        case 'network-only': {
          const data = await fetchFn();
          await this.set(entityType, data, id, options);
          return data;
        }

        case 'network-first': {
          try {
            const data = await fetchFn();
            await this.set(entityType, data, id, options);
            return data;
          } catch (error) {
            const result = await this.get<T>(entityType, id, { ...options, allowStale: true });
            if (result.data) {
              return result.data;
            }
            throw error;
          }
        }

        case 'cache-first':
        default: {
          if (options?.forceRefresh) {
            const data = await fetchFn();
            await this.set(entityType, data, id, options);
            return data;
          }

          const result = await this.get<T>(entityType, id, options);

          if (result.data && !result.isStale) {
            return result.data;
          }

          try {
            const data = await fetchFn();
            await this.set(entityType, data, id, options);
            return data;
          } catch (error) {
            if (result.data) {
              return result.data;
            }
            throw error;
          }
        }
      }
    } catch (error) {
      
      throw error;
    }
  }
}

export const offlineCacheService = new OfflineCacheService();

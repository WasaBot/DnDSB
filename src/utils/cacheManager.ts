/**
 * Cache management utilities for the D&D Spellbook app
 */

export interface CacheStatus {
  isOnline: boolean;
  cacheAvailable: boolean;
  lastSync?: Date;
}

export class CacheManager {
  private static instance: CacheManager;
  private onlineStatus: boolean = navigator.onLine;
  private cacheStatusListeners: ((status: CacheStatus) => void)[] = [];

  constructor() {
    this.setupOnlineListeners();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private setupOnlineListeners() {
    window.addEventListener('online', () => {
      this.onlineStatus = true;
      this.notifyStatusChange();
    });

    window.addEventListener('offline', () => {
      this.onlineStatus = false;
      this.notifyStatusChange();
    });
  }

  /**
   * Check if Supabase cache is available
   */
  async isCacheAvailable(): Promise<boolean> {
    if (!('caches' in window)) return false;
    
    try {
      const cache = await caches.open('supabase-api-v2');
      const keys = await cache.keys();
      return keys.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get current cache status
   */
  async getCacheStatus(): Promise<CacheStatus> {
    const cacheAvailable = await this.isCacheAvailable();
    
    return {
      isOnline: this.onlineStatus,
      cacheAvailable,
      lastSync: this.getLastSyncTime()
    };
  }

  /**
   * Clear all Supabase API cache
   */
  async clearSupabaseCache(): Promise<void> {
    if (!('caches' in window)) return;
    
    try {
      await caches.delete('supabase-api-v2');
      console.log('Supabase cache cleared');
    } catch (error) {
      console.error('Failed to clear Supabase cache:', error);
    }
  }

  /**
   * Force refresh specific table data
   */
  async refreshTable(tableName: string): Promise<void> {
    if (!('caches' in window)) return;
    
    try {
      const cache = await caches.open('supabase-api-v2');
      const keys = await cache.keys();
      
      // Delete all cached entries for this table
      const tableRequests = keys.filter(request => 
        request.url.includes(`/rest/v1/${tableName}`)
      );
      
      await Promise.all(
        tableRequests.map(request => cache.delete(request))
      );
      
      console.log(`Cache cleared for table: ${tableName}`);
    } catch (error) {
      console.error(`Failed to refresh table ${tableName}:`, error);
    }
  }

  /**
   * Subscribe to cache status changes
   */
  onStatusChange(callback: (status: CacheStatus) => void): () => void {
    this.cacheStatusListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.cacheStatusListeners.indexOf(callback);
      if (index > -1) {
        this.cacheStatusListeners.splice(index, 1);
      }
    };
  }

  private notifyStatusChange() {
    this.getCacheStatus().then(status => {
      this.cacheStatusListeners.forEach(callback => callback(status));
    });
  }

  private getLastSyncTime(): Date | undefined {
    try {
      const lastSync = localStorage.getItem('lastSupabaseSync');
      return lastSync ? new Date(lastSync) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Update last sync time
   */
  updateLastSyncTime(): void {
    try {
      localStorage.setItem('lastSupabaseSync', new Date().toISOString());
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Get cache size information
   */
  async getCacheInfo(): Promise<{ entries: number; tables: string[] }> {
    if (!('caches' in window)) {
      return { entries: 0, tables: [] };
    }

    try {
      const cache = await caches.open('supabase-api-v2');
      const keys = await cache.keys();
      
      const tables = new Set<string>();
      keys.forEach(request => {
        const match = request.url.match(/\/rest\/v1\/([^?]+)/);
        if (match) {
          tables.add(match[1]);
        }
      });

      return {
        entries: keys.length,
        tables: Array.from(tables)
      };
    } catch {
      return { entries: 0, tables: [] };
    }
  }
}

export default CacheManager.getInstance();

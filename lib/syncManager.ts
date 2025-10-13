/**
 * Sync Manager for Online/Offline Synchronization
 * Handles syncing data between IndexedDB and MongoDB
 */

import { db, LocalNovel, LocalChapter, SyncQueueItem } from '@/lib/db';
import { Novel, ChapterWithNavigation, ApiResponse } from '@/types';

export class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private syncCallbacks: Set<(status: SyncStatus) => void> = new Set();

  private constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  // Subscribe to sync status updates
  onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.syncCallbacks.add(callback);
    return () => this.syncCallbacks.delete(callback);
  }

  private notifySyncStatus(status: SyncStatus): void {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  private async handleOnline(): Promise<void> {
    console.log('🌐 Connection restored - starting auto sync');
    const settings = await db.settings.get('user-settings');
    if (settings?.autoSync) {
      await this.syncAll();
    }
  }

  private handleOffline(): void {
    console.log('📡 Connection lost - switching to offline mode');
  }

  // Check if online
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Sync all data
  async syncAll(showProgress = true): Promise<SyncResult> {
    if (this.isSyncing) {
      return { 
        success: false, 
        error: 'Sync already in progress',
        novelsSynced: 0,
        chaptersSynced: 0,
        errors: []
      };
    }

    this.isSyncing = true;
    
    if (showProgress) {
      this.notifySyncStatus({ type: 'started', message: 'Starting sync...' });
    }

    const result: SyncResult = {
      success: true,
      novelsSynced: 0,
      chaptersSynced: 0,
      errors: []
    };

    try {
      // Step 1: Process sync queue (upload local changes)
      await this.processSyncQueue(result);

      // Step 2: Download novels from server
      await this.downloadNovels(result);

      // Step 3: Download chapters for cached novels
      await this.downloadChapters(result);

      // Update last sync time
      await db.settings.update('user-settings', {
        lastSyncTime: new Date()
      });

      if (showProgress) {
        this.notifySyncStatus({
          type: 'completed',
          message: `Sync completed: ${result.novelsSynced} novels, ${result.chaptersSynced} chapters`
        });
      }

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (showProgress) {
        this.notifySyncStatus({
          type: 'error',
          message: `Sync failed: ${result.error}`
        });
      }
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  // Process sync queue
  private async processSyncQueue(result: SyncResult): Promise<void> {
    const queueItems = await db.syncQueue.toArray();
    
    for (const item of queueItems) {
      try {
        await this.processSyncItem(item);
        await db.syncQueue.delete(item.id!);
      } catch (error) {
        result.errors.push(`Failed to sync ${item.entityType} ${item.entityId}`);
        
        // Update retry count
        await db.syncQueue.update(item.id!, {
          retryCount: item.retryCount + 1,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  // Process individual sync item
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    // This would normally make API calls to sync with server
    // For now, we'll just mark items as synced
    console.log(`Processing sync item: ${item.action} ${item.entityType} ${item.entityId}`);
  }

  // Download novels from server
  private async downloadNovels(result: SyncResult): Promise<void> {
    if (!this.isOnline()) return;

    try {
      const response = await fetch('/api/novels');
      const data: ApiResponse<Novel[]> = await response.json();

      if (data.success && data.data) {
        for (const novel of data.data) {
          const localNovel: LocalNovel = {
            ...novel,
            synced: true,
            lastSyncedAt: new Date(),
            locallyModified: false,
            locallyDeleted: false
          };

          await db.novels.put(localNovel);
          result.novelsSynced++;
        }
      }
    } catch (error) {
      console.error('Error downloading novels:', error);
      throw error;
    }
  }

  // Download chapters for novels
  private async downloadChapters(result: SyncResult): Promise<void> {
    if (!this.isOnline()) return;

    const settings = await db.settings.get('user-settings');
    const downloadedNovels = settings?.downloadedNovels || [];

    for (const novelId of downloadedNovels) {
      try {
        const response = await fetch(`/api/novel/${novelId}/chapters`);
        const data: ApiResponse<ChapterWithNavigation[]> = await response.json();

        if (data.success && data.data) {
          for (const chapter of data.data) {
            const localChapter: LocalChapter = {
              ...chapter,
              synced: true,
              lastSyncedAt: new Date(),
              locallyModified: false,
              locallyDeleted: false
            };

            await db.chapters.put(localChapter);
            result.chaptersSynced++;
          }
        }
      } catch (error) {
        console.error(`Error downloading chapters for novel ${novelId}:`, error);
      }
    }
  }

  // Get novel from local DB or server
  async getNovel(novelId: string): Promise<LocalNovel | null> {
    // Try local first
    const local = await db.novels.get(novelId);
    if (local) return local;

    // Fetch from server if online
    if (this.isOnline()) {
      try {
        const response = await fetch(`/api/novel/${novelId}`);
        const data: ApiResponse<Novel> = await response.json();

        if (data.success && data.data) {
          const localNovel: LocalNovel = {
            ...data.data,
            synced: true,
            lastSyncedAt: new Date(),
            locallyModified: false,
            locallyDeleted: false
          };

          await db.novels.put(localNovel);
          return localNovel;
        }
      } catch (error) {
        console.error('Error fetching novel from server:', error);
      }
    }

    return null;
  }

  // Get chapter from local DB or server
  async getChapter(chapterId: string): Promise<LocalChapter | null> {
    // Try local first
    const local = await db.chapters.get(chapterId);
    if (local) return local;

    // Fetch from server if online
    if (this.isOnline()) {
      try {
        const response = await fetch(`/api/chapter/${chapterId}`);
        const data: ApiResponse<ChapterWithNavigation> = await response.json();

        if (data.success && data.data) {
          const localChapter: LocalChapter = {
            ...data.data,
            synced: true,
            lastSyncedAt: new Date(),
            locallyModified: false,
            locallyDeleted: false
          };

          await db.chapters.put(localChapter);
          return localChapter;
        }
      } catch (error) {
        console.error('Error fetching chapter from server:', error);
      }
    }

    return null;
  }

  // Mark novel for offline download
  async downloadNovelForOffline(novelId: string): Promise<void> {
    const settings = await db.settings.get('user-settings');
    const downloadedNovels = settings?.downloadedNovels || [];

    if (!downloadedNovels.includes(novelId)) {
      downloadedNovels.push(novelId);
      await db.settings.update('user-settings', { downloadedNovels });
    }

    // Download all chapters for this novel
    if (this.isOnline()) {
      const result: SyncResult = {
        success: true,
        novelsSynced: 0,
        chaptersSynced: 0,
        errors: []
      };

      await this.downloadChapters(result);
    }
  }

  // Remove novel from offline storage
  async removeNovelFromOffline(novelId: string): Promise<void> {
    const settings = await db.settings.get('user-settings');
    const downloadedNovels = settings?.downloadedNovels || [];

    const index = downloadedNovels.indexOf(novelId);
    if (index > -1) {
      downloadedNovels.splice(index, 1);
      await db.settings.update('user-settings', { downloadedNovels });
    }

    // Remove chapters
    await db.chapters.where('novel_id').equals(novelId).delete();
  }
}

// Types
export interface SyncStatus {
  type: 'started' | 'progress' | 'completed' | 'error';
  message: string;
  progress?: number;
}

export interface SyncResult {
  success: boolean;
  novelsSynced: number;
  chaptersSynced: number;
  errors: string[];
  error?: string;
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();

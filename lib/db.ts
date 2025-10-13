/**
 * IndexedDB Database using Dexie.js
 * Provides offline storage for novels, chapters, and sync queue
 */

import Dexie, { Table } from 'dexie';
import { Novel, ChapterWithNavigation } from '@/types';

// Extended types for local storage
export interface LocalNovel extends Novel {
  synced: boolean;
  lastSyncedAt?: Date;
  locallyModified: boolean;
  locallyDeleted: boolean;
}

export interface LocalChapter extends ChapterWithNavigation {
  synced: boolean;
  lastSyncedAt?: Date;
  locallyModified: boolean;
  locallyDeleted: boolean;
}

export interface SyncQueueItem {
  id?: number;
  action: 'create' | 'update' | 'delete';
  entityType: 'novel' | 'chapter';
  entityId: string;
  data?: LocalNovel | LocalChapter;
  timestamp: Date;
  retryCount: number;
  lastError?: string;
}

export interface UserSettings {
  id: string;
  fontSize: number;
  theme: 'light' | 'dark' | 'auto';
  autoSync: boolean;
  lastSyncTime?: Date;
  downloadedNovels: string[];
}

// Dexie Database Class
export class LiveNovelDB extends Dexie {
  novels!: Table<LocalNovel, string>;
  chapters!: Table<LocalChapter, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('LiveNovelDB');
    
    // Define database schema
    this.version(1).stores({
      novels: '_id, novel_id, title, author, status, synced, locallyModified, locallyDeleted',
      chapters: '_id, chapter_id, novel_id, order, synced, locallyModified, locallyDeleted',
      syncQueue: '++id, action, entityType, entityId, timestamp',
      settings: 'id'
    });
  }
}

// Create singleton instance
export const db = new LiveNovelDB();

/**
 * Database Helper Functions
 */

// Initialize default settings
export async function initializeSettings(): Promise<void> {
  const existing = await db.settings.get('user-settings');
  
  if (!existing) {
    await db.settings.add({
      id: 'user-settings',
      fontSize: 18,
      theme: 'auto',
      autoSync: true,
      downloadedNovels: []
    });
  }
}

// Get user settings
export async function getUserSettings(): Promise<UserSettings> {
  const settings = await db.settings.get('user-settings');
  
  if (!settings) {
    await initializeSettings();
    return getUserSettings();
  }
  
  return settings;
}

// Update user settings
export async function updateUserSettings(updates: Partial<UserSettings>): Promise<void> {
  await db.settings.update('user-settings', updates);
}

// Clear all local data (for logout or reset)
export async function clearAllLocalData(): Promise<void> {
  await db.novels.clear();
  await db.chapters.clear();
  await db.syncQueue.clear();
}

// Get database statistics
export async function getDBStats() {
  const [novelCount, chapterCount, queueCount] = await Promise.all([
    db.novels.count(),
    db.chapters.count(),
    db.syncQueue.count()
  ]);
  
  const unsyncedNovels = await db.novels.where('synced').equals(0).count();
  const unsyncedChapters = await db.chapters.where('synced').equals(0).count();
  
  return {
    novels: {
      total: novelCount,
      unsynced: unsyncedNovels
    },
    chapters: {
      total: chapterCount,
      unsynced: unsyncedChapters
    },
    syncQueue: queueCount
  };
}

// Export db instance as default
export default db;

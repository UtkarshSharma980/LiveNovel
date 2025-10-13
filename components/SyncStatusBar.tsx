'use client';

import { useState, useEffect } from 'react';
import { syncManager, SyncStatus } from '@/lib/syncManager';
import { getDBStats } from '@/lib/db';

export default function SyncStatusBar() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<{
    novels: { total: number; unsynced: number };
    chapters: { total: number; unsynced: number };
    syncQueue: number;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync status
    const unsubscribe = syncManager.onSyncStatusChange((status) => {
      setSyncStatus(status);
      setIsSyncing(status.type === 'started' || status.type === 'progress');
      
      // Clear status message after 3 seconds
      if (status.type === 'completed' || status.type === 'error') {
        setTimeout(() => setSyncStatus(null), 3000);
      }
    });

    // Load stats
    loadStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const loadStats = async () => {
    const dbStats = await getDBStats();
    setStats(dbStats);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncManager.syncAll(true);
    await loadStats();
    setIsSyncing(false);
  };

  return (
    <>
      {/* Main Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Status Indicator */}
            <div className="flex items-center space-x-3">
              {/* Online/Offline Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Sync Status Message */}
              {syncStatus && (
                <div className="flex items-center space-x-2">
                  {syncStatus.type === 'started' || syncStatus.type === 'progress' ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                  ) : syncStatus.type === 'completed' ? (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {syncStatus.message}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Show details"
              >
                <svg
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Sync Button */}
              <button
                onClick={handleSync}
                disabled={isSyncing || !isOnline}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium touch-manipulation"
              >
                <svg
                  className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Details Panel */}
          {showDetails && stats && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.novels.total}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Novels Cached
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.chapters.total}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Chapters Offline
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.syncQueue}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Pending Syncs
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.novels.unsynced + stats.chapters.unsynced}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Unsynced Changes
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from being hidden under fixed bar */}
      <div className={showDetails ? 'h-32' : 'h-16'} />
    </>
  );
}

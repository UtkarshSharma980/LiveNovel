'use client';

import { useEffect } from 'react';
import { initializeSettings } from '@/lib/db';

/**
 * Client component to initialize IndexedDB on app load
 */
export default function DBInitializer() {
  useEffect(() => {
    const init = async () => {
      try {
        await initializeSettings();
        console.log('📦 IndexedDB initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize IndexedDB:', error);
      }
    };

    init();
  }, []);

  return null; // This component doesn't render anything
}

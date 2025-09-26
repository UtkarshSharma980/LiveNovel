// Bookmark utilities for localStorage
export interface Bookmark {
  novel_id: string;
  chapter_id: string;  // Changed from number to string to match our data
  chapter_title: string;
  timestamp: number;
}

export class BookmarkManager {
  private static getStorageKey(novel_id: string): string {
    return `bookmark_${novel_id}`;
  }

  // Save bookmark for a novel
  static saveBookmark(novel_id: string, chapter_id: string, chapter_title: string): void {
    if (typeof window === 'undefined') return; // Server-side guard
    
    const bookmark: Bookmark = {
      novel_id,
      chapter_id,
      chapter_title,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(this.getStorageKey(novel_id), JSON.stringify(bookmark));
    } catch (error) {
      console.error('Failed to save bookmark:', error);
    }
  }

  // Get bookmark for a novel
  static getBookmark(novel_id: string): Bookmark | null {
    if (typeof window === 'undefined') return null; // Server-side guard
    
    try {
      const stored = localStorage.getItem(this.getStorageKey(novel_id));
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get bookmark:', error);
      return null;
    }
  }

  // Remove bookmark for a novel
  static removeBookmark(novel_id: string): void {
    if (typeof window === 'undefined') return; // Server-side guard
    
    try {
      localStorage.removeItem(this.getStorageKey(novel_id));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  }

  // Get all bookmarks
  static getAllBookmarks(): Bookmark[] {
    if (typeof window === 'undefined') return []; // Server-side guard
    
    const bookmarks: Bookmark[] = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('bookmark_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            bookmarks.push(JSON.parse(stored));
          }
        }
      }
    } catch (error) {
      console.error('Failed to get all bookmarks:', error);
    }
    
    return bookmarks.sort((a, b) => b.timestamp - a.timestamp);
  }
}
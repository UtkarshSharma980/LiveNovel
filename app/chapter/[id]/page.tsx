'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ChapterWithNavigation, ApiResponse } from '@/types';
import { BookmarkManager } from '@/lib/bookmarks';
import { LoadingState, ErrorState } from '@/components/LoadingStates';

// Chapter cache for preloading
interface ChapterCache {
  [key: string]: ChapterWithNavigation;
}

export default function ChapterPage() {
  const params = useParams();
  const chapter_id = params.id as string;
  
  const [chapter, setChapter] = useState<ChapterWithNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Cache for preloaded chapters
  const cacheRef = useRef<ChapterCache>({});
  const preloadingRef = useRef<Set<string>>(new Set());

  const fetchChapter = useCallback(async (id: string, useCache: boolean = true): Promise<ChapterWithNavigation | null> => {
    // Check cache first
    if (useCache && cacheRef.current[id]) {
      return cacheRef.current[id];
    }

    try {
      const response = await fetch(`/api/chapter/${id}`);
      const data: ApiResponse<ChapterWithNavigation> = await response.json();
      
      if (data.success && data.data) {
        // Store in cache
        cacheRef.current[id] = data.data;
        return data.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching chapter:', err);
      return null;
    }
  }, []);

  // Preload adjacent chapters
  const preloadChapter = useCallback(async (id: string) => {
    if (!id || preloadingRef.current.has(id) || cacheRef.current[id]) {
      return;
    }

    preloadingRef.current.add(id);
    try {
      await fetchChapter(id, false);
    } finally {
      preloadingRef.current.delete(id);
    }
  }, [fetchChapter]);

  const loadCurrentChapter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const chapterData = await fetchChapter(chapter_id);
      
      if (chapterData) {
        setChapter(chapterData);
        
        // Auto-bookmark this chapter
        BookmarkManager.saveBookmark(
          chapterData.novel_id.toString(),
          chapterData.chapter_id.toString(),
          chapterData.title
        );
        
        // Scroll to top when chapter changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Preload adjacent chapters
        if (chapterData.next_chapter_id) {
          setTimeout(() => preloadChapter(String(chapterData.next_chapter_id)), 100);
        }
        if (chapterData.prev_chapter_id) {
          setTimeout(() => preloadChapter(String(chapterData.prev_chapter_id)), 200);
        }
      } else {
        setError('Failed to fetch chapter');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading chapter:', err);
    } finally {
      setLoading(false);
    }
  }, [chapter_id, fetchChapter, preloadChapter]);

  useEffect(() => {
    if (chapter_id) {
      loadCurrentChapter();
    }
  }, [chapter_id, loadCurrentChapter]);

  // Enhanced navigation with page refresh
  const navigateToChapter = useCallback((targetChapterId: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Force page refresh for better UX
    window.location.href = `/chapter/${targetChapterId}`;
  }, [isNavigating]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isNavigating) return;
    
    if (event.key === 'ArrowLeft' && chapter?.prev_chapter_id) {
      event.preventDefault();
      navigateToChapter(String(chapter.prev_chapter_id));
    } else if (event.key === 'ArrowRight' && chapter?.next_chapter_id) {
      event.preventDefault();
      navigateToChapter(String(chapter.next_chapter_id));
    }
  }, [chapter, navigateToChapter, isNavigating]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Touch navigation for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStartX.current - touchEndX;
    const deltaY = touchStartY.current - touchEndY;
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && chapter?.next_chapter_id) {
        // Swipe left - go to next chapter
        navigateToChapter(String(chapter.next_chapter_id));
      } else if (deltaX < 0 && chapter?.prev_chapter_id) {
        // Swipe right - go to previous chapter
        navigateToChapter(String(chapter.prev_chapter_id));
      }
    }
    
    touchStartX.current = null;
    touchStartY.current = null;
  }, [chapter, navigateToChapter]);

  if (loading) {
    return <LoadingState>Loading chapter...</LoadingState>;
  }

  if (error || !chapter) {
    return (
      <ErrorState
        title="Chapter not found"
        message={error || 'The requested chapter could not be found'}
        onRetry={loadCurrentChapter}
      />
    );
  }

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div 
      className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Chapter Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 break-words">
              Chapter {chapter.chapter_id}: {chapter.title}
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <span>{chapter.word_count} words</span>
              <span>{chapter.character_count} characters</span>
            </div>
          </div>
          
          {/* Font Size Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={decreaseFontSize}
              className="p-2 sm:p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm touch-manipulation"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-1 sm:px-2 min-w-[40px] text-center">
              {fontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              className="p-2 sm:p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm touch-manipulation"
              title="Increase font size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex space-x-1 sm:space-x-2">
            {chapter.prev_chapter_id ? (
              <button
                onClick={() => navigateToChapter(String(chapter.prev_chapter_id))}
                disabled={isNavigating}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base touch-manipulation min-h-[44px] justify-center"
              >
                <span>←</span>
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-3 sm:px-4 py-2 rounded-lg cursor-not-allowed text-sm sm:text-base min-h-[44px] justify-center">
                <span>←</span>
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </div>
            )}

            <button
              onClick={() => window.location.href = `/novel/${chapter.novel_id}`}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <span className="hidden sm:inline">Chapter List</span>
              <span className="sm:hidden">List</span>
            </button>
          </div>

          {chapter.next_chapter_id ? (
            <button
              onClick={() => navigateToChapter(String(chapter.next_chapter_id))}
              disabled={isNavigating}
              className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base touch-manipulation min-h-[44px] justify-center"
            >
              <span className="hidden xs:inline">Next</span>
              <span className="xs:hidden">Next</span>
              <span>→</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-3 sm:px-4 py-2 rounded-lg cursor-not-allowed text-sm sm:text-base min-h-[44px] justify-center">
              <span className="hidden xs:inline">Next</span>
              <span className="xs:hidden">Next</span>
              <span>→</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Touch Navigation Hint */}
      <div className="block sm:hidden bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 text-center">
        <p className="text-xs text-blue-600 dark:text-blue-400">
          💡 Swipe left/right to navigate chapters
        </p>
      </div>

      {/* Chapter Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-8 mb-4 sm:mb-8">
        <div 
          className="prose prose-gray dark:prose-invert max-w-none leading-relaxed prose-sm sm:prose-base"
          style={{ 
            fontSize: `${fontSize}px`,
            lineHeight: '1.6',
          }}
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="mb-3 sm:mb-4 text-justify break-words">
                {paragraph.trim()}
              </p>
            ) : (
              <br key={index} />
            )
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 sticky bottom-2 sm:static">
        <div className="flex items-center justify-between">
          {chapter.prev_chapter_id ? (
            <button
              onClick={() => navigateToChapter(String(chapter.prev_chapter_id))}
              disabled={isNavigating}
              className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <span>←</span>
              <span className="hidden sm:inline">Previous Chapter</span>
              <span className="sm:hidden">Previous</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="text-center px-2">
            <div className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 mb-2">
              Use ← → arrow keys to navigate
            </div>
            <button
              onClick={() => window.location.href = `/novel/${chapter.novel_id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base touch-manipulation"
            >
              Back to Novel
            </button>
          </div>

          {chapter.next_chapter_id ? (
            <button
              onClick={() => navigateToChapter(String(chapter.next_chapter_id))}
              disabled={isNavigating}
              className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <span className="hidden sm:inline">Next Chapter</span>
              <span className="sm:hidden">Next</span>
              <span>→</span>
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
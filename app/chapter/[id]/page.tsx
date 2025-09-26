'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChapterWithNavigation, ApiResponse } from '@/types';
import { BookmarkManager } from '@/lib/bookmarks';
import { LoadingState, ErrorState } from '@/components/LoadingStates';

export default function ChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapter_id = params.id as string;
  
  const [chapter, setChapter] = useState<ChapterWithNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(18);

  const fetchChapter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/chapter/${chapter_id}`);
      const data: ApiResponse<ChapterWithNavigation> = await response.json();
      
      if (data.success && data.data) {
        setChapter(data.data);
        
        // Auto-bookmark this chapter
        BookmarkManager.saveBookmark(
          data.data.novel_id.toString(),
          data.data.chapter_id.toString(),
          data.data.title
        );
        
        // Scroll to top when chapter changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError(data.error || 'Failed to fetch chapter');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching chapter:', err);
    } finally {
      setLoading(false);
    }
  }, [chapter_id]);

  useEffect(() => {
    if (chapter_id) {
      fetchChapter();
    }
  }, [chapter_id, fetchChapter]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && chapter?.prev_chapter_id) {
      router.push(`/chapter/${chapter.prev_chapter_id}`);
    } else if (event.key === 'ArrowRight' && chapter?.next_chapter_id) {
      router.push(`/chapter/${chapter.next_chapter_id}`);
    }
  }, [chapter, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (loading) {
    return <LoadingState>Loading chapter...</LoadingState>;
  }

  if (error || !chapter) {
    return (
      <ErrorState
        title="Chapter not found"
        message={error || 'The requested chapter could not be found'}
        onRetry={fetchChapter}
      />
    );
  }

  const increaseFontSize = () => setFontSize(prev => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize(prev => Math.max(prev - 2, 12));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Chapter Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Chapter {chapter.chapter_id}: {chapter.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{chapter.word_count} words</span>
              <span>{chapter.character_count} characters</span>
            </div>
          </div>
          
          {/* Font Size Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseFontSize}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              {fontSize}px
            </span>
            <button
              onClick={increaseFontSize}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Increase font size"
            >
              A+
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {chapter.prev_chapter_id ? (
              <Link
                href={`/chapter/${chapter.prev_chapter_id}`}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <span>←</span>
                <span>Previous</span>
              </Link>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
                <span>←</span>
                <span>Previous</span>
              </div>
            )}

            <Link
              href={`/novel/${chapter.novel_id}`}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              Chapter List
            </Link>
          </div>

          {chapter.next_chapter_id ? (
            <Link
              href={`/chapter/${chapter.next_chapter_id}`}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Next</span>
              <span>→</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
              <span>Next</span>
              <span>→</span>
            </div>
          )}
        </div>
      </div>

      {/* Chapter Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
        <div 
          className="prose prose-gray dark:prose-invert max-w-none leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="mb-4">
                {paragraph.trim()}
              </p>
            ) : (
              <br key={index} />
            )
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          {chapter.prev_chapter_id ? (
            <Link
              href={`/chapter/${chapter.prev_chapter_id}`}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <span>←</span>
              <span>Previous Chapter</span>
            </Link>
          ) : (
            <div></div>
          )}

          <div className="text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Use ← → arrow keys to navigate
            </div>
            <Link
              href={`/novel/${chapter.novel_id}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Back to Novel
            </Link>
          </div>

          {chapter.next_chapter_id ? (
            <Link
              href={`/chapter/${chapter.next_chapter_id}`}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <span>Next Chapter</span>
              <span>→</span>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
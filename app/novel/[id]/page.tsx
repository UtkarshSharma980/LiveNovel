'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Novel, ChapterListItem, ApiResponse } from '@/types';
import { BookmarkManager } from '@/lib/bookmarks';
import { LoadingState, ErrorState } from '@/components/LoadingStates';

export default function NovelPage() {
  const params = useParams();
  const novel_id = params.id as string;
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNovelData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch novel details and chapters in parallel
      const [novelResponse, chaptersResponse] = await Promise.all([
        fetch(`/api/novel/${novel_id}`),
        fetch(`/api/novel/${novel_id}/chapters`)
      ]);

      const novelData: ApiResponse<Novel> = await novelResponse.json();
      const chaptersData: ApiResponse<ChapterListItem[]> = await chaptersResponse.json();

      if (!novelData.success) {
        setError(novelData.error || 'Failed to fetch novel');
        return;
      }

      if (!chaptersData.success) {
        setError(chaptersData.error || 'Failed to fetch chapters');
        return;
      }

      setNovel(novelData.data!);
      setChapters(chaptersData.data || []);
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching novel data:', err);
    } finally {
      setLoading(false);
    }
  }, [novel_id]);

  useEffect(() => {
    if (novel_id) {
      fetchNovelData();
    }
  }, [novel_id, fetchNovelData]);

  if (loading) {
    return <LoadingState>Loading novel details...</LoadingState>;
  }

  if (error || !novel) {
    return (
      <ErrorState
        title="Novel not found"
        message={error || 'The requested novel could not be found'}
        onRetry={fetchNovelData}
      />
    );
  }

  const getStatusColor = (status: Novel['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'ongoing':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'dropped':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'hiatus':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const bookmark = BookmarkManager.getBookmark(novel_id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Novel Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1 mr-4">
            {novel.title}
          </h1>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(novel.status)} flex-shrink-0`}
          >
            {novel.status}
          </span>
        </div>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          by {novel.author}
        </p>

        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {novel.description}
        </p>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <span>{novel.total_chapters} chapters</span>
            {novel.tags && novel.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {novel.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {bookmark && (
            <div className="text-blue-600 dark:text-blue-400 text-sm">
              📖 Bookmarked: Ch. {bookmark.chapter_id}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {chapters.length > 0 && (
            <Link
              href={`/chapter/${chapters[0].chapter_id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Start Reading
            </Link>
          )}
          
          {bookmark && (
            <Link
              href={`/chapter/${bookmark.chapter_id}`}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Continue Reading
            </Link>
          )}
        </div>
      </div>

      {/* Chapter List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Chapters ({chapters.length})
          </h2>
        </div>

        {chapters.length === 0 ? (
          <div className="p-6 text-center text-gray-600 dark:text-gray-400">
            No chapters available yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {chapters.map((chapter, index) => {
              const isBookmarked = bookmark?.chapter_id === chapter.chapter_id;
              
              return (
                <Link
                  key={chapter._id.toString()}
                  href={`/chapter/${chapter.chapter_id}`}
                  className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 mr-4 w-12">
                        #{index + 1}
                      </span>
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-medium">
                          {chapter.title}
                        </h3>
                      </div>
                    </div>
                    
                    {isBookmarked && (
                      <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
                        <span>📖</span>
                        <span className="ml-1">Reading</span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
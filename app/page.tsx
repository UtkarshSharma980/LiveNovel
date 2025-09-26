'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Novel, ApiResponse } from '@/types';
import { BookmarkManager } from '@/lib/bookmarks';
import { LoadingState, ErrorState } from '@/components/LoadingStates';

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNovels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/novels');
      const data: ApiResponse<Novel[]> = await response.json();
      
      if (data.success && data.data) {
        setNovels(data.data);
      } else {
        setError(data.error || 'Failed to fetch novels');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching novels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  if (loading) {
    return <LoadingState>Loading novels...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load novels"
        message={error}
        onRetry={fetchNovels}
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Web Novel Library
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover and read your favorite translated novels
        </p>
      </div>

      {novels.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No novels found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new content!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map((novel) => {
            const bookmark = BookmarkManager.getBookmark(novel._id?.toString() || '');
            
            return (
              <div
                key={novel._id?.toString()}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-3">
                      {novel.title}
                    </h2>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(novel.status)} flex-shrink-0`}
                    >
                      {novel.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    by {novel.author}
                  </p>
                  
                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                    {novel.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{novel.total_chapters} chapters</span>
                    {bookmark && (
                      <span className="text-blue-600 dark:text-blue-400">
                        📖 Ch. {bookmark.chapter_id}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/novel/${novel._id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors font-medium"
                    >
                      Read Novel
                    </Link>
                    {bookmark && (
                      <Link
                        href={`/chapter/${bookmark.chapter_id}`}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        Continue
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Chapter, ChapterWithNavigation, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapter_id: string }> }
): Promise<NextResponse<ApiResponse<ChapterWithNavigation>>> {
  try {
    const { chapter_id } = await params;
    
    const db = await getDatabase();
    
    // Find the current chapter by chapter_id (string match)
    const currentChapter = await db
      .collection('chapters')
      .findOne({ chapter_id: chapter_id }) as Chapter | null;

    if (!currentChapter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chapter not found'
        },
        { status: 404 }
      );
    }

    // Find previous and next chapters for the same novel
    const prevChapter = await db.collection('chapters').findOne(
      { 
        novel_id: currentChapter.novel_id,
        order: { $lt: currentChapter.order }
      },
      { 
        sort: { order: -1 },
        projection: { chapter_id: 1 }
      }
    ) as Pick<Chapter, 'chapter_id'> | null;

    const nextChapter = await db.collection('chapters').findOne(
      { 
        novel_id: currentChapter.novel_id,
        order: { $gt: currentChapter.order }
      },
      { 
        sort: { order: 1 },
        projection: { chapter_id: 1 }
      }
    ) as Pick<Chapter, 'chapter_id'> | null;

    const chapterWithNavigation: ChapterWithNavigation = {
      ...currentChapter,
      prev_chapter_id: prevChapter?.chapter_id,
      next_chapter_id: nextChapter?.chapter_id
    };

    return NextResponse.json({
      success: true,
      data: chapterWithNavigation
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chapter'
      },
      { status: 500 }
    );
  }
}
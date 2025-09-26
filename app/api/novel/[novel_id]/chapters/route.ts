import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ChapterListItem, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ novel_id: string }> }
): Promise<NextResponse<ApiResponse<ChapterListItem[]>>> {
  try {
    const { novel_id } = await params;
    
    const db = await getDatabase();
    
    // Find chapters by novel_id (string match)
    const chapters = await db
      .collection('chapters')
      .find(
        { novel_id: novel_id },
        { 
          projection: { 
            _id: 1, 
            chapter_id: 1, 
            title: 1, 
            order: 1 
          } 
        }
      )
      .sort({ order: 1 })
      .toArray() as ChapterListItem[];

    return NextResponse.json({
      success: true,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chapters'
      },
      { status: 500 }
    );
  }
}
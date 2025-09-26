import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Novel, ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ novel_id: string }> }
): Promise<NextResponse<ApiResponse<Novel>>> {
  try {
    const { novel_id } = await params;
    
    const db = await getDatabase();
    
    // Look for novel by novel_id field (this is what your data uses)
    const novel = await db
      .collection('novels')
      .findOne({ novel_id: novel_id }) as Novel | null;

    if (!novel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Novel not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: novel
    });
  } catch (error) {
    console.error('Error fetching novel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch novel'
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Novel, ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<Novel[]>>> {
  try {
    const db = await getDatabase();
    
    const novels = await db
      .collection('novels')
      .find({})
      .sort({ updated_at: -1 })
      .toArray() as Novel[];

    console.log('Found novels:', novels.length);

    return NextResponse.json({
      success: true,
      data: novels
    });
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch novels',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
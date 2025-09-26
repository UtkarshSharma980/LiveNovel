import { NextResponse } from 'next/server';

// Simple test route
export async function GET() {
  return NextResponse.json({
    status: 'OK',
    message: 'API route is working!',
    timestamp: new Date().toISOString()
  });
}
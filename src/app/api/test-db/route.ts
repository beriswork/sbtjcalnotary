import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ message: 'Database connected successfully' });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }
} 
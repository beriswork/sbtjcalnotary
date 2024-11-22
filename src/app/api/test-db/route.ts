import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to database' 
      }, 
      { 
        status: 500 
      }
    );
  }
} 
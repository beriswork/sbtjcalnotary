import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function GET(request: Request) {
  try {
    await dbConnect();

    // Get user email from the session or query parameter
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { 
        status: 400 
      });
    }

    // Find user and get their credits
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { 
        status: 404 
      });
    }

    return NextResponse.json({
      success: true,
      credits: user.credits
    });
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch credits' 
    }, { 
      status: 500 
    });
  }
} 
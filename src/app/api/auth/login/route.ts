import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    // Log login activity
    await Activity.create({
      user: user._id,
      type: 'login',
      action: 'Logged into the system',
      creditsRemaining: user.credits
    });

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        credits: user.credits,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error logging in' },
      { status: 500 }
    );
  }
} 
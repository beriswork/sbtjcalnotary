import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    const user = await User.findOneAndUpdate(
      { email },
      { $inc: { credits: -1 } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { 
        status: 404 
      });
    }

    // Log activity
    await Activity.create({
      user: user._id,
      type: 'credit',
      action: 'Used 1 credit for distance calculation',
      creditsRemaining: user.credits
    });

    console.log(`[Credit Update] User: ${email}, Credits remaining: ${user.credits}`);

    return NextResponse.json({
      success: true,
      newCredits: user.credits
    });

  } catch (error) {
    console.error('Credit update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update credits' 
    }, { 
      status: 500 
    });
  }
} 
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user and increment credits
    const user = await User.findOneAndUpdate(
      { email },
      { $inc: { credits: 1 } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Log refund activity
    await Activity.create({
      user: user._id,
      type: 'refund',
      action: 'Credit refunded',
      creditsRemaining: user.credits
    });

    console.log(`[Credit Refund] User: ${email}, Credits remaining: ${user.credits}`);

    return NextResponse.json({
      success: true,
      newCredits: user.credits
    });

  } catch (error) {
    console.error('Credit refund error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refund credit' },
      { status: 500 }
    );
  }
} 
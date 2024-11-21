import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.credits > 0) {
      user.credits -= 1;
      await user.save();

      // Log credit usage activity with correct type
      await Activity.create({
        user: user._id,
        type: 'credit',
        action: 'Used 1 credit for distance calculation',
        creditsRemaining: user.credits
      });

      console.log(`Credits updated for ${email}: ${user.credits}`);
      
      // Return updated credits immediately
      return NextResponse.json({
        credits: user.credits,
        message: user.credits === 0 ? 
          'You\'ve exhausted your free credits. To get more credits, please email us at support@solutionsbytj.com' : 
          `${user.credits} credits remaining`
      });
    } else {
      return NextResponse.json({
        credits: 0,
        message: 'No credits remaining'
      });
    }
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json(
      { error: 'Error updating credits' },
      { status: 500 }
    );
  }
}

// Add GET endpoint to fetch current credits
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      credits: user.credits
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Error fetching credits' },
      { status: 500 }
    );
  }
} 
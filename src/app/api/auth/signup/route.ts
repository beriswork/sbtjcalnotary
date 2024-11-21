import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      credits: 10
    });

    await user.save();

    // Log signup activity
    await Activity.create({
      user: user._id,
      type: 'signup',
      action: 'Created a new account',
      creditsRemaining: user.credits
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        email: user.email,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
} 
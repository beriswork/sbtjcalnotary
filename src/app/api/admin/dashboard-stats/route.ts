import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';

const formatActivityMessage = (activity: any) => {
  const email = activity.user.email;
  
  switch (activity.type) {
    case 'signup':
      return `${email} created a new account`;
    case 'login':
      return `${email} logged into the system`;
    case 'credit':
      return `${email} used 1 credit for distance calculation`;
    default:
      return activity.action;
  }
};

export async function GET() {
  try {
    await dbConnect();

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get monthly active users (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo }
    });

    // Get today's requests (credit usage activities)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRequests = await Activity.countDocuments({
      type: 'credit',
      createdAt: { $gte: today }
    });

    // Get monthly requests
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyRequests = await Activity.countDocuments({
      type: 'credit',
      createdAt: { $gte: monthStart }
    });

    // Get user growth data for last 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Get all dates in the last 2 weeks
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    // Get user signups per day
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twoWeeksAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Fill in missing dates with zero counts
    const growthData = dates.map(date => ({
      date,
      count: userGrowth.find(item => item._id === date)?.count || 0
    }));

    // Get recent activities with better formatting
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'email lastLoginAt');

    return NextResponse.json({
      totalUsers,
      activeUsers,
      todayRequests,
      monthlyRequests,
      userGrowth: growthData,
      recentActivities: recentActivities.map(activity => ({
        id: activity._id,
        user: activity.user.email,
        action: formatActivityMessage(activity),
        timestamp: activity.createdAt,
        type: activity.type,
        lastLogin: activity.user.lastLoginAt,
        creditsRemaining: activity.creditsRemaining
      }))
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Error fetching admin stats' },
      { status: 500 }
    );
  }
} 
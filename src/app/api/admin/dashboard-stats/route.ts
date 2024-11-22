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
      return `${email} used 1 credit for distance calculation (${activity.creditsRemaining} remaining)`;
    default:
      return activity.action;
  }
};

export async function GET() {
  try {
    console.log('[Admin Dashboard] Attempting database connection...');
    await dbConnect();
    console.log('[Admin Dashboard] Connected to MongoDB');

    // Add timestamp to track when updates happen
    const requestTime = new Date().toISOString();
    console.log(`[Admin Dashboard] Processing request at: ${requestTime}`);

    // Get total users
    const totalUsers = await User.countDocuments({
      isAdmin: { $ne: true }
    });

    // Calculate new users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const newUsersLastWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
      isAdmin: { $ne: true }
    });

    // Get monthly active users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo },
      isAdmin: { $ne: true }
    });

    // Get today's requests
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

    // Calculate user growth for last 2 weeks including today
    const today2 = new Date();
    today2.setHours(0, 0, 0, 0);
    const twoWeeksAgo = new Date(today2);
    twoWeeksAgo.setDate(today2.getDate() - 13); // -13 to include today

    // Generate dates array including today
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    // Get user signups per day
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: twoWeeksAgo },
          isAdmin: { $ne: true }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { 
              format: "%Y-%m-%d", 
              date: "$createdAt",
              timezone: "America/Los_Angeles"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with zero counts
    const growthData = dates.map(date => ({
      date,
      count: userGrowth.find(item => item._id === date)?.count || 0
    }));

    // Get recent activities
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'email lastLoginAt');

    const response = {
      success: true,
      data: {
        totalUsers,
        newUsersLastWeek,  // Add this to response
        activeUsers,
        todayRequests,
        monthlyRequests,
        userGrowth: growthData,
        recentActivities: recentActivities.map(activity => ({
          id: activity._id.toString(),
          user: activity.user.email,
          action: formatActivityMessage(activity),
          timestamp: activity.createdAt,
          type: activity.type,
          lastLogin: activity.user.lastLoginAt,
          creditsRemaining: activity.creditsRemaining
        }))
      }
    };

    console.log('[Admin Dashboard] Stats compiled:', {
      totalUsers,
      activeUsers,
      todayRequests,
      monthlyRequests,
      recentActivitiesCount: recentActivities.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Admin Dashboard] Error:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('[Admin Dashboard] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 
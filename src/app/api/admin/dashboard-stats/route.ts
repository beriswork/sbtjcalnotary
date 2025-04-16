import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Activity from '@/app/models/Activity';
import { Types } from 'mongoose';

// Add interface for activity type
interface ActivityDocument {
  _id: Types.ObjectId;
  user: {
    email: string;
    lastLoginAt: Date;
  };
  type: 'signup' | 'login' | 'credit';
  createdAt: Date;
  creditsRemaining: number;
  action?: string;
}

const formatActivityMessage = (activity: ActivityDocument) => {
  const email = activity.user.email;
  
  switch (activity.type) {
    case 'signup':
      return `${email} created a new account`;
    case 'login':
      return `${email} logged into the system`;
    case 'credit':
      return `${email} used 1 credit for distance calculation (${activity.creditsRemaining} remaining)`;
    default:
      return activity.action || '';
  }
};

export async function GET() {
  try {
    // Connect with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        await dbConnect();
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Calculate date range for user growth (last 2 weeks)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 13); // -13 to include today

    // Generate array of dates for the last 14 days
    const dates = Array.from({ length: 14 }, (_, i) => {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    const [
      totalUsers,
      newUsersLastWeek,
      activeUsers,
      todayRequests,
      monthlyRequests,
      recentActivities,
      userGrowthData
    ] = await Promise.all([
      // Get total users
      User.countDocuments({ isAdmin: { $ne: true } }),

      // Get new users in last 7 days
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isAdmin: { $ne: true }
      }),

      // Get monthly active users
      User.countDocuments({
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        isAdmin: { $ne: true }
      }),

      // Get today's requests
      Activity.countDocuments({
        type: 'credit',
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),

      // Get monthly requests
      Activity.countDocuments({
        type: 'credit',
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      }),

      // Get recent activities
      Activity.find()
        .sort({ createdAt: -1 })
        .limit(10)  // Reduced from 20 to 10 for better performance
        .select('type user createdAt creditsRemaining')
        .populate('user', 'email lastLoginAt')
        .lean(),
      
      // Add user growth aggregation
      User.aggregate([
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
                date: "$createdAt"
              }
            },
            count: { $sum: 1 }
          }
        },
        { 
          $sort: { _id: 1 } 
        }
      ])
    ]);

    // Process user growth data to include all dates with zero counts for missing days
    const userGrowth = dates.map(date => ({
      date,
      count: userGrowthData.find(item => item._id === date)?.count || 0
    }));

    const response = {
      success: true,
      data: {
        totalUsers,
        newUsersLastWeek,
        activeUsers,
        todayRequests,
        monthlyRequests,
        userGrowth,
        recentActivities: recentActivities.map((activity: any) => ({
          id: activity._id.toString(),
          user: activity.user?.email || '',
          action: formatActivityMessage({
            _id: activity._id,
            user: {
              email: activity.user?.email || '',
              lastLoginAt: activity.user?.lastLoginAt || new Date()
            },
            type: activity.type as 'signup' | 'login' | 'credit',
            createdAt: activity.createdAt,
            creditsRemaining: activity.creditsRemaining || 0
          }),
          timestamp: activity.createdAt,
          type: activity.type,
          lastLogin: activity.user?.lastLoginAt || new Date(),
          creditsRemaining: activity.creditsRemaining || 0
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Admin Dashboard] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 
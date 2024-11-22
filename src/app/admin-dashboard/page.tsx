'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import { Bell, Calendar, LogOut, Users, Activity, BarChart as BarChartIcon, Circle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayRequests: number;
  monthlyRequests: number;
  userGrowth: Array<{ date: string; count: number }>;
  recentActivities: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
    type: 'credit' | 'signup' | 'login';
  }>;
  newUsersLastWeek: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const adminSession = sessionStorage.getItem('admin_session');
    if (!adminSession) {
      router.push('/admin-login');
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    router.push('/admin-login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="fixed inset-0 bg-[#f9fafb] flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard data. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Admin Panel</h1>
          <div className={styles.headerActions}>
            <div className={styles.notificationWrapper}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={styles.notificationButton}
              >
                <Bell className={styles.icon} />
                <span className={styles.badge}>3</span>
              </button>
              {showNotifications && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationHeader}>Notifications</div>
                  <div className={styles.notificationItem}>New user registration</div>
                  <div className={styles.notificationItem}>Credit usage alert</div>
                  <div className={styles.notificationItem}>System update available</div>
                </div>
              )}
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <LogOut className={styles.icon} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.statsGrid}>
          <Card>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Total Users</h3>
                <Users className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{stats.totalUsers}</div>
              <p className={styles.statChange}>
                +{stats.newUsersLastWeek} in last 7 days
              </p>
            </div>
          </Card>

          <Card>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Monthly Active Users</h3>
                <Activity className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{stats.activeUsers}</div>
              <p className={styles.statChange}>Active this month</p>
            </div>
          </Card>

          <Card>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Today's Requests</h3>
                <BarChartIcon className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{stats.todayRequests}</div>
              <p className={styles.statChange}>Requests today</p>
            </div>
          </Card>

          <Card>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <h3>Monthly Requests</h3>
                <Calendar className={styles.statIcon} />
              </div>
              <div className={styles.statValue}>{stats.monthlyRequests}</div>
              <p className={styles.statChange}>Requests this month</p>
            </div>
          </Card>
        </div>

        <div className={styles.contentGrid}>
          <Card className={styles.growthCard}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>User Growth (Last 2 Weeks)</h3>
              <p className={styles.cardDescription}>
                Track the growth of your user base over time
              </p>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280" 
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        const today = new Date();
                        return date.toDateString() === today.toDateString() 
                          ? 'Today'
                          : date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            });
                      }}
                    />
                    <YAxis 
                      stroke="#6B7280" 
                      fontSize={12}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0, 102, 255, 0.1)' }}
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        padding: '8px'
                      }}
                      formatter={(value: number) => [`${value} new users`, 'New Users']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        const today = new Date();
                        return date.toDateString() === today.toDateString()
                          ? 'Today'
                          : date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                      }}
                    />
                    <Bar 
                      dataKey="count"
                      fill="#0066ff"
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1500}
                      animationEasing="ease-out"
                      minPointSize={3}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className={styles.activityCard}>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>Live Activity Feed</h3>
              <p className={styles.cardDescription}>
                Real-time user activities and system events
              </p>
              <div className={styles.activityList}>
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <Circle className={`${styles.statusDot} ${styles[activity.type]}`} />
                    <div className={styles.activityContent}>
                      <div className={styles.activityUser}>{activity.user}</div>
                      <div className={styles.activityAction}>
                        {activity.action.replace(activity.user, '').trim()}
                      </div>
                    </div>
                    <time className={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
} 
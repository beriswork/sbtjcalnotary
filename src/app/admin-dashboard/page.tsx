'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './admin.module.css';
import { 
  FaUsers, 
  FaChartLine, 
  FaCalendarAlt, 
  FaUserClock,
  FaSignOutAlt,
  FaCircle
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnimatedNumber } from '../components/AnimatedNumber';

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
    timestamp: Date;
    type: 'credit' | 'signup' | 'login';
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminSession = sessionStorage.getItem('admin_session');
    if (!adminSession) {
      router.push('/admin-login');
      return;
    }

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    router.push('/admin-login');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <header className={styles.mainHeader}>
        <div className={styles.headerContent}>
          <h1>Admin Panel</h1>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.grid}>
          {/* Stats Cards */}
          <div className={styles.card}>
            <FaUsers className={styles.icon} />
            <h3>Total Users</h3>
            <AnimatedNumber value={stats?.totalUsers || 0} />
          </div>

          <div className={styles.card}>
            <FaUserClock className={styles.icon} />
            <h3>Monthly Active Users</h3>
            <AnimatedNumber value={stats?.activeUsers || 0} />
          </div>

          <div className={styles.card}>
            <FaChartLine className={styles.icon} />
            <h3>Today's Requests</h3>
            <AnimatedNumber value={stats?.todayRequests || 0} />
          </div>

          <div className={styles.card}>
            <FaCalendarAlt className={styles.icon} />
            <h3>Monthly Requests</h3>
            <AnimatedNumber value={stats?.monthlyRequests || 0} />
          </div>

          {/* Growth Chart */}
          <div className={`${styles.card} ${styles.chartCard}`}>
            <h3>User Growth (Last 2 Weeks)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#0052CC" 
                  strokeWidth={2}
                  dot={{ fill: '#0052CC' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Feed */}
          <div className={`${styles.card} ${styles.activityCard}`}>
            <h3>Live Activity Feed</h3>
            <div className={styles.activityFeed}>
              {stats?.recentActivities.map((activity) => (
                <div key={activity.id} className={styles.activity}>
                  <FaCircle className={`${styles.statusDot} ${styles[activity.type]}`} />
                  <div className={styles.activityContent}>
                    <p>
                      <strong>{activity.user}</strong>
                      <span className={styles.activityAction}>{activity.action.replace(activity.user, '')}</span>
                    </p>
                    <time>{new Date(activity.timestamp).toLocaleTimeString()}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
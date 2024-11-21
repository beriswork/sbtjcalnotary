'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const handleInitialRoute = async () => {
      const session = sessionStorage.getItem('user_session');
      
      if (session) {
        await router.replace('/dashboard');
      } else {
        await router.replace('/login');
      }
    };

    handleInitialRoute();
  }, [router, isAuthenticated]);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner />
      <div className={styles.banner}>
        <span>Click here to calculate the fee immediately 👉</span>
        <button className={styles.primaryButton}>
          CALCULATE
        </button>
      </div>
    </div>
  );
}

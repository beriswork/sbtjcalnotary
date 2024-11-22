'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import { FaUserCircle, FaCalculator } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export const Header = () => {
  const pathname = usePathname();
  const { credits, logout, userEmail, decrementCredits } = useAuth();
  const [displayCredits, setDisplayCredits] = useState(credits);

  // Update display credits when credits change
  useEffect(() => {
    setDisplayCredits(credits);
    console.log('Credits updated in header:', credits);

    // Add animation class when credits change
    const element = document.getElementById('credits-display');
    if (element) {
      element.classList.add(styles.pulse);
      setTimeout(() => {
        element.classList.remove(styles.pulse);
      }, 300);
    }
  }, [credits]);

  // Poll for credit updates
  useEffect(() => {
    if (!userEmail) return;

    const fetchCredits = async () => {
      try {
        const response = await fetch(`/api/user/credits?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (data.success && data.credits !== displayCredits) {
          console.log(`[Credit Update] Current: ${displayCredits}, New: ${data.credits}`);
          setDisplayCredits(data.credits);
          decrementCredits(); // Update auth context
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
      }
    };

    // Initial fetch
    fetchCredits();

    // Set up polling interval
    const interval = setInterval(fetchCredits, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [userEmail, displayCredits, decrementCredits]);

  if (pathname !== '/dashboard') {
    return null;
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.titleSection}>
          <FaCalculator className={styles.calculatorIcon} />
          <h1 className={styles.title}>NOTARY FEE CALCULATOR</h1>
        </div>

        <div className={styles.rightSection}>
          <div 
            id="credits-display"
            className={styles.credits} 
            style={{
              backgroundColor: displayCredits === 0 ? '#FFF1F0' : '#FFF8E5',
              color: displayCredits === 0 ? '#CF1322' : '#B7791F',
              transition: 'all 0.3s ease'
            }}
          >
            {displayCredits} credit{displayCredits !== 1 ? 's' : ''} left
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{userEmail}</span>
            <FaUserCircle className={styles.userIcon} onClick={logout} />
          </div>
        </div>
      </div>
    </header>
  );
}; 
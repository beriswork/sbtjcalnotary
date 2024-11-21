'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';

export const Header = () => {
  const pathname = usePathname();
  const { credits, logout, userEmail } = useAuth();
  const [displayCredits, setDisplayCredits] = useState(credits);

  // Update displayCredits whenever credits change
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

  if (pathname !== '/dashboard') {
    return null;
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>NOTARY FEE CALCULATOR</h1>
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
          <span>{userEmail}</span>
          <FaUserCircle className={styles.userIcon} onClick={logout} />
        </div>
      </div>
    </header>
  );
}; 
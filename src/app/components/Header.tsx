'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Header = () => {
  const pathname = usePathname();
  const { credits, logout, userEmail, isDemoAccount, decrementCredits } = useAuth();
  const [displayCredits, setDisplayCredits] = useState(credits);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update display credits when credits change
  useEffect(() => {
    setDisplayCredits(credits);
    console.log('Credits updated in header:', credits);

    // Add animation class when credits change
    const element = document.getElementById('credits-display');
    const mobileElement = document.getElementById('mobile-credits-display');
    
    if (element) {
      element.classList.add(styles.pulse);
      setTimeout(() => element.classList.remove(styles.pulse), 300);
    }
    if (mobileElement) {
      mobileElement.classList.add(styles.pulse);
      setTimeout(() => mobileElement.classList.remove(styles.pulse), 300);
    }
  }, [credits]);

  // Poll for credit updates (skip for demo accounts)
  useEffect(() => {
    if (!userEmail || isDemoAccount) return;

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
  }, [userEmail, isDemoAccount, displayCredits, decrementCredits]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  if (pathname !== '/dashboard') {
    return null;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div className={styles.logoWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75V17.25ZM15 18.75C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25V18.75ZM9 18.75H15V17.25H9V18.75ZM3 13.5V5.25H1.5V13.5H3ZM5.25 3H18.75V1.5H5.25V3ZM21 5.25V13.5H22.5V5.25H21ZM18.75 15.75H5.25V17.25H18.75V15.75ZM21 13.5C21 14.7426 19.9926 15.75 18.75 15.75V17.25C20.8211 17.25 22.5 15.5711 22.5 13.5H21ZM18.75 3C19.9926 3 21 4.00736 21 5.25H22.5C22.5 3.17893 20.8211 1.5 18.75 1.5V3ZM5.25 1.5C3.17893 1.5 1.5 3.17893 1.5 5.25H3C3 4.00736 4.00736 3 5.25 3V1.5ZM1.5 13.5C1.5 15.5711 3.17893 17.25 5.25 17.25V15.75C4.00736 15.75 3 14.7426 3 13.5H1.5Z" fill="white"/>
                <path d="M12 7V13M12 13L9 10M12 13L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className={styles.title}>NotaryCal</h1>
          </div>

          <div className={styles.rightSection}>
            {/* Desktop Elements */}
            <div 
              id="credits-display"
              className={styles.credits} 
              style={{
                backgroundColor: displayCredits === 0 ? '#FFF1F0' : '#ffffff',
                color: displayCredits === 0 ? '#CF1322' : '#0052CC',
                border: displayCredits === 0 ? '1px solid #ffa39e' : '1px solid #e5e7eb',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{ fontSize: '16px' }}>⚡️</span>
              {displayCredits} credits
            </div>
            
            <div className={styles.userInfo}>
              <span className={styles.userEmail}>
                {userEmail}
                {isDemoAccount && (
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: '#0052CC',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    DEMO
                  </span>
                )}
              </span>
              <div style={{ width: '1px', height: '16px', background: '#e5e7eb' }}></div>
              <FaUserCircle className={styles.userIcon} onClick={logout} title="Logout" />
            </div>

            {/* Mobile Burger Button */}
            <button className={styles.mobileMenuButton} onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.open : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
          
          <div className={styles.mobileUser}>
            <FaUserCircle size={32} color="#9ca3af" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.userEmail} style={{ fontSize: '15px' }}>
                {userEmail}
              </span>
              {isDemoAccount && (
                <span style={{
                  fontSize: '11px',
                  color: '#0052CC',
                  fontWeight: '600',
                  marginTop: '2px'
                }}>
                  Demo Account
                </span>
              )}
            </div>
          </div>

          <div 
            id="mobile-credits-display"
            className={styles.mobileCredits}
            style={{
              backgroundColor: displayCredits === 0 ? '#FFF1F0' : '#f8fafc',
              borderColor: displayCredits === 0 ? '#ffa39e' : '#e2e8f0',
            }}
          >
            <span style={{ fontWeight: '500', color: '#64748b' }}>Available Credits</span>
            <span style={{ 
              fontWeight: '700', 
              color: displayCredits === 0 ? '#CF1322' : '#0052CC',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚡️ {displayCredits}
            </span>
          </div>

          <button onClick={logout} className={styles.mobileLogoutBtn}>
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};
'use client';

import { ReactNode } from 'react';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="auth-background">
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75V17.25ZM15 18.75C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25V18.75ZM9 18.75H15V17.25H9V18.75ZM3 13.5V5.25H1.5V13.5H3ZM5.25 3H18.75V1.5H5.25V3ZM21 5.25V13.5H22.5V5.25H21ZM18.75 15.75H5.25V17.25H18.75V15.75ZM21 13.5C21 14.7426 19.9926 15.75 18.75 15.75V17.25C20.8211 17.25 22.5 15.5711 22.5 13.5H21ZM18.75 3C19.9926 3 21 4.00736 21 5.25H22.5C22.5 3.17893 20.8211 1.5 18.75 1.5V3ZM5.25 1.5C3.17893 1.5 1.5 3.17893 1.5 5.25H3C3 4.00736 4.00736 3 5.25 3V1.5ZM1.5 13.5C1.5 15.5711 3.17893 17.25 5.25 17.25V15.75C4.00736 15.75 3 14.7426 3 13.5H1.5Z" fill="white"/>
              <path d="M12 7V13M12 13L9 10M12 13L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={styles.logoText}>NotaryCal</span>
        </div>

        <div className={`premium-card ${styles.card}`}>
          <div className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {children}
        </div>
        
        <div className={styles.footer}>
          © 2026 Solutions by TJ. All rights reserved.
        </div>
      </div>
    </div>
  );
};

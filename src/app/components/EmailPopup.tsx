'use client';

import { useState } from 'react';
import styles from '../page.module.css';

interface EmailPopupProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export const EmailPopup = ({ onClose, onSubmit }: EmailPopupProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
    onClose();
  };

  return (
    <div className={styles.popupOverlay} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className={styles.popup}>
        <button onClick={onClose} className={styles.closeButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={styles.closeIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className={styles.popupTitle}>Share Bill with Client</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter client's email"
            className={styles.emailInput}
            required
            autoFocus
            autoComplete="email"
          />
          <button type="submit" className={styles.sendButton}>
            <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}; 
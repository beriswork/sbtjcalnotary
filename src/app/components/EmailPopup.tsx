'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../page.module.css';
import { X, Send, Mail } from 'lucide-react';

interface EmailPopupProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export const EmailPopup = ({ onClose, onSubmit }: EmailPopupProps) => {
  const [email, setEmail] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus management
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div 
        ref={popupRef}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100"
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: 'calc(100% - 32px)',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'popupSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          margin: '0 auto'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start'
        }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#f0f4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0052CC'
            }}>
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: '700', 
                color: '#1a1f36' 
              }}>
                Share Bill
              </h3>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '14px', 
                color: '#64748b' 
              }}>
                Send the fee breakdown via email
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="client-email" 
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#4b5563',
                marginBottom: '8px'
              }}
            >
              Client's Email Address
            </label>
            <input
              id="client-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
              autoFocus
              autoComplete="email"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                fontSize: '16px', // Prevent zoom on iOS
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#f8fafc',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#0052CC';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 82, 204, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = '#f8fafc';
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexDirection: 'row' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
                transition: 'all 0.2s',
                minHeight: '48px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#0052CC',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px rgba(0, 82, 204, 0.2)',
                minHeight: '48px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#0043a3';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#0052CC';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <Send className="w-4 h-4" />
              Send Email
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        @keyframes popupSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};
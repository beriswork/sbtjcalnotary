'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  credits: number;
  userEmail: string | null;
  isDemoAccount: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  decrementCredits: () => Promise<void>;
  rechargeCredits: (password: string) => boolean;
  checkSession: () => boolean;
}

// Demo account constants
const DEMO_EMAIL = 'test@admin.com';
const DEMO_PASSWORD = 'admin@123';
const DEMO_INITIAL_CREDITS = 100;
const RECHARGE_PASSWORD = 'extra100';
const RECHARGE_AMOUNT = 100;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credits, setCredits] = useState(10);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDemoAccount, setIsDemoAccount] = useState(false);
  const router = useRouter();

  const refreshCredits = useCallback(async (email: string, isDemo: boolean = false) => {
    // Skip API call for demo account
    if (isDemo || email === DEMO_EMAIL) {
      const storedSession = localStorage.getItem('user_session');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (session.credits !== undefined) {
          setCredits(session.credits);
        }
      }
      return;
    }

    try {
      const response = await fetch(`/api/user/credits?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (data.success) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      // Check for persistent session in localStorage (30-day storage)
      const persistentSession = localStorage.getItem('user_session');
      
      if (persistentSession) {
        try {
          const session = JSON.parse(persistentSession);
          const { email, credits, isDemoAccount, expiresAt } = session;
          
          // Check if session has expired (30 days)
          if (expiresAt && Date.now() > expiresAt) {
            console.log('Session expired, clearing...');
            localStorage.removeItem('user_session');
            Cookies.remove('auth_token');
            return;
          }
          
          // Restore session
          setIsAuthenticated(true);
          setUserEmail(email);
          setIsDemoAccount(isDemoAccount || false);
          setCredits(credits || 10);
          
          console.log('Session restored:', { email, isDemoAccount, credits });
          
          // Refresh credits for regular users
          if (!isDemoAccount) {
            await refreshCredits(email, false);
          }
        } catch (error) {
          console.error('Error restoring session:', error);
          localStorage.removeItem('user_session');
        }
      }
    };

    checkSession();
  }, [refreshCredits]);

  const login = async (email: string, password: string) => {
    try {
      // Check for demo account
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        console.log('Demo account login detected');
        
        // Check if demo account session exists in localStorage
        const existingSession = localStorage.getItem('user_session');
        let demoCredits = DEMO_INITIAL_CREDITS;
        
        if (existingSession) {
          try {
            const session = JSON.parse(existingSession);
            if (session.email === DEMO_EMAIL && session.isDemoAccount) {
              demoCredits = session.credits || DEMO_INITIAL_CREDITS;
            }
          } catch (e) {
            console.error('Error parsing existing demo session:', e);
          }
        }
        
        setIsAuthenticated(true);
        setIsDemoAccount(true);
        setUserEmail(DEMO_EMAIL);
        setCredits(demoCredits);
        
        // Create 30-day expiration
        const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
        
        // Store in localStorage for 30-day persistence
        localStorage.setItem('user_session', JSON.stringify({
          email: DEMO_EMAIL,
          credits: demoCredits,
          isDemoAccount: true,
          expiresAt
        }));
        
        Cookies.set('auth_token', DEMO_EMAIL, { expires: 30 });
        
        router.push('/dashboard');
        return;
      }

      // Regular user login with MongoDB
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setIsAuthenticated(true);
      setIsDemoAccount(false);
      setUserEmail(email);
      setCredits(data.user.credits);
      
      // Create 30-day expiration
      const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
      
      // Store in localStorage for 30-day persistence
      localStorage.setItem('user_session', JSON.stringify({
        email,
        credits: data.user.credits,
        isDemoAccount: false,
        expiresAt
      }));
      
      Cookies.set('auth_token', data.user.email, { expires: 30 });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
      sessionStorage.removeItem('user_session');
      Cookies.remove('auth_token');
    }
    setIsAuthenticated(false);
    setIsDemoAccount(false);
    setUserEmail(null);
    setCredits(0);
    router.replace('/login');
  };

  const signup = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting signup process...');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('AuthContext: Signup successful, redirecting to login');
      await router.replace('/login');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const decrementCredits = async () => {
    if (!userEmail || credits <= 0) return;

    // Handle demo account
    if (isDemoAccount || userEmail === DEMO_EMAIL) {
      const newCredits = credits - 1;
      setCredits(newCredits);
      
      // Update localStorage
      const session = JSON.parse(localStorage.getItem('user_session') || '{}');
      session.credits = newCredits;
      localStorage.setItem('user_session', JSON.stringify(session));
      
      console.log('Demo account credits updated:', newCredits);
      
      // Show recharge prompt if credits exhausted
      if (newCredits === 0) {
        const rechargeKey = prompt(
          'You\'ve exhausted your credits!\n\n' +
          'Enter the recharge key to add 100 more credits, or contact support@solutionsbytj.com'
        );
        
        if (rechargeKey) {
          const recharged = rechargeCredits(rechargeKey);
          if (!recharged) {
            alert('Invalid recharge key. Please contact support@solutionsbytj.com for assistance.');
          }
        }
      }
      
      return newCredits;
    }

    // Handle regular users
    try {
      console.log('Updating credits for:', userEmail);
      const response = await fetch('/api/user/credits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();

      // Immediately update the credits in state and session
      if (data.credits !== undefined) {
        console.log('New credits value:', data.credits);
        setCredits(data.credits);
        
        // Update localStorage
        const session = JSON.parse(localStorage.getItem('user_session') || '{}');
        session.credits = data.credits;
        localStorage.setItem('user_session', JSON.stringify(session));

        // Show message if credits exhausted
        if (data.credits === 0) {
          alert('You\'ve exhausted your free credits. To get more credits, please email us at support@solutionsbytj.com');
        }

        // Force a re-render of components using credits
        return data.credits;
      }
    } catch (error) {
      console.error('Error updating credits:', error);
      return credits; // Return current credits on error
    }
  };

  // Recharge credits function for demo account
  const rechargeCredits = (password: string): boolean => {
    if (password !== RECHARGE_PASSWORD) {
      return false;
    }
    
    if (!isDemoAccount && userEmail !== DEMO_EMAIL) {
      return false;
    }
    
    const newCredits = credits + RECHARGE_AMOUNT;
    setCredits(newCredits);
    
    // Update localStorage
    const session = JSON.parse(localStorage.getItem('user_session') || '{}');
    session.credits = newCredits;
    localStorage.setItem('user_session', JSON.stringify(session));
    
    console.log('Credits recharged! New balance:', newCredits);
    alert(`Success! ${RECHARGE_AMOUNT} credits added. New balance: ${newCredits} credits`);
    
    return true;
  };

  // Add an effect to periodically refresh credits (skip for demo accounts)
  useEffect(() => {
    if (isAuthenticated && userEmail && !isDemoAccount) {
      const interval = setInterval(() => refreshCredits(userEmail, false), 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userEmail, isDemoAccount, refreshCredits]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      credits,
      userEmail,
      isDemoAccount,
      login,
      logout,
      signup,
      decrementCredits,
      rechargeCredits,
      checkSession: () => {
        if (typeof window !== 'undefined') {
          const session = localStorage.getItem('user_session');
          const authToken = Cookies.get('auth_token');
          return !!(session && authToken);
        }
        return false;
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  credits: number;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string) => Promise<void>;
  decrementCredits: () => Promise<void>;
  checkSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credits, setCredits] = useState(10);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = () => {
      if (typeof window !== 'undefined') {
        const session = sessionStorage.getItem('user_session');
        const authToken = Cookies.get('auth_token');

        if (session && authToken) {
          const { email, credits: savedCredits } = JSON.parse(session);
          setIsAuthenticated(true);
          setUserEmail(email);
          setCredits(savedCredits);
        }
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
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
      setUserEmail(email);
      setCredits(data.user.credits);
      
      sessionStorage.setItem('user_session', JSON.stringify({
        email,
        credits: data.user.credits
      }));
      
      Cookies.set('auth_token', data.user.email, { expires: 7 });

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('user_session');
      Cookies.remove('auth_token');
    }
    setIsAuthenticated(false);
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
        
        // Update session storage
        const session = JSON.parse(sessionStorage.getItem('user_session') || '{}');
        session.credits = data.credits;
        sessionStorage.setItem('user_session', JSON.stringify(session));

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

  // Add a function to refresh credits
  const refreshCredits = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch('/api/user/credits', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      if (data.credits !== undefined) {
        setCredits(data.credits);
        
        // Update session storage
        const session = JSON.parse(sessionStorage.getItem('user_session') || '{}');
        session.credits = data.credits;
        sessionStorage.setItem('user_session', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  };

  // Add an effect to periodically refresh credits
  useEffect(() => {
    if (isAuthenticated && userEmail) {
      const interval = setInterval(refreshCredits, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, userEmail]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      credits,
      userEmail,
      login,
      logout,
      signup,
      decrementCredits,
      checkSession: () => {
        if (typeof window !== 'undefined') {
          const session = sessionStorage.getItem('user_session');
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
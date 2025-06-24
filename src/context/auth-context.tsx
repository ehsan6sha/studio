
'use client';

import type { Locale } from '@/i18n-config';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode} from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface User {
  name?: string;
  emailOrPhone?: string;
  dob?: string;
}

interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: Partial<User>, lang: Locale) => void;
  signup: (userData: User, lang: Locale) => void;
  logout: (lang: Locale) => void;
  loginWithGoogle: (lang: Locale) => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

const AUTH_STORAGE_KEY = 'hami-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  
  // On mount, check for persisted auth state
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.user) {
          setIsAuthenticated(true);
          setUser(authData.user);
        }
      }
    } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const persistAuthState = (authStatus: boolean, userData: User | null) => {
      try {
        if (authStatus && userData) {
            const authData = { isAuthenticated: authStatus, user: userData };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to save auth data to localStorage", error);
      }
  };


  const login = useCallback((userData: Partial<User>, lang: Locale) => {
    setIsAuthenticated(true);
    const updatedUserData = { ...user, ...userData };
    setUser(updatedUserData as User);
    persistAuthState(true, updatedUserData as User);
    
    // Only redirect from login/signup pages, not from profile update
    if (pathname && (pathname.endsWith('/login') || pathname.endsWith('/signup'))) {
        router.push(`/${lang}/dashboard`);
    }
  }, [router, user, pathname]);

  const signup = useCallback((userData: User, lang: Locale) => {
    setIsAuthenticated(true);
    setUser(userData);
    persistAuthState(true, userData);
    router.push(`/${lang}/dashboard`);
  }, [router]);
  
  const loginWithGoogle = useCallback((lang: Locale) => {
    const googleUser = { name: 'Google User', emailOrPhone: 'user@google.com' };
    setIsAuthenticated(true);
    setUser(googleUser);
    persistAuthState(true, googleUser);
    router.push(`/${lang}/dashboard`);
  }, [router]);


  const logout = useCallback((lang: Locale) => {
    setIsAuthenticated(false);
    setUser(null);
    persistAuthState(false, null);
    router.push(`/${lang}`);
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

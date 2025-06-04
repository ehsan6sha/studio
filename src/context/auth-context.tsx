
'use client';

import type { Locale } from '@/i18n-config';
import { useRouter } from 'next/navigation';
import type { ReactNode} from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface User {
  name?: string;
  emailOrPhone?: string;
}

interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User, lang: Locale) => void;
  signup: (userData: User, lang: Locale) => void;
  logout: (lang: Locale) => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = useCallback((userData: User, lang: Locale) => {
    setIsAuthenticated(true);
    setUser(userData);
    router.push(`/${lang}/dashboard`);
  }, [router]);

  const signup = useCallback((userData: User, lang: Locale) => {
    setIsAuthenticated(true);
    setUser(userData);
    router.push(`/${lang}/dashboard`);
  }, [router]);

  const logout = useCallback((lang: Locale) => {
    setIsAuthenticated(false);
    setUser(null);
    router.push(`/${lang}`);
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
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

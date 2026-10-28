import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Holds the signed-in state in React so the whole UI (e.g. the navigation)
 * re-renders as soon as the user signs in or out.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [user, setUser] = useState<User | null>(api.getUser());

  const login = useCallback(async (email: string, password: string) => {
    const auth = await api.login(email, password);
    setUser(auth.user);
    setIsAuthenticated(true);
  }, []);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const auth = await api.signup(email, password, firstName, lastName);
    setUser(auth.user);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // The session is cleared locally even if the server can't be reached
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, login, signup, logout }),
    [user, isAuthenticated, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};

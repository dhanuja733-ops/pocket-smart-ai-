import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserSettings } from '../types';
import { api, clearStoredToken, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginDemo: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<string>;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  enterToSend: true,
  defaultPersona: 'general',
  streamResponse: true,
  responseStyle: 'balanced',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem('pocket_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    async function loadInitialUser() {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
        setStoredUser(currentUser);
      } catch {
        // If not authenticated, initialize default guest profile
        if (!user) {
          const guestUser: User = {
            id: 'usr-guest-' + Math.random().toString(36).substring(2, 8),
            name: 'Guest Explorer',
            email: 'guest@pocketsmart.ai',
            avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
            bio: 'Exploring Pocket Smart AI',
            createdAt: new Date().toISOString(),
            isGuest: true,
          };
          setUser(guestUser);
          setStoredUser(guestUser);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialUser();
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('pocket_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(name, email, password);
      setUser(res.user);
      setToken(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    await login('alex@example.com', 'demo1234');
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    const guestUser: User = {
      id: 'usr-guest-' + Math.random().toString(36).substring(2, 8),
      name: 'Guest Explorer',
      email: 'guest@pocketsmart.ai',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
      bio: 'Exploring Pocket Smart AI',
      createdAt: new Date().toISOString(),
      isGuest: true,
    };
    setUser(guestUser);
    setStoredUser(guestUser);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await api.updateProfile(data);
      setUser(updated);
    } catch {
      // Local fallback
      const localUpdated = { ...user, ...data };
      setUser(localUpdated);
      setStoredUser(localUpdated);
    }
  };

  const resetPassword = async (email: string) => {
    const res = await api.resetPassword(email);
    return res.message;
  };

  const isAuthenticated = Boolean(user && !user.isGuest);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        settings,
        updateSettings,
        login,
        register,
        logout,
        loginDemo,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

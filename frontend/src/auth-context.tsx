import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  token: 'authToken',
  refreshToken: 'refreshToken',
  user: 'user',
};

const getApiUrl = () => process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);

  const updateToken = (newToken: string | null, newRefreshToken?: string | null) => {
    tokenRef.current = newToken;
    setToken(newToken);
    if (newRefreshToken !== undefined) {
      refreshTokenRef.current = newRefreshToken;
    }
  };

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedToken = await SecureStore.getItemAsync(STORAGE_KEYS.token);
      const savedRefresh = await SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);

      let savedUser = null;
      try {
        savedUser = await AsyncStorage.getItem(STORAGE_KEYS.user);
      } catch {
        console.warn('AsyncStorage not available (web), skipping user restore');
      }

      if (savedToken && savedUser) {
        tokenRef.current = savedToken;
        refreshTokenRef.current = savedRefresh;
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error restoring auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();

      await SecureStore.setItemAsync(STORAGE_KEYS.token, data.token);
      if (data.refresh_token) {
        await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, data.refresh_token);
        refreshTokenRef.current = data.refresh_token;
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
      } catch {
        console.warn('Could not save user to AsyncStorage (web)');
      }

      tokenRef.current = data.token;
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
      try {
        await AsyncStorage.removeItem(STORAGE_KEYS.user);
      } catch {
        console.warn('Could not clear AsyncStorage (web)');
      }

      tokenRef.current = null;
      refreshTokenRef.current = null;
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (): Promise<boolean> => {
    if (!tokenRef.current) return false;
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenRef.current }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const refreshAuth = async (): Promise<boolean> => {
    const savedRefresh = refreshTokenRef.current;
    if (!savedRefresh) return false;
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: savedRefresh }),
      });
      if (!response.ok) {
        await logout();
        return false;
      }
      const data = await response.json();
      await SecureStore.setItemAsync(STORAGE_KEYS.token, data.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, data.refresh_token);
      tokenRef.current = data.token;
      refreshTokenRef.current = data.refresh_token;
      setToken(data.token);
      return true;
    } catch {
      await logout();
      return false;
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const currentToken = tokenRef.current;
    if (!currentToken) throw new Error('Not authenticated');

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> || {}),
        'Authorization': `Bearer ${currentToken}`,
      },
    });

    if (response.status === 401) {
      const refreshed = await refreshAuth();
      if (refreshed && tokenRef.current) {
        return fetch(url, {
          ...options,
          headers: {
            ...(options.headers as Record<string, string> || {}),
            'Authorization': `Bearer ${tokenRef.current}`,
          },
        });
      }
      await logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isSignedIn: !!token,
    login,
    logout,
    verifyToken,
    authenticatedFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

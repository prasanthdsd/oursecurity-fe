import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { api, ApiError, setAuthToken, User } from '../api';

const TOKEN_KEY = 'oursecurity.token';

// SecureStore keeps the token in the iOS Keychain / Android Keystore. It has no web build.
const tokenStore = {
  get: () => (Platform.OS === 'web' ? Promise.resolve(null) : SecureStore.getItemAsync(TOKEN_KEY)),
  set: (t: string) => (Platform.OS === 'web' ? Promise.resolve() : SecureStore.setItemAsync(TOKEN_KEY, t)),
  clear: () => (Platform.OS === 'web' ? Promise.resolve() : SecureStore.deleteItemAsync(TOKEN_KEY)),
};

interface AuthState {
  user: User | null;
  restoring: boolean;
  login(phone: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await tokenStore.get();
        if (token) {
          setAuthToken(token);
          setUser(await api.me());
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await tokenStore.clear();
        setAuthToken(null);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const res = await api.login(phone, password);
    setAuthToken(res.token);
    await tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
    await tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, restoring, login, logout }), [user, restoring, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** For screens that only render when signed in. */
export function useUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('No signed-in user');
  return user;
}

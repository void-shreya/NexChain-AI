import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('supply_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('supply_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.data?.success) {
            setUser(res.data.data.user);
            localStorage.setItem('supply_user', JSON.stringify(res.data.data.user));
          }
        } catch (e) {
          // Token invalid
          localStorage.removeItem('supply_token');
          localStorage.removeItem('supply_user');
          setUser(null);
        }
      } else {
        const isAuthRoute =
          window.location.pathname.startsWith('/login') ||
          window.location.pathname.startsWith('/register');

        // Only auto-login if directly accessing the main app and not on auth pages
        if (!isAuthRoute) {
          try {
            await quickLogin('SUPPLY_MANAGER');
          } catch (err) {
            console.warn('Auto quick-login fallback:', err.message);
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data?.success) {
      const { token, user: loggedInUser } = res.data.data;
      localStorage.setItem('supply_token', token);
      localStorage.setItem('supply_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    }
    throw new Error(res.data?.error || 'Login failed');
  };

  const quickLogin = async (role) => {
    const roleCredentials = {
      ADMIN: { email: 'admin@nexchain.ai', password: 'Password123!' },
      SUPPLY_MANAGER: { email: 'supply.manager@nexchain.ai', password: 'Password123!' },
      OPERATIONS_MANAGER: { email: 'ops.lead@nexchain.ai', password: 'Password123!' },
      VIEWER: { email: 'viewer@nexchain.ai', password: 'Password123!' },
    };

    const creds = roleCredentials[role] || roleCredentials.SUPPLY_MANAGER;
    try {
      return await login(creds.email, creds.password);
    } catch (err) {
      console.warn('Quick login fallback:', err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('supply_token');
    localStorage.removeItem('supply_user');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

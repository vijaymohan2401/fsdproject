import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on initial mount
  const checkAuth = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const data = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const demoLogin = async () => {
    const data = await api.post('/auth/demo');
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const data = await api.put('/auth/profile', profileData);
    if (data.success && data.user) {
      setUser(data.user);
    }
    return data;
  };

  const deleteAccount = async () => {
    const data = await api.delete('/auth/account');
    setUser(null);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        deleteAccount,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

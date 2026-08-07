import React, { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('codeguard_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('codeguard_token'));
  const [loading, setLoading] = useState(false);

  const formatError = (err, defaultMsg) => {
    const errorData = err.response?.data?.error || err.response?.data?.message || err.message;
    if (typeof errorData === 'string') return errorData;
    if (errorData && typeof errorData === 'object') {
      return errorData.message || JSON.stringify(errorData);
    }
    return defaultMsg;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('codeguard_user', JSON.stringify(user));
      localStorage.setItem('codeguard_token', token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: formatError(err, 'Login failed. Please check credentials.')
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { email, password });
      const { user, token } = res.data;

      setUser(user);
      setToken(token);
      localStorage.setItem('codeguard_user', JSON.stringify(user));
      localStorage.setItem('codeguard_token', token);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: formatError(err, 'Registration failed.')
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('codeguard_user');
    localStorage.removeItem('codeguard_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

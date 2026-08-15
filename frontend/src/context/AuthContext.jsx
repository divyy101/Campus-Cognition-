import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiEngine, setAiEngine] = useState('campus_ai');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('cc_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setAiEngine(res.data.user.aiEngine || 'campus_ai');
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        localStorage.removeItem('cc_token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success && res.data.token) {
      localStorage.setItem('cc_token', res.data.token);
      setUser(res.data.user);
      setAiEngine(res.data.user.aiEngine || 'campus_ai');
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Login failed' };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.token) {
      localStorage.setItem('cc_token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.data.message || 'Registration failed' };
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('cc_token');
      setUser(null);
    }
  };

  const updateEnginePreference = async (engine) => {
    setAiEngine(engine);
    try {
      await api.put('/users/profile', { aiEngine: engine });
    } catch (e) {
      console.warn('Failed to persist engine preference:', e.message);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      aiEngine,
      setAiEngine: updateEnginePreference
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

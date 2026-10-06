import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/api/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('spendwise_token', res.data.token);
      localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const signup = async (name, email, password, monthlyBudget = 0) => {
    const res = await api.post('/api/auth/signup', {
      name,
      email,
      password,
      monthlyBudget,
    });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('spendwise_token', res.data.token);
      localStorage.setItem('spendwise_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
  };

  const updateBudget = async (newBudget) => {
    const res = await api.put('/api/budget', { monthlyBudget: Number(newBudget) });
    if (res.data.success) {
      const updated = { ...user, monthlyBudget: res.data.monthlyBudget };
      setUser(updated);
      localStorage.setItem('spendwise_user', JSON.stringify(updated));
    }
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateBudget }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('spendwise_mobile_token');
      const storedUser = await AsyncStorage.getItem('spendwise_mobile_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token with backend
        try {
          const res = await api.get('/api/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            await AsyncStorage.setItem('spendwise_mobile_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // If offline, keep cached user
          console.log('Running in offline/cached session');
        }
      }
    } catch (err) {
      console.error('Error loading session:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      await AsyncStorage.setItem('spendwise_mobile_token', res.data.token);
      await AsyncStorage.setItem('spendwise_mobile_user', JSON.stringify(res.data.user));
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
      await AsyncStorage.setItem('spendwise_mobile_token', res.data.token);
      await AsyncStorage.setItem('spendwise_mobile_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('spendwise_mobile_token');
    await AsyncStorage.removeItem('spendwise_mobile_user');
    await AsyncStorage.removeItem('spendwise_cached_expenses');
  };

  const updateBudget = async (newBudget) => {
    const res = await api.put('/api/budget', { monthlyBudget: Number(newBudget) });
    if (res.data.success) {
      const updatedUser = { ...user, monthlyBudget: res.data.monthlyBudget };
      setUser(updatedUser);
      await AsyncStorage.setItem('spendwise_mobile_user', JSON.stringify(updatedUser));
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

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  Constants?.expoConfig?.extra?.apiUrl ||
  'https://spendwise-backend-1hts.onrender.com'
).replace(/\/+$/, ''); // strip trailing slash

console.log('API BASE_URL:', BASE_URL); // remove after debugging

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Render free tier cold start can take ~60s
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('spendwise_mobile_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed to get token from storage:', err);
  }
  return config;
});

export default api;
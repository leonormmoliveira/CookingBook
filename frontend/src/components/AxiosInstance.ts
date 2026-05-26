import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/auth'
});

api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const stored = localStorage.getItem('token');
    if (stored) {
      config.headers.Authorization = `Bearer ${stored}`;
    }
  }

  return config;
});

export default api;

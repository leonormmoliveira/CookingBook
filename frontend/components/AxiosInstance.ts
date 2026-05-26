import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: "http://localhost:8001"
});

api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // fallback: read token persisted by AuthContext on login
    const stored = localStorage.getItem('token');
    if (stored) {
      config.headers.Authorization = `Bearer ${stored}`;
    }
  }

  return config;
});

export default api;
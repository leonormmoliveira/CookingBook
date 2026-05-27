import api from '../components/AxiosInstance.js';
import Cookies from 'js-cookie';

export interface User {
  name: string;
  username: string;
  password: string;
  email: string;
}

export const authApi = (Login: (userData: any) => void) => {
  const login = async (idToken: string): Promise<any> => {
    try {
      const { data } = await api.post('/auth/login', { idToken });
      return data;
    } catch (err: any) {
      console.error('authApi.login error', err?.response?.status, err?.response?.data || err);
      throw err;
    }
  };

  const signup = async (user: User): Promise<any> => {
    const { data } = await api.post('/auth/register', user);
    return data;
  };

  const logout = async () => {
    Login(null);
    Cookies.remove('auth');
    await api.post('/auth/logout');
  };

  return { login, signup, logout };
};

export default authApi;

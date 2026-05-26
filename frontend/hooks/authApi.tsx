import api from "../components/AxiosInstance";
import Cookies from 'js-cookie';

export interface User{
  name: string;
  username: string;
  password: string;
  email: string;
}

export const authApi = (Login: (userData: any) => void) => {
  const login = async (idToken: string): Promise<any> => {
    const { data } = await api.post("/login", { idToken });
    Login(data.user);

    return data;
  };

  const signup = async (user: User): Promise<any> => {
    const { data } = await api.post("/register", user);
    return data;
  };

  const logout = async () => {
    Login(null);
    Cookies.remove('auth')
    await api.post("/logout");
  };

  return { login, signup, logout };
};

export default authApi;
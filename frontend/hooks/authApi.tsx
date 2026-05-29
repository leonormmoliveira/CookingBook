import api from "../components/AxiosInstance";

export interface User{
  name: string;
  username: string;
  password: string;
  email: string;
}

export const authApi = () => {
  const login = async (idToken: string): Promise<any> => {
    const { data } = await api.post("/login", { idToken });
    return data;
  };

  const signup = async (user: User): Promise<any> => {
    const { data } = await api.post("/register", user);
    return data;
  };

  const logout = async () => {
    await api.post("/logout");
  };

  return { login, signup, logout };
};

export default authApi;
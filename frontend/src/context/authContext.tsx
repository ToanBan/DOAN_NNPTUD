import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";
import { setAccessToken } from "./tokenStore";

interface AuthContextType {
  user: any;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  getProfile: () => Promise<any>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = async (email: string, password: string) => {
    const res = await api.post("/api/auth/login", { email, password });
    const token = res.data.accessToken;
    setAccessTokenState(token);
    setAccessToken(token);
    const profile = await getProfile();
    setUser(profile);
    return res.data;
  };

  const getProfile = async () => {
    const res = await api.get("/api/auth/me");
    setUser(res.data.user)
    return res.data.user;
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    window.location.href = "/login";
    setAccessTokenState(null);
    setAccessToken(null);
    setUser(null);
  };




  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post("/api/auth/refresh-token"); 
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        setAccessTokenState(newToken);

        const profile = await getProfile(); 
        setUser(profile);
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
  };

  initAuth();
}, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, logout, getProfile, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  return useContext(AuthContext)!;
};
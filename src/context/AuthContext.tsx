import { createContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken, removeAuthToken } from "../services/api";
import { Alert } from "react-native";

type Role = "cliente" | "negocio";

type User = {
  id: string;
  username: string;
  role: Role;
  full_name?: string;
  phone?: string;
  address?: string;
  businessName?: string;
  description?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password });

      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      setAuthToken(token);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error: any) {
      console.log("LOGIN ERROR:", error?.response?.data || error?.message || error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al iniciar sesión";

      Alert.alert("Login", String(message));
    }
  };

  const register = async (username: string, password: string, role: Role) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        password,
        role,
      });

      const { user, token } = response.data;

      setUser(user);
      setToken(token);
      setAuthToken(token);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
    } catch (error: any) {
      console.log("REGISTER ERROR:", error?.response?.data || error?.message || error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al registrarse";

      Alert.alert("Registro", String(message));
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    removeAuthToken();

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

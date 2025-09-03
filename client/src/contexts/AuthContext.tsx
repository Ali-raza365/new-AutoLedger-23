import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { type User, type JWTPayload } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { username: string; email: string; password: string; userType: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    
    if (storedToken && storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      const { user: userData, token: authToken } = response;
      
      setUser(userData);
      setToken(authToken);
      
      // Store in localStorage
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: { username: string; email: string; password: string; userType: string }) => {
    try {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: userData,
      });

      const { user: newUser, token: authToken } = response;
      
      setUser(newUser);
      setToken(authToken);
      
      // Store in localStorage
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
import { authAPI } from "@/services/api";
import { LoginCredentials, RegisterCredentials, UserRole } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: {
    id: number;
    role: UserRole;
  } | null;
  loading: boolean;
  login: (credentials: LoginCredentials, role: UserRole) => Promise<void>;
  register: (data: RegisterCredentials, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: number; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to refresh the token to check if user is logged in
        // We would try both refresh token endpoints and see which one works
        try {
          await authAPI.adventurerRefreshToken();
          // If successful, user is an adventurer
          setUser({ id: 0, role: UserRole.Adventurer }); // We don't have the actual ID yet
        } catch {
          try {
            await authAPI.guildCommanderRefreshToken();
            // If successful, user is a guild commander
            setUser({ id: 0, role: UserRole.GuildCommander }); // We don't have the actual ID yet
          } catch {
            // If both fail, user is not logged in
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials, role: UserRole) => {
    setLoading(true);
    try {
      if (role === UserRole.Adventurer) {
        await authAPI.adventurerLogin(credentials);
        setUser({ id: 0, role: UserRole.Adventurer }); // We don't have the actual ID yet
      } else {
        await authAPI.guildCommanderLogin(credentials);
        setUser({ id: 0, role: UserRole.GuildCommander }); // We don't have the actual ID yet
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterCredentials, role: UserRole) => {
    setLoading(true);
    try {
      if (role === UserRole.Adventurer) {
        await authAPI.registerAdventurer(data);
      } else {
        await authAPI.registerGuildCommander(data);
      }
      // After registration, we'll log the user in
      await login(data, role);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Since we're using cookies, we just need to remove the user from state
    // The cookies will expire or be removed on the server side
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

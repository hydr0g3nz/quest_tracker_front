"use client";

import { authAPI } from "@/services/api";
import { LoginCredentials, RegisterCredentials, UserRole } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

// Function to decode JWT and extract the user ID
function decodeJwtToken(token: string) {
  try {
    // JWT tokens are split by dots into three parts: header, payload, signature
    const payload = token.split('.')[1];
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    // Extract user ID from the payload (usually stored as 'sub' or 'id')
    const userId = decodedPayload.sub || decodedPayload.id || 0;
    return parseInt(userId, 10);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return 0;
  }
}

// Function to get JWT from cookies
function getJwtFromCookie() {
  // Access token is stored in a cookie named 'act'
  const cookies = document.cookie.split(';');
  const actCookie = cookies.find(cookie => cookie.trim().startsWith('act='));
  if (actCookie) {
    return actCookie.trim().substring(4); // Remove 'act=' prefix
  }
  return null;
}

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

  // Extract user ID from JWT token
  const getUserIdFromToken = () => {
    const token = getJwtFromCookie();
    if (token) {
      return decodeJwtToken(token);
    }
    return 0;
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to refresh the token to check if user is logged in
        try {
          await authAPI.adventurerRefreshToken();
          // If successful, user is an adventurer
          const userId = getUserIdFromToken();
          setUser({ id: userId, role: UserRole.Adventurer });
        } catch {
          try {
            await authAPI.guildCommanderRefreshToken();
            // If successful, user is a guild commander
            const userId = getUserIdFromToken();
            setUser({ id: userId, role: UserRole.GuildCommander });
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
        const userId = getUserIdFromToken();
        setUser({ id: userId, role: UserRole.Adventurer });
      } else {
        await authAPI.guildCommanderLogin(credentials);
        const userId = getUserIdFromToken();
        setUser({ id: userId, role: UserRole.GuildCommander });
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
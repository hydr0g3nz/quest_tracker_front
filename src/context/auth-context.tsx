
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/lib/api';

export type UserRole = 'adventurer' | 'guild_commander' | null;

interface AuthContextType {
  userId: number | null;
  role: UserRole;
  isLoading: boolean;
  login: (username: string, password: string, role: 'adventurer' | 'guild_commander') => Promise<void>;
  register: (username: string, password: string, role: 'adventurer' | 'guild_commander') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Look for cookies and try to validate them
      try {
        // Try both types of auth
        try {
          await authService.adventurerRefreshToken();
          // If successful, we're an adventurer
          setRole('adventurer');
        } catch {
          try {
            await authService.guildCommanderRefreshToken();
            // If successful, we're a guild commander
            setRole('guild_commander');
          } catch {
            // No valid auth
            setRole(null);
          }
        }
        
        // If we have a role, we have a valid token
        // In a real app, we would decode the JWT to get the userId
        // For now, we'll just set a dummy value if authenticated
        if (role) {
          setUserId(1); // Placeholder
        } else {
          setUserId(null);
        }
      } catch (error) {
        setUserId(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string, userRole: 'adventurer' | 'guild_commander') => {
    setIsLoading(true);
    try {
      if (userRole === 'adventurer') {
        await authService.adventurerLogin(username, password);
        setRole('adventurer');
      } else {
        await authService.guildCommanderLogin(username, password);
        setRole('guild_commander');
      }
      // In a real app, decode JWT to get user id
      setUserId(1); // Placeholder
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, userRole: 'adventurer' | 'guild_commander') => {
    setIsLoading(true);
    try {
      if (userRole === 'adventurer') {
        await authService.adventurerRegister(username, password);
      } else {
        await authService.guildCommanderRegister(username, password);
      }
      // After registration, login the user
      await login(username, password, userRole);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // In a real app, we would also invalidate the token on the server
    // For now, just remove local state
    setUserId(null);
    setRole(null);
    
    // Clear cookies by redirecting to a logout endpoint
    if (typeof window !== 'undefined') {
      // We would typically have a server endpoint to clear cookies
      // For now, we'll just redirect to the login page
      window.location.href = '/login';
    }
  };

  const value = {
    userId,
    role,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

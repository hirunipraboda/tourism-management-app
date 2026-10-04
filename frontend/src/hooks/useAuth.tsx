import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENT_USER } from '../mock/users';
import { User, UserRole } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  login: (userOrEmail: string | User, tokenOrName?: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return authService.getStoredUser();
  });

  // Verify and sync current user on mount with backend
  useEffect(() => {
    const syncCurrentUser = async () => {
      if (authService.getToken()) {
        try {
          const freshUser = await authService.getCurrentUser();
          if (freshUser) {
            setUser(freshUser);
          } else {
            // Token expired or invalid
            setUser(null);
          }
        } catch (e) {
          console.warn('[useAuth] Failed to refresh current user session:', e);
        }
      }
    };

    syncCurrentUser();
  }, []);

  const refreshUser = async () => {
    if (authService.getToken()) {
      const freshUser = await authService.getCurrentUser();
      if (freshUser) {
        setUser(freshUser);
      } else {
        setUser(null);
      }
    }
  };

  const setRole = (role: UserRole) => {
    if (user) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('nova_auth_user', JSON.stringify(updated));
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updatedFields };
      setUser(updated);
      localStorage.setItem('nova_auth_user', JSON.stringify(updated));
    }
  };

  const login = (userOrEmail: string | User, tokenOrName?: string) => {
    if (typeof userOrEmail === 'object' && userOrEmail !== null) {
      setUser(userOrEmail);
      localStorage.setItem('nova_auth_user', JSON.stringify(userOrEmail));
      if (tokenOrName) {
        localStorage.setItem('nova_auth_token', tokenOrName);
      }
      return;
    }

    const email = userOrEmail;
    const name = tokenOrName;
    const isSystemAdmin = email.trim().toLowerCase().includes('admin');
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
      email,
      role: isSystemAdmin ? 'Administrator' : 'Tourist',
      avatarUrl: isSystemAdmin
        ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    setUser(newUser);
    localStorage.setItem('nova_auth_user', JSON.stringify(newUser));
  };

  const register = (name: string, email: string) => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role: 'Tourist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    setUser(newUser);
    localStorage.setItem('nova_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'Tourist',
        isAuthenticated: !!user && !!authService.getToken(),
        setRole,
        updateUser,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import React, { createContext, useContext, useState } from 'react';
import { CURRENT_USER } from '../mock/users';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  login: (email: string, name?: string) => void;
  register: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(CURRENT_USER);

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedFields });
    }
  };

  const login = (email: string, name?: string) => {
    setUser({
      id: 'usr-' + Date.now(),
      name: name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)),
      email,
      role: 'Tourist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    });
  };

  const register = (name: string, email: string) => {
    setUser({
      id: 'usr-' + Date.now(),
      name,
      email,
      role: 'Tourist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'Tourist',
        isAuthenticated: !!user,
        setRole,
        updateUser,
        login,
        register,
        logout,
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/auth';
import { authService, AuthApiResponse } from '../services/authService';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  updateUser: (updatedFields: Partial<User>) => void;
  login: (email: string, password?: string) => Promise<AuthApiResponse>;
  register: (name: string, email: string, password?: string, role?: string, phone?: string) => Promise<AuthApiResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('nova_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nova_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('nova_user_session');
    }
  }, [user]);

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

  const login = async (email: string, password?: string): Promise<AuthApiResponse> => {
    if (password) {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        const loggedInUser: User = {
          id: res.user.id,
          name: res.user.fullName,
          email: res.user.email,
          role: (res.user.role as any) || 'Tourist',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          status: 'Active',
          createdAt: res.user.createdAt,
          lastActive: 'Just now',
        };
        setUser(loggedInUser);
      }
      return res;
    }

    // Social / Quick Login fallback
    const mockUser: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email,
      role: 'Tourist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    setUser(mockUser);
    return { success: true, message: 'Login successful', user: { id: mockUser.id, fullName: mockUser.name, email: mockUser.email, role: 'Tourist', status: 'Active', createdAt: mockUser.createdAt } };
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    role = 'Tourist',
    phone?: string
  ): Promise<AuthApiResponse> => {
    if (password) {
      const res = await authService.register(name, email, password, role, phone);
      if (res.success && res.user) {
        const registeredUser: User = {
          id: res.user.id,
          name: res.user.fullName,
          email: res.user.email,
          role: (res.user.role as any) || 'Tourist',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          status: 'Active',
          createdAt: res.user.createdAt,
          lastActive: 'Just now',
        };
        setUser(registeredUser);
      }
      return res;
    }

    const mockUser: User = {
      id: 'usr-' + Date.now(),
      name,
      email,
      role: 'Tourist',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    setUser(mockUser);
    return { success: true, message: 'Registration successful', user: { id: mockUser.id, fullName: mockUser.name, email: mockUser.email, role: 'Tourist', status: 'Active', createdAt: mockUser.createdAt } };
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

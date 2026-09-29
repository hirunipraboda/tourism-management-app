import type { User } from '../types/auth';

const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'nova_auth_token';
const USER_KEY = 'nova_auth_user';
const ADMIN_SESSION_KEY = 'travellink_admin_session';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export function mapBackendUserToUser(raw: any): User {
  const roleRaw = (raw.role || raw.Role || 'USER').toUpperCase();
  const isAdmin = roleRaw === 'ADMIN' || roleRaw === 'ROLE_ADMIN' || roleRaw === 'ADMINISTRATOR';
  return {
    id: raw.id || raw._id || 'usr-default',
    name: raw.name || raw.Name || 'User',
    email: raw.email || raw.Email || '',
    role: isAdmin ? 'Administrator' : 'Tourist',
    avatarUrl: raw.profileImage || raw.avatarUrl || (isAdmin
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'),
    phone: raw.phone || raw.Phone,
    status: (raw.status || (raw.isActive !== false ? 'ACTIVE' : 'INACTIVE')) === 'ACTIVE' ? 'Active' : 'Inactive',
    createdAt: raw.createdAt || raw.CreatedAt || new Date().toISOString(),
    lastActive: 'Just now',
  };
}

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
    return null;
  },

  async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password || '',
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        return {
          success: false,
          message: resJson.message || 'Invalid email or password.',
          error: resJson.message || 'Authentication failed',
        };
      }

      const token = resJson.token || resJson.data?.token;
      const rawUser = resJson.user || resJson.data?.user;

      if (!token || !rawUser) {
        return {
          success: false,
          message: 'Malformed response received from server.',
        };
      }

      const user = mapBackendUserToUser(rawUser);

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // If user is Admin, synchronize admin session for admin console
      const roleUpper = (rawUser.role || rawUser.Role || '').toUpperCase();
      if (roleUpper === 'ADMIN' || roleUpper === 'ROLE_ADMIN') {
        const adminSession = {
          isAuthenticated: true,
          adminUser: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: 'Admin',
            avatar: user.avatarUrl,
          },
          token,
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
      }

      return {
        success: true,
        message: resJson.message || 'Login successful',
        token,
        user,
      };
    } catch (err: any) {
      console.error('[authService.login] Network or server error:', err);
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please ensure backend is running.',
        error: err.message,
      };
    }
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          confirmPassword: data.confirmPassword || data.password,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        let msg = resJson.message || 'Registration failed.';
        if (response.status === 409) {
          msg = resJson.message || 'This email is already registered. Please log in or use another email.';
        }
        return {
          success: false,
          message: msg,
          error: msg,
        };
      }

      const token = resJson.token || resJson.data?.token;
      const rawUser = resJson.user || resJson.data?.user;

      const user = rawUser ? mapBackendUserToUser(rawUser) : undefined;

      if (token && user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return {
        success: true,
        message: resJson.message || 'Registration successful',
        token,
        user,
      };
    } catch (err: any) {
      console.error('[authService.register] Network or server error:', err);
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please ensure backend is running.',
        error: err.message,
      };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Token expired or invalid or user inactive
        if (response.status === 401 || response.status === 403) {
          this.logout();
        }
        return this.getStoredUser();
      }

      const resJson = await response.json();
      const rawUser = resJson.user || resJson.data?.user || resJson.data;
      if (rawUser) {
        const user = mapBackendUserToUser(rawUser);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
      }
    } catch (e) {
      console.warn('[authService.getCurrentUser] Network error, using cached user if available', e);
    }

    return this.getStoredUser();
  },

  async getMe(): Promise<User | null> {
    return this.getCurrentUser();
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  isAdmin(): boolean {
    const user = this.getStoredUser();
    if (!user) return false;
    const roleUpper = (user.role || '').toUpperCase();
    return roleUpper === 'ADMIN' || roleUpper === 'ADMINISTRATOR' || roleUpper === 'ROLE_ADMIN';
  },
};

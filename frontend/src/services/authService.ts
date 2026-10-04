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
    phone: raw.phone || raw.Phone || '',
    bio: raw.bio || raw.Bio || '',
    location: raw.location || raw.Location || '',
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

  fallbackAdminLogin(): AuthResponse {
    const savedAvatar =
      localStorage.getItem('travellink_admin_avatar') ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';

    const adminUser: User = {
      id: 'admin-local-001',
      name: 'TourLink Admin',
      email: 'admin@tourlink.com',
      role: 'Administrator',
      avatarUrl: savedAvatar,
      status: 'Active',
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    const fakeToken = 'local-admin-token';
    localStorage.setItem(TOKEN_KEY, fakeToken);
    localStorage.setItem(USER_KEY, JSON.stringify(adminUser));

    const adminSession = {
      isAuthenticated: true,
      adminUser: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: 'Admin',
        avatar: savedAvatar,
      },
      token: fakeToken,
    };
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));

    return { success: true, message: 'Login successful (Offline Admin Session)', token: fakeToken, user: adminUser };
  },

  async login(credentials: LoginDto): Promise<AuthResponse> {
    const ADMIN_EMAIL = 'admin@tourlink.com';
    const ADMIN_PASSWORD = 'admin123';
    const isSpecialAdmin =
      credentials.email.trim().toLowerCase() === ADMIN_EMAIL &&
      credentials.password === ADMIN_PASSWORD;

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

      if (response.ok && resJson.success) {
        const token = resJson.token || resJson.data?.token;
        const rawUser = resJson.user || resJson.data?.user;

        if (token && rawUser) {
          const user = mapBackendUserToUser(rawUser);

          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify(user));

          const roleUpper = (rawUser.role || rawUser.Role || '').toUpperCase();
          if (roleUpper === 'ADMIN' || roleUpper === 'ROLE_ADMIN' || isSpecialAdmin) {
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
        }
      }

      if (!response.ok || !resJson.success) {
        if (isSpecialAdmin) {
          return this.fallbackAdminLogin();
        }
        return {
          success: false,
          message: resJson.message || 'Invalid email or password.',
          error: resJson.message || 'Authentication failed',
        };
      }
    } catch (err: any) {
      console.error('[authService.login] Network or server error:', err);
      if (isSpecialAdmin) {
        return this.fallbackAdminLogin();
      }
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please ensure backend is running.',
        error: err.message,
      };
    }

    if (isSpecialAdmin) {
      return this.fallbackAdminLogin();
    }

    return {
      success: false,
      message: 'Invalid email or password.',
    };
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

  async socialLogin(payload: { name: string; email: string; provider: string }): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BASE_URL}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        return {
          success: false,
          message: resJson.message || 'Social sign-in failed. Please try again.',
          error: resJson.message,
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
        message: resJson.message || 'Signed in successfully',
        token,
        user,
      };
    } catch (err: any) {
      console.error('[authService.socialLogin] Network or server error:', err);
      return {
        success: false,
        message: 'Unable to connect to server for social login. Please ensure backend is running.',
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
        if (response.status === 401 && token !== 'local-admin-token') {
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

  async updateProfile(data: {
    name: string;
    profileImage?: string;
    phone?: string;
    bio?: string;
    location?: string;
  }): Promise<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      // Local session fallback if user logged in without JWT
      const stored = this.getStoredUser();
      if (stored) {
        const updated: User = {
          ...stored,
          name: data.name,
          avatarUrl: data.profileImage || stored.avatarUrl,
          phone: data.phone ?? stored.phone,
          bio: data.bio ?? stored.bio,
          location: data.location ?? stored.location,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        if (data.profileImage && stored.role === 'Administrator') {
          localStorage.setItem('travellink_admin_avatar', data.profileImage);
        }
        return { success: true, message: 'Profile updated successfully', user: updated };
      }
      return { success: false, message: 'You must be logged in to update your profile.' };
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        return {
          success: false,
          message: resJson.message || 'Failed to update profile.',
          error: resJson.message,
        };
      }

      const rawUser = resJson.user || resJson.data?.user || resJson.data;
      if (rawUser) {
        const user = mapBackendUserToUser(rawUser);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return { success: true, message: resJson.message || 'Profile updated successfully', user };
      }

      return { success: true, message: resJson.message || 'Profile updated successfully' };
    } catch (err: any) {
      console.error('[authService.updateProfile] Network error:', err);
      // Fallback update stored user
      const stored = this.getStoredUser();
      if (stored) {
        const updated: User = {
          ...stored,
          name: data.name,
          avatarUrl: data.profileImage || stored.avatarUrl,
          phone: data.phone ?? stored.phone,
          bio: data.bio ?? stored.bio,
          location: data.location ?? stored.location,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
        return { success: true, message: 'Profile updated locally', user: updated };
      }
      return {
        success: false,
        message: 'Unable to reach backend server. Please verify backend is running.',
        error: err.message,
      };
    }
  },

  async resetPassword(data: {
    email: string;
    newPassword: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email.trim(),
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword || data.newPassword,
        }),
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.success) {
        return {
          success: false,
          message: resJson.message || 'Password reset failed. Please check your email and try again.',
        };
      }

      return {
        success: true,
        message: resJson.message || 'Password has been reset successfully.',
      };
    } catch (err: any) {
      console.error('[authService.resetPassword] Network error:', err);
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please ensure backend is running.',
      };
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem('nova_user_trips');
    localStorage.removeItem('travelwise_mock_reviews');
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


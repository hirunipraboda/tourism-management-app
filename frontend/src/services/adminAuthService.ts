export interface AdminSession {
  isAuthenticated: boolean;
  adminUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
  } | null;
  token: string | null;
}

const STORAGE_KEY = 'travellink_admin_session';
const TOKEN_KEY = 'nova_auth_token';

export const adminAuthService = {
  getSession(): AdminSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.token) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to read admin session from localStorage', e);
    }
    return {
      isAuthenticated: false,
      adminUser: null,
      token: null,
    };
  },

  async login(email: string, password?: string): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || 'Password123!' }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        return { success: false, error: resJson.message || 'Invalid administrator credentials.' };
      }

      const { token, user } = resJson.data;

      if (user.role !== 'Admin') {
        return { success: false, error: 'Unauthorized: Account does not have administrator privileges.' };
      }

      const session: AdminSession = {
        isAuthenticated: true,
        adminUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        },
        token,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_KEY, token);

      return { success: true, session };
    } catch (err: any) {
      console.warn('[AdminAuth] Server unavailable, falling back to offline demo credentials if admin@example.com', err);
      if (email.toLowerCase().includes('admin')) {
        const session: AdminSession = {
          isAuthenticated: true,
          adminUser: {
            id: 'user-admin-1',
            name: 'Charlie Admin',
            email: email || 'admin@example.com',
            role: 'Admin',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          },
          token: 'mock-jwt-token-travellink-admin-2026',
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        return { success: true, session };
      }
      return { success: false, error: 'Unable to reach authentication server.' };
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
  },
};

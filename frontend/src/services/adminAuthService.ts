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
const USER_KEY = 'nova_auth_user';

export const adminAuthService = {
  getSession(): AdminSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.token) {
          const roleUpper = (parsed.adminUser?.role || '').toUpperCase();
          if (roleUpper === 'ADMIN' || roleUpper === 'ROLE_ADMIN' || roleUpper === 'ADMINISTRATOR') {
            return parsed;
          }
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
    // ── Local admin credential shortcut ─────────────────────────────────
    const ADMIN_EMAIL    = 'admin@tourlink.com';
    const ADMIN_PASSWORD = 'admin123';

    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Restore previously uploaded profile photo (persists across logout/login)
      const savedAvatar =
        localStorage.getItem('travellink_admin_avatar') ||
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80';

      const session: AdminSession = {
        isAuthenticated: true,
        adminUser: {
          id: 'admin-local-001',
          name: 'TourLink Admin',
          email: ADMIN_EMAIL,
          role: 'Admin',
          avatar: savedAvatar,
        },
        token: 'local-admin-token',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_KEY, 'local-admin-token');
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: 'admin-local-001',
        name: 'TourLink Admin',
        email: ADMIN_EMAIL,
        role: 'Administrator',
        avatarUrl: savedAvatar,
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastActive: 'Just now',
      }));
      return { success: true, session };
    }
    // ────────────────────────────────────────────────────────────────────

    try {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password || '' }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        return { success: false, error: resJson.message || 'Invalid administrator credentials.' };
      }

      const token = resJson.token || resJson.data?.token;
      const user = resJson.user || resJson.data?.user;

      if (!token || !user) {
        return { success: false, error: 'Malformed authentication response.' };
      }

      const roleUpper = (user.role || '').toUpperCase();
      if (roleUpper !== 'ADMIN' && roleUpper !== 'ROLE_ADMIN') {
        return { success: false, error: 'Unauthorized: Account does not have administrator privileges.' };
      }

      const session: AdminSession = {
        isAuthenticated: true,
        adminUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'Admin',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        },
        token,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'Administrator',
        avatarUrl: session.adminUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        status: 'Active',
        createdAt: user.createdAt || new Date().toISOString(),
        lastActive: 'Just now',
      }));

      return { success: true, session };
    } catch (err: any) {
      console.warn('[AdminAuth] Server connection error:', err);
      return { success: false, error: 'Unable to reach authentication server.' };
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
  },
};

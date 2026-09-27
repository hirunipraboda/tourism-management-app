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

export const adminAuthService = {
  getSession(): AdminSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read admin session from localStorage', e);
    }
    return {
      isAuthenticated: true, // Default to true for ease of previewing admin, but configurable via login
      adminUser: {
        id: 'usr-admin-01',
        name: 'Administrator',
        email: 'admin@travellink.lk',
        role: 'Administrator',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
      token: 'mock-jwt-token-travellink-admin-2026',
    };
  },

  login(email: string): AdminSession {
    const session: AdminSession = {
      isAuthenticated: true,
      adminUser: {
        id: 'usr-admin-01',
        name: email.split('@')[0] || 'Administrator',
        email: email || 'admin@travellink.lk',
        role: 'Administrator',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
      token: 'mock-jwt-token-travellink-admin-2026',
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.error('Failed to save admin session', e);
    }
    return session;
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear admin session', e);
    }
  },
};

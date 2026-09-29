import { fetchApi } from './api';
import { CURRENT_USER } from '../mock/users';
import type { User } from '../types/auth';

export const authService = {
  async getCurrentUser(): Promise<User> {
    try {
      const res = await fetchApi<any>('/auth/me');
      if (res.data) {
        const u = res.data;
        return {
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role === 'ADMIN' || u.role === 'admin' ? 'Administrator' : 'Tourist',
          avatarUrl: u.profileImage || CURRENT_USER.avatarUrl,
          phone: u.phone,
          status: 'Active',
          createdAt: u.createdAt || CURRENT_USER.createdAt,
          lastActive: new Date().toISOString(),
        };
      }
      return CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  },
  async login(credentials: { email: string; password?: string; role?: string }): Promise<{ user: User; token: string }> {
    try {
      const res = await fetchApi<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password || 'password123',
        }),
      });

      if (res.data && res.data.token) {
        localStorage.setItem('nova_auth_token', res.data.token);
        const u = res.data.user;
        const userObj: User = {
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role === 'ADMIN' || u.role === 'admin' ? 'Administrator' : 'Tourist',
          avatarUrl: u.profileImage || CURRENT_USER.avatarUrl,
          phone: u.phone,
          status: 'Active',
          createdAt: u.createdAt || CURRENT_USER.createdAt,
          lastActive: new Date().toISOString(),
        };
        return { user: userObj, token: res.data.token };
      }
    } catch (e) {
      console.warn('[authService] Falling back to mock auth response');
    }

    const mockToken = 'nova_jwt_mock_token_8849302';
    localStorage.setItem('nova_auth_token', mockToken);
    return {
      user: { ...CURRENT_USER, email: credentials.email },
      token: mockToken,
    };
  },
  async logout(): Promise<void> {
    localStorage.removeItem('nova_auth_token');
    return Promise.resolve();
  },
};

import { fetchApi } from './api';
import { ApiUserResponse } from './userService';

export interface AuthApiResponse {
  success: boolean;
  message: string;
  user?: ApiUserResponse;
  token?: string;
}

export const authService = {
  // Login with DB credentials
  async login(email: string, password: string): Promise<AuthApiResponse> {
    try {
      const res = await fetchApi<AuthApiResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('nova_auth_token', res.data.token);
        }
        return res.data;
      }
      return {
        success: false,
        message: res.data?.message || 'Login failed. Please check your credentials.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to connect to authentication server.',
      };
    }
  },

  // Register user in DB
  async register(
    fullName: string,
    email: string,
    password: string,
    role = 'Tourist',
    phone?: string
  ): Promise<AuthApiResponse> {
    try {
      const res = await fetchApi<AuthApiResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role, phone }),
      });
      if (res.data && res.data.success) {
        if (res.data.token) {
          localStorage.setItem('nova_auth_token', res.data.token);
        }
        return res.data;
      }
      return {
        success: false,
        message: res.data?.message || 'Registration failed.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to connect to authentication server.',
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('nova_auth_token');
    localStorage.removeItem('nova_user_session');
  },
};

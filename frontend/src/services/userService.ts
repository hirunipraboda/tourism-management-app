import { fetchApi } from './api';
import { AdminUser } from '../mock/mockAdminData';

export interface ApiUserResponse {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface UpdateUserPayload {
  fullName: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
}

export const userService = {
  // GET all users from database
  async getUsers(): Promise<AdminUser[]> {
    try {
      const res = await fetchApi<ApiUserResponse[]>('/users');
      if (res.success && Array.isArray(res.data)) {
        return res.data.map((u) => ({
          id: u.id,
          name: u.fullName,
          email: u.email,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
          role: u.role as 'Tourist' | 'Tour Operator' | 'Administrator',
          status: (u.status || 'Active') as 'Active' | 'Inactive' | 'Pending',
          registeredAt: new Date(u.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          phone: u.phone || '+94 77 000 0000',
          totalBookings: 0,
          completedTrips: 0,
          reviewsCount: 0,
        }));
      }
    } catch (err) {
      console.error('Error fetching users from database:', err);
    }
    return [];
  },

  // CREATE user in database
  async createUser(payload: CreateUserPayload): Promise<AdminUser | null> {
    const res = await fetchApi<ApiUserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data) {
      const u = res.data;
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        role: u.role as 'Tourist' | 'Tour Operator' | 'Administrator',
        status: (u.status || 'Active') as 'Active' | 'Inactive' | 'Pending',
        registeredAt: new Date(u.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        phone: u.phone || '+94 77 000 0000',
        totalBookings: 0,
        completedTrips: 0,
        reviewsCount: 0,
      };
    }
    return null;
  },

  // UPDATE user in database
  async updateUser(id: string, payload: UpdateUserPayload): Promise<AdminUser | null> {
    const res = await fetchApi<ApiUserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.success && res.data) {
      const u = res.data;
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        role: u.role as 'Tourist' | 'Tour Operator' | 'Administrator',
        status: (u.status || 'Active') as 'Active' | 'Inactive' | 'Pending',
        registeredAt: new Date(u.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        phone: u.phone || '+94 77 000 0000',
        totalBookings: 0,
        completedTrips: 0,
        reviewsCount: 0,
      };
    }
    return null;
  },

  // DELETE user from database
  async deleteUser(id: string): Promise<boolean> {
    const res = await fetchApi<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  // TOGGLE status in database
  async toggleUserStatus(id: string): Promise<AdminUser | null> {
    const res = await fetchApi<ApiUserResponse>(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
    if (res.success && res.data) {
      const u = res.data;
      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        role: u.role as 'Tourist' | 'Tour Operator' | 'Administrator',
        status: (u.status || 'Active') as 'Active' | 'Inactive' | 'Pending',
        registeredAt: new Date(u.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        phone: u.phone || '+94 77 000 0000',
        totalBookings: 0,
        completedTrips: 0,
        reviewsCount: 0,
      };
    }
    return null;
  },
};

export type UserRole = 'Tourist' | 'Tour Operator' | 'Administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  location?: string;
  department?: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  lastActive: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

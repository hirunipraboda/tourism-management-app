import { User } from '../types/auth';

export const CURRENT_USER: User = {
  id: 'usr-admin-1',
  name: 'Sarah Lin',
  email: 'sarah.lin@nova-travel.ai',
  role: 'Tour Operator',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  department: 'Operations & AI Journey Planning',
  status: 'Active',
  createdAt: '2025-01-10',
  lastActive: 'Just now',
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'usr-admin-2',
    name: 'David Chen',
    email: 'david.c@nova-travel.ai',
    role: 'Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    department: 'Platform Administration',
    status: 'Active',
    createdAt: '2024-11-01',
    lastActive: '5 mins ago',
  },
  {
    id: 'usr-tourist-1',
    name: 'Elena Rostova',
    email: 'tourist@travellink.lk',
    role: 'Tourist',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    department: 'Travel Explorer',
    status: 'Active',
    createdAt: '2025-03-15',
    lastActive: '1 hour ago',
  },
];

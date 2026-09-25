import {
  LayoutDashboard,
  Compass,
  MapPin,
  Map,
  Route,
  Package,
  CalendarCheck,
  UserCheck,
  Clock,
  Cpu,
  CheckSquare,
  BarChart3,
  Users,
  Settings,
  Palette,
} from 'lucide-react';

export interface NavItemType {
  id: string;
  label: string;
  path: string;
  icon: any;
  badge?: string;
  badgeVariant?: 'primary' | 'accent' | 'amber' | 'neutral';
  section?: 'main' | 'operations' | 'ai' | 'admin' | 'dev';
}

export const NAV_ITEMS: NavItemType[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/dashboard',
    icon: LayoutDashboard,
    section: 'main',
  },

  {
    id: 'tours',
    label: 'Tour Packages',
    path: '/tours',
    icon: Package,
    section: 'operations',
  },
  {
    id: 'bookings',
    label: 'Bookings',
    path: '/bookings',
    icon: CalendarCheck,
    badge: '24',
    badgeVariant: 'amber',
    section: 'operations',
  },
  {
    id: 'guides',
    label: 'Guides',
    path: '/guides',
    icon: UserCheck,
    section: 'operations',
  },
  {
    id: 'availability',
    label: 'Availability',
    path: '/availability',
    icon: Clock,
    section: 'operations',
  },
  {
    id: 'ai-workflows',
    label: 'AI Workflows',
    path: '/ai-workflows',
    icon: Cpu,
    badge: 'AI active',
    badgeVariant: 'accent',
    section: 'ai',
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    section: 'admin',
  },
  {
    id: 'users',
    label: 'Users',
    path: '/users',
    icon: Users,
    section: 'admin',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    section: 'admin',
  },
  {
    id: 'showcase',
    label: 'Design System',
    path: '/showcase',
    icon: Palette,
    badge: 'UI Kit',
    badgeVariant: 'accent',
    section: 'dev',
  },
];


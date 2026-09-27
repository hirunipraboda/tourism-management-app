export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'amber' | 'outline';
export type StatusVariant = 'success' | 'pending' | 'warning' | 'error' | 'info' | 'neutral';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

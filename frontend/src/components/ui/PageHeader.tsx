import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { BreadcrumbItem } from '../../types/ui';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
}) => {
  return (
    <div className="mb-8 pb-4 border-b border-slate-200/60">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0B3A53] tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
};

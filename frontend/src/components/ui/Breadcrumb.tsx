import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { BreadcrumbItem } from '../../types/ui';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1.5 text-xs text-slate-500', className)}>
      <Link to="/dashboard" className="hover:text-[#0B3A53] transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span>NOVA</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast || !item.href ? (
              <span className="font-semibold text-slate-800">{item.label}</span>
            ) : (
              <Link to={item.href} className="hover:text-[#0B3A53] transition-colors">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

import React from 'react';
import { cn } from '../../utils/cn';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return <div className={cn('space-y-8 animate-in fade-in duration-200', className)}>{children}</div>;
};

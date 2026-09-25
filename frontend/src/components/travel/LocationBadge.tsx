import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LocationBadgeProps {
  locationName: string;
  country?: string;
  className?: string;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({ locationName, country, className }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200',
        className
      )}
    >
      <MapPin className="w-3.5 h-3.5 text-[#16A6A1]" />
      <span>
        {locationName}
        {country && `, ${country}`}
      </span>
    </span>
  );
};

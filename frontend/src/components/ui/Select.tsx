import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  className,
  label,
  options,
  error,
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          className={cn(
            'w-full appearance-none bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 pr-10 transition duration-150',
            'focus:outline-none focus:border-[#16A6A1] focus:ring-2 focus:ring-[#16A6A1]/20 cursor-pointer',
            error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};

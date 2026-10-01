import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onClear, placeholder = 'Search destinations, trips, bookings...', ...props }) => {
  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      leftIcon={<Search className="w-4 h-4 text-slate-400" />}
      rightIcon={
        value ? (
          <button
            type="button"
            onClick={onClear}
            className="p-1 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};

import React from 'react';
import { cn } from '../../utils/cn';
import { TableColumn } from '../../types/ui';

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyText?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyText = 'No items found.',
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs', className)}>
      <table className="w-full text-left border-collapse text-sm text-slate-700">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
            {columns.map(col => (
              <th key={col.key} className={cn('px-4 py-3.5', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                <div className="flex justify-center items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#16A6A1] border-t-transparent animate-spin" />
                  <span>Loading NOVA telemetry data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map(item => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                className={cn(
                  'hover:bg-slate-50/80 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

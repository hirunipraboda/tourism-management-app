import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 text-xs text-slate-500">
      <div>
        {totalItems ? (
          <span>
            Showing <strong className="text-slate-800 font-semibold">{startItem}</strong> to{' '}
            <strong className="text-slate-800 font-semibold">{endItem}</strong> of{' '}
            <strong className="text-slate-800 font-semibold">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-slate-800 font-semibold">{currentPage}</strong> of{' '}
            <strong className="text-slate-800 font-semibold">{totalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-4 h-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

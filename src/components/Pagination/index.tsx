'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemLabel?: string;
  onPageChange?: (page: number) => void;
}

function getPaginationRange(
  currentPage: number,
  totalPages: number
): (number | 'ellipsis-start' | 'ellipsis-end')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const showLeftEllipsis = currentPage > 4;
  const showRightEllipsis = currentPage < totalPages - 3;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightPages: number[] = [];
    for (let i = totalPages - 4; i <= totalPages; i++) {
      rightPages.push(i);
    }
    return [1, 'ellipsis-start', ...rightPages];
  }

  return [
    1,
    'ellipsis-start',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-end',
    totalPages,
  ];
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  itemLabel = 'curated branch items',
  onPageChange,
}) => {
  // If there is only 1 page or less, hide pagination completely
  if (totalPages <= 1) {
    return null;
  }

  const handlePrev = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80 mt-8">
      {/* Left items summary text */}
      <p className="text-xs font-bold text-slate-500">
        Showing page <span className="text-slate-900 font-extrabold">{currentPage}</span> of{' '}
        <span className="text-slate-900 font-extrabold">{totalPages}</span>
        {totalItems !== undefined && (
          <span> ({totalItems} {itemLabel})</span>
        )}
      </p>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all ${
            currentPage <= 1
              ? 'text-slate-300 cursor-not-allowed bg-slate-100/60'
              : 'text-slate-700 hover:text-[#D81B60] bg-white border border-slate-200 hover:border-rose-300 shadow-xs cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Dynamic page buttons */}
        {pages.map((item) => {
          if (typeof item === 'string') {
            return (
              <span
                key={item}
                className="text-slate-400 font-extrabold px-1 select-none"
              >
                ...
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => onPageChange?.(item)}
              aria-label={`Page ${item}`}
              aria-current={isActive ? 'page' : undefined}
              className={`w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#D81B60] text-white shadow-md shadow-rose-200'
                  : 'bg-white text-slate-700 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 transition-all ${
            currentPage >= totalPages
              ? 'text-slate-300 cursor-not-allowed bg-slate-100/60'
              : 'text-slate-700 hover:text-[#D81B60] bg-white border border-slate-200 hover:border-rose-300 shadow-xs cursor-pointer'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

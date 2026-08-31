'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav 
      aria-label="Pagination Navigation" 
      className={`flex items-center justify-center gap-1.5 sm:gap-2 mt-12 select-none ${className}`}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
          currentPage === 1
            ? 'opacity-40 cursor-not-allowed text-primary-light/40 dark:text-primary/40'
            : 'glass hover:bg-white/80 dark:hover:bg-white/10 text-primary-light dark:text-primary active:scale-95 shadow-sm border border-white/20'
        }`}
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs text-primary-light/50 dark:text-primary/50"
              >
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = currentPage === pageNum;

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-info-light text-white shadow-lg shadow-info-light/30 scale-105 border border-info-light'
                  : 'glass hover:bg-white/80 dark:hover:bg-white/10 text-primary-light dark:text-primary active:scale-95 border border-white/15'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
          currentPage === totalPages
            ? 'opacity-40 cursor-not-allowed text-primary-light/40 dark:text-primary/40'
            : 'glass hover:bg-white/80 dark:hover:bg-white/10 text-primary-light dark:text-primary active:scale-95 shadow-sm border border-white/20'
        }`}
        aria-label="Next Page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

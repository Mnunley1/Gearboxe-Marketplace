"use client";

import { Button } from "@car-market/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1 sm:gap-2 ${className ?? ""}`}
    >
      <Button
        aria-label="Go to previous page"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        size="sm"
        variant="outline"
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only sm:not-sr-only">Previous</span>
      </Button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-8 items-center justify-center text-gray-400 text-sm"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = currentPage === pageNum;

          return (
            <Button
              key={pageNum}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onPageChange(pageNum)}
              size="sm"
              variant={isActive ? "default" : "ghost"}
              className={`min-w-[2.25rem] font-medium tabular-nums ${
                isActive ? "shadow-sm" : ""
              }`}
            >
              {pageNum}
            </Button>
          );
        })}
      </div>

      <Button
        aria-label="Go to next page"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        size="sm"
        variant="outline"
        className="gap-1"
      >
        <span className="sr-only sm:not-sr-only">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

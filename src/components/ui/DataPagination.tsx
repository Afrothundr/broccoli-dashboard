import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

export interface DataPaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of items */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of page links to show around current page (default: 1) */
  paginationWindow?: number;
  /** Whether to show pagination when total items <= pageSize (default: false) */
  showWhenSinglePage?: boolean;
  /** Custom className for the pagination container */
  className?: string;
}

export const DataPagination: React.FC<DataPaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  paginationWindow = 1,
  showWhenSinglePage = false,
  className,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Don't render if there's only one page or less, unless explicitly requested
  if (!showWhenSinglePage && totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  // Generate pagination structure with proper ellipsis handling
  const getPaginationItems = () => {
    const items: (number | "ellipsis")[] = [];

    // Always show first page
    items.push(1);

    // Calculate the range around current page
    const startPage = Math.max(2, currentPage - paginationWindow);
    const endPage = Math.min(totalPages - 1, currentPage + paginationWindow);

    // Add ellipsis after first page if there's a gap
    if (startPage > 2) {
      items.push("ellipsis");
    }

    // Add pages in the middle range
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        items.push(i);
      }
    }

    // Add ellipsis before last page if there's a gap
    if (endPage < totalPages - 1) {
      items.push("ellipsis");
    }

    // Always show last page (if it's different from first)
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  const paginationItems = getPaginationItems();

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={handlePrevious}
            aria-disabled={currentPage <= 1}
            className={
              currentPage <= 1
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>

        {paginationItems.map((item, index) => (
          <PaginationItem key={`${item}-${index}`}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => handlePageClick(item)}
                isActive={currentPage === item}
                className="cursor-pointer"
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            aria-disabled={currentPage >= totalPages}
            className={
              currentPage >= totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

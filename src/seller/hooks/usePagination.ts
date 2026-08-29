'use client';

import { useState, useMemo } from 'react';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePagination<T>(
  items: T[],
  itemsPerPage: number = 10
): PaginationState & {
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
} {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationState = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    return {
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [currentPage, items.length, itemsPerPage]);

  const paginatedItems = useMemo(
    () => items.slice(paginationState.startIndex, paginationState.endIndex),
    [items, paginationState.startIndex, paginationState.endIndex]
  );

  const goToPage = (page: number) => {
    const maxPage = Math.ceil(items.length / itemsPerPage);
    setCurrentPage(Math.max(1, Math.min(page, maxPage)));
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    ...paginationState,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
  };
}

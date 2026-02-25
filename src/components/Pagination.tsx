import { Button } from "@/components";
import type { TPagination } from '@/types';

interface PaginationProps {
  pagination: TPagination;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, pages } = pagination;
  
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (string | number)[] = [];
    let l: number;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-4">
      <Button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </Button>
      
      {getPageNumbers().map((pageNum, idx) => (
        pageNum === '...' ? (
          <span key={`dots-${idx}`} className="px-2">...</span>
        ) : (
          <Button
            key={pageNum}
            onClick={() => onPageChange(pageNum as number)}
            className={`px-4 py-2 ${
              page === pageNum
                ? 'bg-primary text-white hover:bg-secondary'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {pageNum}
          </Button>
        )
      ))}
      
      <Button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </Button>
    </div>
  );
}
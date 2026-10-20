import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  const baseButton =
    "min-w-10 h-10 px-3 flex items-center justify-center gap-1 rounded-md border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
      <button
        type="button"
        className={`${baseButton} border-gray-300 bg-white text-gray-700 hover:bg-gray-100`}
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page === 0}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`${baseButton} ${
            i === page
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onPageChange(i)}
          disabled={disabled}
          aria-current={i === page ? "page" : undefined}
        >
          {i + 1}
        </button>
      ))}

      <button
        type="button"
        className={`${baseButton} border-gray-300 bg-white text-gray-700 hover:bg-gray-100`}
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages - 1}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

export default Pagination;

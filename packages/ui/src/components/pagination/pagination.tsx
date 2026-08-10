import { Button } from "../button/button";
import { classNames } from "../../lib/class-names";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  return (
    <nav
      aria-label="Pagination"
      className={classNames("flex items-center justify-between gap-3", className)}
    >
      <Button
        size="small"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1);
        }}
      >
        Previous
      </Button>
      <p className="numeric-data text-sm text-text-muted">
        Page {page} of {totalPages}
      </p>
      <Button
        size="small"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => {
          onPageChange(page + 1);
        }}
      >
        Next
      </Button>
    </nav>
  );
}

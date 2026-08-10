import type { ComponentProps, ReactNode } from "react";

import { classNames } from "../../lib/class-names";

export function Table({ className, children, ...restProps }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-large border border-outline bg-surface-raised">
      <table className={classNames("w-full border-collapse text-sm", className)} {...restProps}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ className, ...restProps }: ComponentProps<"thead">) {
  return (
    <thead
      className={classNames(
        "sticky top-0 z-10 border-b border-outline bg-surface-raised text-left",
        className,
      )}
      {...restProps}
    />
  );
}

export function TableBody({ className, ...restProps }: ComponentProps<"tbody">) {
  return <tbody className={classNames("divide-y divide-outline", className)} {...restProps} />;
}

export function TableRow({ className, ...restProps }: ComponentProps<"tr">) {
  return (
    <tr
      className={classNames("transition-colors duration-150 hover:bg-surface-sunken/60", className)}
      {...restProps}
    />
  );
}

export type TableSortDirection = "asc" | "desc" | null;

export interface TableHeaderCellProps extends ComponentProps<"th"> {
  sortDirection?: TableSortDirection;
  onSortToggle?: () => void;
  numeric?: boolean;
  children: ReactNode;
}

const ARIA_SORT_VALUES = {
  asc: "ascending",
  desc: "descending",
} as const;

export function TableHeaderCell({
  sortDirection,
  onSortToggle,
  numeric = false,
  className,
  children,
  ...restProps
}: TableHeaderCellProps) {
  const isSortable = onSortToggle !== undefined;
  return (
    <th
      aria-sort={sortDirection != null ? ARIA_SORT_VALUES[sortDirection] : undefined}
      className={classNames(
        "whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted",
        numeric && "text-right",
        className,
      )}
      {...restProps}
    >
      {isSortable ? (
        <button
          type="button"
          onClick={onSortToggle}
          className={classNames(
            "inline-flex items-center gap-1 rounded-small uppercase tracking-wide transition-colors duration-150 hover:text-text-primary",
            sortDirection != null && "text-text-primary",
            numeric && "flex-row-reverse",
          )}
        >
          {children}
          <span aria-hidden className="inline-flex flex-col leading-none">
            <svg
              viewBox="0 0 8 5"
              className={classNames("w-2", sortDirection === "asc" ? "opacity-100" : "opacity-30")}
              fill="currentColor"
            >
              <path d="M4 0 8 5H0L4 0Z" />
            </svg>
            <svg
              viewBox="0 0 8 5"
              className={classNames(
                "mt-0.5 w-2 rotate-180",
                sortDirection === "desc" ? "opacity-100" : "opacity-30",
              )}
              fill="currentColor"
            >
              <path d="M4 0 8 5H0L4 0Z" />
            </svg>
          </span>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableCellProps extends ComponentProps<"td"> {
  numeric?: boolean;
}

export function TableCell({ numeric = false, className, ...restProps }: TableCellProps) {
  return (
    <td
      className={classNames(
        "px-3 py-2.5 text-text-primary",
        numeric && "numeric-data text-right",
        className,
      )}
      {...restProps}
    />
  );
}

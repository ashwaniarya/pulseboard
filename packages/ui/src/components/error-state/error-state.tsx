import { classNames } from "../../lib/class-names";
import { Button } from "../button/button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Couldn't load this data",
  description = "The request failed. Cached values may still be shown elsewhere.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="status"
      className={classNames(
        "flex flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-full bg-negative-surface text-negative"
      >
        <svg viewBox="0 0 16 16" className="size-4" fill="none">
          <path
            d="M8 5.5v3.25m0 2.5v.01M8 1.75 1.5 13.25h13L8 1.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="max-w-64 text-sm text-text-muted">{description}</p>
      {onRetry !== undefined && (
        <Button size="small" variant="secondary" onClick={onRetry} className="mt-1.5">
          Try again
        </Button>
      )}
    </div>
  );
}

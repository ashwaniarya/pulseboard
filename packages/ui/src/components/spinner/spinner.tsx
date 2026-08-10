import { classNames } from "../../lib/class-names";

export interface SpinnerProps {
  size?: "small" | "medium";
  label?: string;
  className?: string;
}

export function Spinner({ size = "medium", label = "Loading", className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={classNames("inline-flex", className)}>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        className={classNames("animate-spin text-current", size === "small" ? "size-4" : "size-5")}
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

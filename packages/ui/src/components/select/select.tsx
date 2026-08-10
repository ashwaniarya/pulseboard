import { useId, type ComponentProps } from "react";

import { classNames } from "../../lib/class-names";

export interface SelectProps extends Omit<ComponentProps<"select">, "id"> {
  label: string;
  hideLabel?: boolean;
}

export function Select({
  label,
  hideLabel = false,
  className,
  children,
  ...restProps
}: SelectProps) {
  const selectId = useId();
  return (
    <div className={classNames("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={selectId}
        className={
          hideLabel
            ? "absolute size-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
            : "text-sm font-medium text-text-primary"
        }
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className="h-10 w-full appearance-none rounded-medium border border-outline bg-surface-raised pl-3 pr-9 text-sm text-text-primary transition-colors duration-150 hover:border-outline-strong disabled:cursor-not-allowed disabled:opacity-50"
          {...restProps}
        >
          {children}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
          fill="none"
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

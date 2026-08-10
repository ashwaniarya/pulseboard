import { useId, type ComponentProps } from "react";

import { classNames } from "../../lib/class-names";

export interface InputProps extends Omit<ComponentProps<"input">, "id"> {
  label: string;
  description?: string;
  errorMessage?: string;
  invalid?: boolean;
}

export function Input({
  label,
  description,
  errorMessage,
  invalid = false,
  className,
  ...restProps
}: InputProps) {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [description ? descriptionId : null, invalid && errorMessage ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={classNames("flex w-full flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        className={classNames(
          "h-10 rounded-medium border bg-surface-raised px-3 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-negative" : "border-outline hover:border-outline-strong",
        )}
        {...restProps}
      />
      {description !== undefined && (
        <p id={descriptionId} className="text-xs text-text-muted">
          {description}
        </p>
      )}
      {invalid && errorMessage !== undefined && (
        <p id={errorId} className="text-xs font-medium text-negative">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "../../lib/class-names";
import { Spinner } from "../spinner/spinner";

const buttonStyles = cva(
  "relative inline-flex select-none items-center justify-center gap-2 rounded-medium font-medium transition-colors duration-150 ease-standard disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
        secondary:
          "border border-outline bg-surface-raised text-text-primary hover:border-outline-strong hover:bg-surface-sunken",
        ghost: "text-text-primary hover:bg-surface-sunken",
        destructive: "bg-negative text-white hover:opacity-90",
      },
      size: {
        small: "h-8 px-3 text-sm",
        medium: "h-10 px-4 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  },
);

export interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonStyles> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  type,
  onClick,
  children,
  ...restProps
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={classNames(buttonStyles({ variant, size }), className)}
      aria-busy={isLoading || undefined}
      onClick={isLoading ? undefined : onClick}
      {...restProps}
    >
      {isLoading ? (
        <>
          <span className="absolute inset-0 grid place-items-center">
            <Spinner size="small" label="Working" />
          </span>
          <span aria-hidden className="opacity-0">
            {children}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

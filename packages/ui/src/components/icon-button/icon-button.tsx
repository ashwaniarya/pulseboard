import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "../../lib/class-names";

const iconButtonStyles = cva(
  "inline-flex select-none items-center justify-center rounded-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
        secondary:
          "border border-outline bg-surface-raised text-text-primary hover:border-outline-strong hover:bg-surface-sunken",
        ghost: "text-text-muted hover:bg-surface-sunken hover:text-text-primary",
      },
      size: {
        small: "size-8",
        medium: "size-10",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "medium",
    },
  },
);

export interface IconButtonProps
  extends Omit<ComponentProps<"button">, "aria-label">, VariantProps<typeof iconButtonStyles> {
  label: string;
}

export function IconButton({
  className,
  variant,
  size,
  label,
  type,
  children,
  ...restProps
}: IconButtonProps) {
  return (
    <button
      type={type ?? "button"}
      aria-label={label}
      title={label}
      className={classNames(iconButtonStyles({ variant, size }), className)}
      {...restProps}
    >
      {children}
    </button>
  );
}

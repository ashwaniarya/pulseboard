import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "../../lib/class-names";

const badgeStyles = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-surface-sunken text-text-muted",
        positive: "bg-positive-surface text-positive",
        negative: "bg-negative-surface text-negative",
        warning: "bg-warning-surface text-warning",
        accent: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export interface BadgeProps extends ComponentProps<"span">, VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, children, ...restProps }: BadgeProps) {
  return (
    <span className={classNames(badgeStyles({ tone }), className)} {...restProps}>
      {children}
    </span>
  );
}

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { classNames } from "../../lib/class-names";

const cardStyles = cva("rounded-large border border-outline bg-surface-raised shadow-raised", {
  variants: {
    padding: {
      none: "",
      medium: "p-5",
    },
  },
  defaultVariants: {
    padding: "medium",
  },
});

export interface CardProps extends ComponentProps<"div">, VariantProps<typeof cardStyles> {}

export function Card({ className, padding, children, ...restProps }: CardProps) {
  return (
    <div className={classNames(cardStyles({ padding }), className)} {...restProps}>
      {children}
    </div>
  );
}

import { cva, type VariantProps } from "class-variance-authority";

import { classNames } from "../../lib/class-names";

const skeletonStyles = cva("animate-pulse bg-surface-sunken", {
  variants: {
    shape: {
      text: "h-4 w-full rounded-small",
      rectangle: "rounded-medium",
      circle: "rounded-full",
    },
  },
  defaultVariants: {
    shape: "rectangle",
  },
});

export interface SkeletonProps extends VariantProps<typeof skeletonStyles> {
  className?: string;
}

export function Skeleton({ shape, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames("block", skeletonStyles({ shape }), className)}
    />
  );
}

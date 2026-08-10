import * as PopoverPrimitive from "@radix-ui/react-popover";
import type { ComponentProps } from "react";

import { classNames } from "../../lib/class-names";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;

export interface PopoverContentProps extends ComponentProps<typeof PopoverPrimitive.Content> {
  label: string;
}

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  label,
  children,
  ...restProps
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        aria-label={label}
        align={align}
        sideOffset={sideOffset}
        className={classNames(
          "z-50 rounded-large border border-outline bg-surface-raised p-3 shadow-overlay outline-none",
          className,
        )}
        {...restProps}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

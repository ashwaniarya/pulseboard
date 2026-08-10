import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ComponentProps } from "react";

import { classNames } from "../../lib/class-names";
import { IconButton } from "../icon-button/icon-button";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogTitle({
  className,
  ...restProps
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={classNames("text-lg font-semibold text-text-primary", className)}
      {...restProps}
    />
  );
}

export function DialogDescription({
  className,
  ...restProps
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={classNames("text-sm text-text-muted", className)}
      {...restProps}
    />
  );
}

export interface DialogContentProps extends ComponentProps<typeof DialogPrimitive.Content> {
  size?: "medium" | "full";
}

export function DialogContent({
  className,
  size = "medium",
  children,
  ...restProps
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        className={classNames(
          "fixed z-50 flex flex-col gap-3 border-outline bg-surface-raised p-5 shadow-overlay outline-none",
          size === "medium" &&
            "left-1/2 top-1/2 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-large border",
          size === "full" && "inset-x-0 bottom-0 max-h-[85vh] rounded-t-large border-t",
          className,
        )}
        {...restProps}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <IconButton label="Close" size="small" className="absolute right-3 top-3">
            <svg aria-hidden viewBox="0 0 16 16" width="14" height="14" fill="none">
              <path
                d="m4 4 8 8m0-8-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

import type { ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return (
    <span className="absolute size-px overflow-hidden whitespace-nowrap p-0 [clip-path:inset(50%)]">
      {children}
    </span>
  );
}

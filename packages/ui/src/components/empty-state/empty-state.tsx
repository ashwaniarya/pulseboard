import type { ReactNode } from "react";

import { classNames } from "../../lib/class-names";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={classNames(
        "flex flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        className,
      )}
    >
      {icon !== undefined && (
        <div aria-hidden className="text-text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      {description !== undefined && (
        <p className="max-w-64 text-sm text-text-muted">{description}</p>
      )}
      {action !== undefined && <div className="pt-1.5">{action}</div>}
    </div>
  );
}

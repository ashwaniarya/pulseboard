import type { ReactNode } from "react";

import { classNames } from "../../lib/class-names";
import { Card } from "../card/card";
import { EmptyState } from "../empty-state/empty-state";
import { ErrorState } from "../error-state/error-state";
import { Skeleton } from "../skeleton/skeleton";

export type ChartCardStatus = "loading" | "empty" | "error" | "ready";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  toolbar?: ReactNode;
  status?: ChartCardStatus;
  emptyState?: ReactNode;
  onRetry?: () => void;
  minBodyHeightClassName?: string;
  children?: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  toolbar,
  status = "ready",
  emptyState,
  onRetry,
  minBodyHeightClassName = "min-h-64",
  children,
  className,
}: ChartCardProps) {
  return (
    <Card
      aria-busy={status === "loading" || undefined}
      className={classNames("flex flex-col gap-4", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          {subtitle !== undefined && <p className="text-xs text-text-muted">{subtitle}</p>}
        </div>
        {toolbar !== undefined && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>
      <div className={classNames("flex flex-col justify-center", minBodyHeightClassName)}>
        {status === "loading" && <Skeleton shape="rectangle" className="h-full min-h-48 w-full" />}
        {status === "error" && <ErrorState onRetry={onRetry} />}
        {status === "empty" &&
          (emptyState ?? (
            <EmptyState
              title="No data in this range"
              description="Widen the date range or clear filters to see activity."
            />
          ))}
        {status === "ready" && children}
      </div>
    </Card>
  );
}

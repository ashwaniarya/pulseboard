import type { ReactNode } from "react";

import { classNames } from "../../lib/class-names";
import { Card } from "../card/card";
import { Skeleton } from "../skeleton/skeleton";
import { VisuallyHidden } from "../visually-hidden/visually-hidden";

export type KpiDeltaDirection = "up" | "down" | "flat";
export type KpiDeltaSentiment = "positive" | "negative" | "neutral";

export interface KpiDelta {
  percentText: string;
  direction: KpiDeltaDirection;
  sentiment: KpiDeltaSentiment;
}

export interface KpiStatTileProps {
  label: string;
  value: string;
  delta?: KpiDelta;
  sparkline?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

const SENTIMENT_TEXT_CLASSES: Record<KpiDeltaSentiment, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-text-muted",
};

const DIRECTION_WORDS: Record<KpiDeltaDirection, string> = {
  up: "up",
  down: "down",
  flat: "flat at",
};

function DeltaArrow({ direction }: { direction: KpiDeltaDirection }) {
  if (direction === "flat") {
    return (
      <svg aria-hidden viewBox="0 0 12 12" className="size-3" fill="none">
        <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={classNames("size-3", direction === "down" && "rotate-180")}
      fill="none"
    >
      <path
        d="M6 10V2m0 0L2.5 5.5M6 2l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiStatTile({
  label,
  value,
  delta,
  sparkline,
  isLoading = false,
  className,
}: KpiStatTileProps) {
  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        className={classNames("flex h-[7.5rem] flex-col justify-between", className)}
      >
        <Skeleton shape="rectangle" className="h-3.5 w-24" />
        <Skeleton shape="rectangle" className="h-8 w-32" />
        <Skeleton shape="rectangle" className="h-3.5 w-20" />
      </Card>
    );
  }

  return (
    <Card className={classNames("flex h-[7.5rem] flex-col justify-between", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
        {delta !== undefined && (
          <p
            className={classNames(
              "flex items-center gap-1 text-xs font-medium",
              SENTIMENT_TEXT_CLASSES[delta.sentiment],
            )}
          >
            <DeltaArrow direction={delta.direction} />
            <span aria-hidden>{delta.percentText}</span>
            <VisuallyHidden>
              {`${DIRECTION_WORDS[delta.direction]} ${delta.percentText} versus the previous period`}
            </VisuallyHidden>
          </p>
        )}
      </div>
      <p className="numeric-data text-3xl text-text-primary">{value}</p>
      <div className="h-9">{sparkline}</div>
    </Card>
  );
}

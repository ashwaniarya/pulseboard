import { ErrorState } from "@pulseboard/ui";
import type { ReactNode } from "react";

export interface QueryStateLike<TData> {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  data?: TData;
  refetch: () => void;
}

export interface QueryStateGateProps<TData> {
  query: QueryStateLike<TData>;
  skeleton: ReactNode;
  empty?: ReactNode;
  emptyWhen?: (data: TData) => boolean;
  children: (data: TData) => ReactNode;
}

export function QueryStateGate<TData>({
  query,
  skeleton,
  empty,
  emptyWhen,
  children,
}: QueryStateGateProps<TData>) {
  const { data } = query;

  if (data === undefined) {
    if (query.isError) {
      return (
        <ErrorState
          onRetry={() => {
            query.refetch();
          }}
        />
      );
    }
    return <>{skeleton}</>;
  }

  if (emptyWhen?.(data) === true) {
    return <>{empty ?? skeleton}</>;
  }

  return (
    <div className="relative">
      {children(data)}
      {query.isFetching && (
        <div
          data-testid="query-refreshing-overlay"
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-pulse rounded-large bg-surface/40"
        />
      )}
    </div>
  );
}

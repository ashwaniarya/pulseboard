import { Badge, ChartCard } from "@pulseboard/ui";

import { useAppSelector } from "../../app/hooks";
import { QueryStateGate } from "../../components/feedback/QueryStateGate";
import { formatCount, formatPercentValue } from "../../lib/formatters";
import { selectMetricsQueryArgs } from "../filters/selectMetricsQueryArgs";
import { useGetLocationsQuery } from "../locations/locationsApi";
import { rankLocationsByAnswerRate } from "./transforms";
import { useGetDailyMetricsQuery } from "./overviewApi";

export function LocationLeaderboard() {
  const queryArgs = useAppSelector(selectMetricsQueryArgs);
  const dailyQuery = useGetDailyMetricsQuery(queryArgs);
  const locationsQuery = useGetLocationsQuery();

  return (
    <ChartCard
      title="Answer-rate leaderboard"
      subtitle="Which offices pick up, and which are leaving calls on the table"
      minBodyHeightClassName="min-h-48"
      status={dailyQuery.isLoading ? "loading" : "ready"}
    >
      <QueryStateGate query={dailyQuery} skeleton={null}>
        {(payload) => {
          const locationNames = new Map(
            (locationsQuery.data ?? []).map((location) => [location.id, location.name]),
          );
          const ranked = rankLocationsByAnswerRate(payload.rows, locationNames);
          const bestRate = ranked[0]?.answerRatePercent ?? 100;
          return (
            <ol className="divide-y divide-outline">
              {ranked.map((row, index) => (
                <li key={row.locationId} className="flex items-center gap-3 py-2">
                  <span className="numeric-data w-6 text-right text-xs text-text-muted">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-text-primary">
                      {row.locationName}
                    </span>
                    <span
                      aria-hidden
                      className="mt-1 block h-1 rounded-full bg-chart-1/80"
                      style={{
                        width: `${String(Math.max(4, (row.answerRatePercent / bestRate) * 100))}%`,
                      }}
                    />
                  </span>
                  <span className="numeric-data text-sm text-text-primary">
                    {formatPercentValue(row.answerRatePercent)}
                  </span>
                  <span className="numeric-data hidden w-24 text-right text-xs text-text-muted sm:block">
                    {formatCount(row.answeredCalls)} ans.
                  </span>
                  {index === ranked.length - 1 && ranked.length > 1 && (
                    <Badge tone="warning">Needs attention</Badge>
                  )}
                </li>
              ))}
            </ol>
          );
        }}
      </QueryStateGate>
    </ChartCard>
  );
}

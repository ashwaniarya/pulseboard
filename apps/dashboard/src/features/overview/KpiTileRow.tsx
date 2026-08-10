import { KpiStatTile, Sparkline } from "@pulseboard/ui";

import { useAppSelector } from "../../app/hooks";
import { QueryStateGate } from "../../components/feedback/QueryStateGate";
import { selectMetricsQueryArgs } from "../filters/selectMetricsQueryArgs";
import { buildKpiTileModels } from "./transforms";
import { useGetDailyMetricsQuery, useGetMetricsSummaryQuery } from "./overviewApi";

const TILE_GRID_CLASSES = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

function KpiTileRowSkeleton() {
  return (
    <div className={TILE_GRID_CLASSES}>
      {Array.from({ length: 6 }, (_unusedValue, index) => (
        <KpiStatTile key={index} label="Loading key metrics" value="" isLoading />
      ))}
    </div>
  );
}

export function KpiTileRow() {
  const queryArgs = useAppSelector(selectMetricsQueryArgs);
  const summaryQuery = useGetMetricsSummaryQuery(queryArgs);
  const dailyQuery = useGetDailyMetricsQuery(queryArgs);

  return (
    <QueryStateGate query={summaryQuery} skeleton={<KpiTileRowSkeleton />}>
      {(summary) => (
        <div className={TILE_GRID_CLASSES}>
          {buildKpiTileModels(summary.current, summary.previous, dailyQuery.data?.rows ?? []).map(
            (tile) => (
              <KpiStatTile
                key={tile.key}
                label={tile.label}
                value={tile.value}
                delta={tile.delta ?? undefined}
                sparkline={
                  tile.sparklineValues.length > 1 ? (
                    <Sparkline
                      values={tile.sparklineValues}
                      className={tile.downIsGood ? "text-negative/70" : "text-chart-1"}
                    />
                  ) : undefined
                }
              />
            ),
          )}
        </div>
      )}
    </QueryStateGate>
  );
}

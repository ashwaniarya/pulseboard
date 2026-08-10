import { ChartCard, Select } from "@pulseboard/ui";
import { useState } from "react";

import { useAppSelector } from "../../app/hooks";
import { TrendChart } from "../../components/charts/TrendChart";
import { QueryStateGate } from "../../components/feedback/QueryStateGate";
import { selectMetricsQueryArgs } from "../filters/selectMetricsQueryArgs";
import { buildTrendChartModel, type TrendMetricFamily } from "./transforms";
import { useGetDailyMetricsQuery } from "./overviewApi";

const FAMILY_LABELS: Record<TrendMetricFamily, string> = {
  calls: "Calls",
  appointments: "Appointments",
  revenue: "Revenue",
};

export function TrendSection() {
  const queryArgs = useAppSelector(selectMetricsQueryArgs);
  const dailyQuery = useGetDailyMetricsQuery(queryArgs);
  const [metricFamily, setMetricFamily] = useState<TrendMetricFamily>("calls");

  return (
    <ChartCard
      title="Daily trend"
      subtitle="Totals across the selected locations; shaded bands mark known incidents"
      toolbar={
        <Select
          label="Metric family"
          hideLabel
          value={metricFamily}
          onChange={(event) => {
            setMetricFamily(event.target.value as TrendMetricFamily);
          }}
          className="w-40"
        >
          {Object.entries(FAMILY_LABELS).map(([familyKey, label]) => (
            <option key={familyKey} value={familyKey}>
              {label}
            </option>
          ))}
        </Select>
      }
      status={
        dailyQuery.isLoading
          ? "loading"
          : dailyQuery.isError && dailyQuery.data === undefined
            ? "error"
            : "ready"
      }
      onRetry={() => {
        void dailyQuery.refetch();
      }}
    >
      <QueryStateGate query={dailyQuery} skeleton={null}>
        {(payload) => (
          <TrendChart
            series={buildTrendChartModel(payload.rows, metricFamily).series}
            anomalyBands={payload.anomalyWindows}
            ariaLabel={`Daily ${FAMILY_LABELS[metricFamily]} trend for the selected date range`}
          />
        )}
      </QueryStateGate>
    </ChartCard>
  );
}

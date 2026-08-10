import { Button } from "@pulseboard/ui";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { baseApi } from "../../services/api/baseApi";
import { apiRequestSucceeded } from "./apiHealthSlice";

export function ApiStatusBanner() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.apiHealth.status);
  if (status !== "degraded") {
    return null;
  }
  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-2 border-b border-warning/40 bg-warning-surface px-4 py-2"
    >
      <p className="text-sm text-warning">
        Live data is having trouble — showing the last loaded values.
      </p>
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          dispatch(apiRequestSucceeded());
          dispatch(
            baseApi.util.invalidateTags(["MetricsSummary", "DailyMetrics", "Calls", "Locations"]),
          );
        }}
      >
        Retry all
      </Button>
    </div>
  );
}

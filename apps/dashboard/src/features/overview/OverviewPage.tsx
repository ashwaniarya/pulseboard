import { WidgetErrorBoundary } from "../../components/feedback/WidgetErrorBoundary";
import { KpiTileRow } from "./KpiTileRow";
import { LocationLeaderboard } from "./LocationLeaderboard";
import { TrendSection } from "./TrendSection";

export function OverviewPage() {
  return (
    <div className="space-y-4 p-6">
      <WidgetErrorBoundary>
        <KpiTileRow />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary>
        <TrendSection />
      </WidgetErrorBoundary>
      <WidgetErrorBoundary>
        <LocationLeaderboard />
      </WidgetErrorBoundary>
    </div>
  );
}

export const Component = OverviewPage;

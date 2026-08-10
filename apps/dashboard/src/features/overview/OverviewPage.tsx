import { WidgetErrorBoundary } from "../../components/feedback/WidgetErrorBoundary";
import { KpiTileRow } from "./KpiTileRow";

export function OverviewPage() {
  return (
    <div className="space-y-4 p-6">
      <WidgetErrorBoundary>
        <KpiTileRow />
      </WidgetErrorBoundary>
    </div>
  );
}

export const Component = OverviewPage;

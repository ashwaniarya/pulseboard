import { PulseBrandMark } from "@pulseboard/ui";

export function App() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <PulseBrandMark />
        <p className="text-sm text-text-muted">Booting the dashboard…</p>
      </div>
    </div>
  );
}

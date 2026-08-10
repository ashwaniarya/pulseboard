import { Button, ErrorState } from "@pulseboard/ui";

export function RouteErrorFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface">
      <ErrorState
        title="This page failed to load"
        description="A fresh deploy may have replaced this version of the app."
      />
      <Button
        variant="secondary"
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload the app
      </Button>
    </div>
  );
}

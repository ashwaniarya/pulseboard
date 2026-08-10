import * as Sentry from "@sentry/react";

export function initializeSentryIfConfigured(dsn: string | undefined): boolean {
  if (dsn === undefined || dsn === "") {
    return false;
  }
  Sentry.init({
    dsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  });
  return true;
}

export function reportCaughtError(error: unknown): void {
  Sentry.captureException(error);
}

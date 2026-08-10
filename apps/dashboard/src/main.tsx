import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { startMockApi } from "@pulseboard/mock-api/browser";

import { App } from "./app/App";
import "./styles/app.css";

async function bootDashboard(): Promise<void> {
  await startMockApi();
  const rootElement = document.getElementById("root");
  if (rootElement === null) {
    throw new Error("Missing #root element");
  }
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootDashboard();

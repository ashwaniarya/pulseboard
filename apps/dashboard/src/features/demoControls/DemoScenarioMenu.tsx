import {
  SCENARIO_PRESETS,
  SCENARIO_STORAGE_KEY,
  setActiveScenario,
  type ScenarioKey,
} from "@pulseboard/mock-api/scenarios";
import { Badge, Button, Popover, PopoverContent, PopoverTrigger } from "@pulseboard/ui";
import { useState } from "react";

import { useAppDispatch } from "../../app/hooks";
import { reportCaughtError } from "../../observability/sentry";
import { baseApi } from "../../services/api/baseApi";

export function DemoScenarioMenu() {
  const dispatch = useAppDispatch();
  const [activeKey, setActiveKey] = useState<ScenarioKey>(() => {
    const stored = window.localStorage.getItem(SCENARIO_STORAGE_KEY);
    return stored !== null && stored in SCENARIO_PRESETS ? (stored as ScenarioKey) : "healthy";
  });

  const applyScenario = (key: ScenarioKey) => {
    setActiveScenario(key);
    window.localStorage.setItem(SCENARIO_STORAGE_KEY, key);
    setActiveKey(key);
    dispatch(baseApi.util.invalidateTags(["MetricsSummary", "DailyMetrics", "Calls", "Locations"]));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="small">
          Demo
          {activeKey !== "healthy" && (
            <Badge tone="warning">{SCENARIO_PRESETS[activeKey].label}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent label="Demo scenarios" className="w-72 p-2">
        <p className="px-2 pb-2 text-xs text-text-muted">
          Flip the mock API into failure modes and watch the error architecture respond.
        </p>
        <div className="flex flex-col gap-1">
          <Button
            size="small"
            variant="ghost"
            className="justify-start"
            onClick={() => {
              reportCaughtError(new Error("Pulseboard demo: handled exception"));
            }}
          >
            Capture a handled exception (Sentry)
          </Button>
          {Object.values(SCENARIO_PRESETS).map((scenario) => (
            <Button
              key={scenario.key}
              size="small"
              variant={scenario.key === activeKey ? "primary" : "ghost"}
              className="h-auto flex-col items-start gap-0.5 py-2 text-left"
              onClick={() => {
                applyScenario(scenario.key);
              }}
            >
              <span>{scenario.label}</span>
              <span className="text-xs font-normal opacity-80">{scenario.description}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

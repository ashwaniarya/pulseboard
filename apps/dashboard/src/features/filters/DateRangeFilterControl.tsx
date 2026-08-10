import { DateRangePicker, type DateRangePickerPreset } from "@pulseboard/ui";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  DATE_RANGE_PRESETS,
  isDateRangePresetId,
  resolveDateRangePreset,
  todayIsoDate,
} from "../../lib/dateRange";
import { dateRangeChanged } from "./filtersSlice";

export function DateRangeFilterControl() {
  const dispatch = useAppDispatch();
  const dateRange = useAppSelector((state) => state.filters.dateRange);
  const todayIso = todayIsoDate();
  const presets: DateRangePickerPreset[] = DATE_RANGE_PRESETS.map((preset) => ({
    id: preset.id,
    label: preset.label,
    range: resolveDateRangePreset(preset.id, todayIso),
  }));
  return (
    <DateRangePicker
      value={{ startDate: dateRange.startDate, endDate: dateRange.endDate }}
      presets={presets}
      activePresetId={dateRange.presetId}
      onRangeChange={(range, presetId) => {
        dispatch(
          dateRangeChanged({
            range,
            presetId: isDateRangePresetId(presetId) ? presetId : null,
          }),
        );
      }}
    />
  );
}

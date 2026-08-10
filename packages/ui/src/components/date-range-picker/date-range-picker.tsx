import { useState } from "react";
import { DayPicker, type DateRange as DayPickerRange } from "react-day-picker";
import "react-day-picker/style.css";

import { classNames } from "../../lib/class-names";
import { Button } from "../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

export interface DateRangePickerPreset {
  id: string;
  label: string;
  range: DateRangeValue;
}

export interface DateRangePickerProps {
  value: DateRangeValue;
  presets: readonly DateRangePickerPreset[];
  activePresetId?: string | null;
  onRangeChange: (range: DateRangeValue, presetId: string | null) => void;
  label?: string;
  defaultCalendarMonth?: Date;
  className?: string;
}

function isoDateToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function localDateToIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${String(date.getFullYear())}-${month}-${day}`;
}

const rangeLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function formatDateRangeLabel(range: DateRangeValue): string {
  const startLabel = rangeLabelFormatter.format(isoDateToLocalDate(range.startDate));
  const endDate = isoDateToLocalDate(range.endDate);
  const endLabel = rangeLabelFormatter.format(endDate);
  return `${startLabel} – ${endLabel}, ${String(endDate.getFullYear())}`;
}

export function DateRangePicker({
  value,
  presets,
  activePresetId = null,
  onRangeChange,
  label = "Date range",
  defaultCalendarMonth,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DayPickerRange | undefined>(undefined);

  const activePreset = presets.find((preset) => preset.id === activePresetId);
  const triggerLabel = activePreset?.label ?? formatDateRangeLabel(value);

  const handleCalendarSelect = (selectedRange: DayPickerRange | undefined) => {
    const isFirstClickOfSelection = pendingRange === undefined;
    if (
      isFirstClickOfSelection ||
      selectedRange?.from === undefined ||
      selectedRange.to === undefined
    ) {
      setPendingRange(selectedRange);
      return;
    }
    onRangeChange(
      {
        startDate: localDateToIsoDate(selectedRange.from),
        endDate: localDateToIsoDate(selectedRange.to),
      },
      null,
    );
    setIsOpen(false);
    setPendingRange(undefined);
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(nextOpen) => {
        setIsOpen(nextOpen);
        if (!nextOpen) {
          setPendingRange(undefined);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="secondary" className={className} aria-label={`${label}: ${triggerLabel}`}>
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 text-text-muted" fill="none">
            <rect
              x="2"
              y="3"
              width="12"
              height="11"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              d="M2 6.5h12M5.5 1.75v2.5m5-2.5v2.5"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent label={label} className="flex gap-3 p-3">
        <div
          className="flex min-w-32 flex-col gap-1 border-r border-outline pr-3"
          role="group"
          aria-label="Preset ranges"
        >
          {presets.map((preset) => (
            <Button
              key={preset.id}
              size="small"
              variant={preset.id === activePresetId ? "primary" : "ghost"}
              className="justify-start"
              onClick={() => {
                onRangeChange(preset.range, preset.id);
                setIsOpen(false);
                setPendingRange(undefined);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <DayPicker
          mode="range"
          numberOfMonths={1}
          defaultMonth={defaultCalendarMonth ?? isoDateToLocalDate(value.endDate)}
          selected={
            pendingRange ?? {
              from: isoDateToLocalDate(value.startDate),
              to: isoDateToLocalDate(value.endDate),
            }
          }
          onSelect={handleCalendarSelect}
          className={classNames("pulseboard-day-picker", "text-sm")}
        />
      </PopoverContent>
    </Popover>
  );
}

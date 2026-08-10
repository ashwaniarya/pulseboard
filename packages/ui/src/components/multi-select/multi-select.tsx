import { useState, type KeyboardEvent } from "react";

import { classNames } from "../../lib/class-names";
import { Button } from "../button/button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label: string;
  options: readonly MultiSelectOption[];
  selectedValues: readonly string[];
  onSelectionChange: (selectedValues: string[]) => void;
  emptySelectionSummary?: string;
  className?: string;
}

function moveFocusWithinListbox(event: KeyboardEvent<HTMLElement>): void {
  const keysThatMoveFocus = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keysThatMoveFocus.includes(event.key)) {
    return;
  }
  const listboxElement = event.currentTarget.closest('[role="listbox"]');
  if (listboxElement === null) {
    return;
  }
  event.preventDefault();
  const optionElements = Array.from(
    listboxElement.querySelectorAll<HTMLElement>('[role="option"]'),
  );
  if (optionElements.length === 0) {
    return;
  }
  const currentIndex = optionElements.findIndex((option) => option === event.currentTarget);
  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") {
    nextIndex = Math.min(optionElements.length - 1, currentIndex + 1);
  } else if (event.key === "ArrowUp") {
    nextIndex = Math.max(0, currentIndex - 1);
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else {
    nextIndex = optionElements.length - 1;
  }
  optionElements[nextIndex]?.focus();
}

export function MultiSelect({
  label,
  options,
  selectedValues,
  onSelectionChange,
  emptySelectionSummary = "All",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedSet = new Set(selectedValues);

  const toggleValue = (value: string) => {
    const nextValues = selectedSet.has(value)
      ? selectedValues.filter((existing) => existing !== value)
      : [...selectedValues, value];
    onSelectionChange([...nextValues]);
  };

  const summary =
    selectedValues.length === 0
      ? emptySelectionSummary
      : `${String(selectedValues.length)} of ${String(options.length)} selected`;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" className={className} aria-label={`${label}: ${summary}`}>
          <span className="text-text-muted">{label}</span>
          <span>{summary}</span>
          <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 text-text-muted" fill="none">
            <path
              d="m4 6 4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent label={label} className="w-64 p-2">
        <div className="flex items-center justify-between gap-2 border-b border-outline px-2 pb-2">
          <Button
            size="small"
            variant="ghost"
            onClick={() => {
              onSelectionChange(options.map((option) => option.value));
            }}
          >
            Select all
          </Button>
          <Button
            size="small"
            variant="ghost"
            onClick={() => {
              onSelectionChange([]);
            }}
          >
            Clear
          </Button>
        </div>
        <ul
          role="listbox"
          aria-label={label}
          aria-multiselectable
          className="mt-1 max-h-64 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = selectedSet.has(option.value);
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => {
                  toggleValue(option.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    toggleValue(option.value);
                    return;
                  }
                  moveFocusWithinListbox(event);
                }}
                className={classNames(
                  "flex cursor-pointer items-center gap-2.5 rounded-medium px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-surface-sunken",
                  isSelected ? "text-text-primary" : "text-text-muted",
                )}
              >
                <span
                  aria-hidden
                  className={classNames(
                    "grid size-4 shrink-0 place-items-center rounded-small border",
                    isSelected
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-outline-strong bg-surface-raised",
                  )}
                >
                  {isSelected && (
                    <svg viewBox="0 0 12 12" className="size-3" fill="none">
                      <path
                        d="m2.5 6.5 2.5 2.5 4.5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {option.label}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

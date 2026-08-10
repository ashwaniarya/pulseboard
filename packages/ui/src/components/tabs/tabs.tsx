import {
  createContext,
  useContext,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { classNames } from "../../lib/class-names";

interface TabsContextValue {
  activeValue: string;
  selectValue: (value: string) => void;
  idPrefix: string;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (context === null) {
    throw new Error(`${componentName} must be rendered inside <Tabs>`);
  }
  return context;
}

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const idPrefix = useId();
  const activeValue = value ?? internalValue;
  const selectValue = (nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };
  return (
    <TabsContext.Provider value={{ activeValue, selectValue, idPrefix }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function TabList({ label, children, className }: TabListProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={classNames("flex items-center gap-1 border-b border-outline", className)}
    >
      {children}
    </div>
  );
}

function moveFocusWithinTabList(event: KeyboardEvent<HTMLButtonElement>): void {
  const keysThatMoveFocus = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keysThatMoveFocus.includes(event.key)) {
    return;
  }
  const tabListElement = event.currentTarget.closest('[role="tablist"]');
  if (tabListElement === null) {
    return;
  }
  event.preventDefault();
  const tabElements = Array.from(
    tabListElement.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  );
  const currentIndex = tabElements.findIndex((tab) => tab === event.currentTarget);
  if (tabElements.length === 0) {
    return;
  }
  let nextIndex = currentIndex;
  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabElements.length;
  } else if (event.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabElements.length) % tabElements.length;
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else {
    nextIndex = tabElements.length - 1;
  }
  tabElements[nextIndex]?.focus();
  tabElements[nextIndex]?.click();
}

export interface TabProps {
  value: string;
  children: ReactNode;
}

export function Tab({ value, children }: TabProps) {
  const { activeValue, selectValue, idPrefix } = useTabsContext("Tab");
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${idPrefix}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${idPrefix}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      onClick={() => {
        selectValue(value);
      }}
      onKeyDown={moveFocusWithinTabList}
      className={classNames(
        "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150",
        isActive
          ? "border-accent text-text-primary"
          : "border-transparent text-text-muted hover:border-outline-strong hover:text-text-primary",
      )}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { activeValue, idPrefix } = useTabsContext("TabPanel");
  const isActive = activeValue === value;
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={classNames("pt-3 focus-visible:outline-none", className)}
    >
      {children}
    </div>
  );
}

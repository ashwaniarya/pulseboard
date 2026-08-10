import { useCallback, useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY, type ThemeName } from "./theme-script";

function subscribeToThemeChanges(onThemeChange: () => void): () => void {
  const observer = new MutationObserver(onThemeChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => {
    observer.disconnect();
  };
}

function readCurrentTheme(): ThemeName {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export interface UseThemeResult {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeResult {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    readCurrentTheme,
    (): ThemeName => "light",
  );

  const setTheme = useCallback((nextTheme: ThemeName) => {
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // storage can be unavailable in private browsing; the in-page theme still applies
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readCurrentTheme() === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}

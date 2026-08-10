export const THEME_STORAGE_KEY = "pulseboard.theme";

export type ThemeName = "light" | "dark";

export function resolveInitialTheme(storedValue: string | null, prefersDark: boolean): ThemeName {
  if (storedValue === "light" || storedValue === "dark") {
    return storedValue;
  }
  return prefersDark ? "dark" : "light";
}

export const THEME_BOOTSTRAP_SCRIPT = [
  "(function () {",
  "  try {",
  `    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");`,
  '    var theme = stored === "light" || stored === "dark"',
  "      ? stored",
  '      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");',
  '    document.documentElement.setAttribute("data-theme", theme);',
  "  } catch (error) {",
  '    document.documentElement.setAttribute("data-theme", "light");',
  "  }",
  "})();",
].join("\n");

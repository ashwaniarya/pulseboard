import { IconButton } from "../components/icon-button/icon-button";
import { useTheme } from "./use-theme";

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <IconButton
      label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      onClick={toggleTheme}
      className={className}
    >
      {isDark ? (
        <svg aria-hidden viewBox="0 0 20 20" width="18" height="18" fill="none">
          <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 1.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6-1.4 1.4M4.9 15.1l-1.4 1.4m13 0-1.4-1.4M4.9 4.9 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg aria-hidden viewBox="0 0 20 20" width="18" height="18" fill="none">
          <path
            d="M17 11.5A7.5 7.5 0 0 1 8.5 3 7.5 7.5 0 1 0 17 11.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </IconButton>
  );
}

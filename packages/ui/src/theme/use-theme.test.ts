import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { THEME_STORAGE_KEY } from "./theme-script";
import { useTheme } from "./use-theme";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  window.localStorage.removeItem(THEME_STORAGE_KEY);
});

describe("useTheme", () => {
  it("reads the current document theme", () => {
    document.documentElement.dataset.theme = "dark";
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("stamps the document and persists when setting a theme", () => {
    const { result } = renderHook(() => useTheme());
    act(() => {
      result.current.setTheme("dark");
    });
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("toggles between light and dark", async () => {
    document.documentElement.dataset.theme = "light";
    const { result } = renderHook(() => useTheme());
    await act(() => {
      result.current.toggleTheme();
      return Promise.resolve();
    });
    expect(result.current.theme).toBe("dark");
    await act(() => {
      result.current.toggleTheme();
      return Promise.resolve();
    });
    expect(result.current.theme).toBe("light");
  });
});

import "@testing-library/jest-dom/vitest";
import { configureDataset } from "@pulseboard/mock-api/data";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import { mockApiServer } from "./src/test/mockApiServer";

beforeAll(() => {
  configureDataset({ endDate: "2026-08-10", dayCount: 90 });
  mockApiServer.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  mockApiServer.resetHandlers();
  vi.restoreAllMocks();
});

afterAll(() => {
  mockApiServer.close();
});

// Node >=22 defines a global localStorage accessor that resolves to undefined unless
// --localstorage-file is passed, and it shadows jsdom's storage inside Vitest.
function createMemoryStorage(): Storage {
  let store = new Map<string, string>();
  const memoryStorage = {
    get length() {
      return store.size;
    },
    clear: () => {
      store = new Map();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  };
  return memoryStorage;
}

if (typeof window !== "undefined" && window.localStorage === undefined) {
  Object.defineProperty(window, "localStorage", {
    value: createMemoryStorage(),
    configurable: true,
  });
  Object.defineProperty(window, "sessionStorage", {
    value: createMemoryStorage(),
    configurable: true,
  });
}

const resizeObserverNoop = (): void => {
  return undefined;
};

class ResizeObserverStub {
  observe = resizeObserverNoop;
  unobserve = resizeObserverNoop;
  disconnect = resizeObserverNoop;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub;
}

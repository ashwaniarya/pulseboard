import "@testing-library/jest-dom/vitest";

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

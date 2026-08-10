import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "dashboard",
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

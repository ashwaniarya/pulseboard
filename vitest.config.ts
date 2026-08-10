import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      "packages/mock-api",
      "packages/ui",
      "apps/dashboard",
      "packages/ui/vitest.storybook.config.ts",
    ],
    passWithNoTests: true,
  },
});

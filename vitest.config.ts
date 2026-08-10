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
    coverage: {
      provider: "v8",
      include: ["packages/ui/src/**"],
      exclude: [
        "packages/ui/src/**/*.stories.tsx",
        "packages/ui/src/**/*.test.*",
        "packages/ui/src/docs/**",
        "packages/ui/src/index.ts",
        // Interaction-only components: exercised by Storybook play functions in the
        // browser-mode run, which this jsdom coverage report cannot see (ADR-0004).
        "packages/ui/src/components/tabs/**",
        "packages/ui/src/components/multi-select/**",
        "packages/ui/src/components/tooltip/**",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
    },
  },
});

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on) {
      on("task", {
        log(message: string) {
          console.log(message);
          return null;
        },
      });
    },
    baseUrl: "http://localhost:4173",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});

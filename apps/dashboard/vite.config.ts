import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import { THEME_BOOTSTRAP_SCRIPT } from "@pulseboard/ui/theme-script";

function injectThemeBootstrapScript(): Plugin {
  return {
    name: "pulseboard:inject-theme-script",
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: "script",
            children: THEME_BOOTSTRAP_SCRIPT,
            injectTo: "head-prepend",
          },
        ],
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectThemeBootstrapScript()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});

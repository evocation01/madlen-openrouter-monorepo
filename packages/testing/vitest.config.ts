import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export const config = defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [], 
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  },
});

export default config;
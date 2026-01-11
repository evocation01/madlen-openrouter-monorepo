import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export const config = defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [], // Add global setup files here if needed
  },
});

export default config;

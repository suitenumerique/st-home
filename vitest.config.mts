import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // Vite 8+ resolves tsconfig `paths` (e.g. "@/*") natively — replaces vite-tsconfig-paths.
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: ["node_modules", "tests-playwright/*"],
    alias: {
      'next/router': 'next-router-mock',
    },
  },
});

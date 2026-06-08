import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// jsdom + RTL + jest-axe for component a11y tests. No CSS is loaded — axe's structural/ARIA
// rules don't need it (visual rules like color-contrast return "incomplete" under jsdom and
// are filtered in the test helper).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

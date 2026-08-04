import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Only measure src/ — scripts and dist are not game logic
      include: ["src/**"],
      exclude: ["src/app/components/**", "src/**/index.ts", "src/**/*.css"],
      thresholds: {
        // Thresholds target engine + app logic; raise as component tests are added (WC-013)
        lines: 60,
        branches: 60,
        functions: 65,
      },
      reporter: ["text", "text-summary"],
    },
  },
});

import { defineConfig } from "vitest/config";

// Unit tests for the website. Logic/content tests run in the fast `node`
// environment; no jsdom needed for the data layer. Add a per-file
// `// @vitest-environment jsdom` header (and the jsdom + Testing Library
// packages) when you start testing rendered React components.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "chess_app/**"],
  },
});

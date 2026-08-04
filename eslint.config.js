import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // vite.config.ts and scripts legitimately use Node globals
    files: ["scripts/**/*.mjs", "vite.config.ts"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];

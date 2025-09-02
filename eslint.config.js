import parserTs from "@typescript-eslint/parser";
import eslintPluginTs from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.{ts,js}"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      parser: parserTs,
    },
    plugins: {
      "@typescript-eslint": eslintPluginTs,
    },
    rules: {},
  },
];

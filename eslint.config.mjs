import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import react from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  // { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    plugins: {
      react,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
    },
  },
  {
    ignores: [
      ".eslintrc.json",
      ".husky/*",
      ".next/*",
      "build/*",
      "CODE_OF_CONDUCT.md",
      "CONTRIBUTING.md",
      "csml/*",
      "eslint.config.js",
      "next.config.mjs",
      "package.json",
      "package-lock.json",
      "prisma/*",
      "public/*",
      "README.md"
    ]
  }
]);
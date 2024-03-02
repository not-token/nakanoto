const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/recommended",
    require.resolve("@vercel/style-guide/eslint/node"),
  ],
  env: { es2020: true },
  plugins: ["only-warn"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist",
    ".eslintrc.cjs",
    "index.html",
  ],
  rules: {
    "no-console": ["error"],
  },
  overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
};

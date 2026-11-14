// @ts-check
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.venv/**",
      "**/__pycache__/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];

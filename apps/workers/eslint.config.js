export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.ts"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];

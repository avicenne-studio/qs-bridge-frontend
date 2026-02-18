/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Allowed types (Conventional Commits)
    // feat, fix, docs, style, refactor, perf, test, build, ci, chore.
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting, spaces, etc. (no code change)
        "refactor", // Refactoring
        "perf", // Performance improvement
        "test", // Add or modify tests
        "build", // Build, dependencies, etc.
        "ci", // CI/CD
        "chore", // Miscellaneous tasks
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 200],
  },
};

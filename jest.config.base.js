module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.test.{ts.tsx}"
  ],
  coverageDirectory: "<rootDir>/reports",
  coverageThreshold: {
    "global": {
      "branches": 80,
      "lines": 80,
      "statements": -10
    }
  },
  injectGlobals: true,
  verbose: true,
  // block files from being imported...probably not other tests??
  testEnvironment: "node",
  testMatch: ["**/__tests__/*.test.ts"],
}

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/*.test.{ts.tsx}"
  ],
  coverageDirectory: "<rootDir>/reports",
  injectGlobals: true,
  verbose: true,
  // block files from being imported...probably not other tests??
  testEnvironment: "node",
  testMatch: ["**/__tests__/*.test.ts"],
}

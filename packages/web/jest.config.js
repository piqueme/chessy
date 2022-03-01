const base = require('../../jest.config.base')
const package = require('./package.json')

module.exports = {
  ...base,
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    "\\.css$": 'identity-obj-proxy',
    "\\.svg$": '<rootDir>/src/__mocks__/fileMock.ts'
  },
  coveragePathIgnorePatterns: [
    "<rootDir>/src/config.ts"
  ],
  snapshotSerializers: [
    '@emotion/jest/serializer'
  ],
  setupFilesAfterEnv: [
    './jest-setup.js'
  ],
  name: package.name,
  displayName: package.name
}

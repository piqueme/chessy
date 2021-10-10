const base = require('../../jest.config.base')
const package = require('./package.json')

module.exports = {
  ...base,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    "\\.css$": 'identity-obj-proxy',
    "\\.svg$": '<rootDir>/src/__mocks__/fileMock.ts'
  },
  name: package.name,
  displayName: package.name
}

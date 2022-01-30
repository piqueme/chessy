const base = require('../../jest.config.base')
const package = require('./package.json')

module.exports = {
  ...base,
  name: package.name,
  displayName: package.name,
  setupFiles: ['<rootDir>/src/__tests__/testSetup.ts']
}

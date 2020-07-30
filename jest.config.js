module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.test.js',
    '!**/*.config.js'
  ],
  coverageDirectory: 'test-output',
  coverageReporters: [
    'text-summary',
    'cobertura',
    'lcov'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test-output/',
    '<rootDir>/test/',
    '.*/__mocks__/.*'
  ],
  modulePathIgnorePatterns: [
    'node_modules'
  ],
  testPathIgnorePatterns: [
    'test/integration/local',
    'test/contract/payment.test.js'
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: 'test-output',
        outputName: 'junit.xml'
      }
    ]
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'node'
}

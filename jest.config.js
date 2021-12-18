module.exports = {
  automock: false,
  coveragePathIgnorePatterns: ['<rootDir>/src/client/assets/', '<rootDir>/jest/'],
  modulePathIgnorePatterns: ['<rootDir>/.history/', '<rootDir>/dist/', '<rootDir>/jest/'],
  setupFilesAfterEnv: ['<rootDir>/jest/jest.setup.js'],
  snapshotResolver: '<rootDir>/jest/snapshotResolver.js',
  testEnvironment: 'jsdom',
  transform: {
    '.+\\.(png|jpg|jpeg|gif)$': '<rootDir>/jest/jest-transform-stub-named.js',
    '^.+\\.js$': 'babel-jest',
  },
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
};

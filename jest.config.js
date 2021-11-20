module.exports = {
  automock: false,
  modulePathIgnorePatterns: ['<rootDir>/.history/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  snapshotResolver: '<rootDir>/snapshotResolver.js',
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
};

module.exports = {
  automock: false,
  coveragePathIgnorePatterns: [
    '<rootDir>/src/client/assets/',
    '<rootDir>/src/client/js/utils/index.js',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.history/', '<rootDir>/dist/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  snapshotResolver: '<rootDir>/snapshotResolver.js',
  watchPathIgnorePatterns: ['<rootDir>/node_modules'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.+\\.(png|jpg|jpeg|gif)$': 'jest-transform-stub',
  },
};

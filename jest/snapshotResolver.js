module.exports = {
  testPathForConsistencyCheck: 'some/example.spec.js',
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath.replace(/\.spec\.([tj]sx?)/, `.spec.$1${snapshotExtension}`),
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath.replace(snapshotExtension, ''),
};

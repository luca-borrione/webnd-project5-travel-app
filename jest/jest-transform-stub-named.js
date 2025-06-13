const path = require('path');

module.exports = {
  process: (a, filename, config) => {
    // Get rootDir from config, with fallback to process.cwd()
    const rootDir = config.rootDir || config.cwd || process.cwd();
    const relativePath = path.relative(rootDir, filename);

    // Return a valid module export for the image path
    return {
      code: `module.exports = "${relativePath}";`,
    };
  },
};

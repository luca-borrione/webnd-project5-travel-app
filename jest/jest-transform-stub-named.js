const path = require('path');

module.exports = {
  process: (_, filename, config) => {
    const relativePath = path.relative(config.rootDir, filename);
    return `module.exports = "${relativePath}";`;
  },
};

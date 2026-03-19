const { execSync } = require('child_process');
const path = require('path');

// Change to dashboard directory and run next dev
process.chdir(path.resolve(__dirname));
require('./node_modules/next/dist/bin/next');

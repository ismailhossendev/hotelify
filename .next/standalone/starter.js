// starter.js - Workaround for CloudLinux
// This script modifies NODE_PATH to use 'deps' folder instead of 'node_modules'
// This bypasses CloudLinux's symlink replacement

process.env.NODE_PATH = __dirname + '/deps';
require('module')._initPaths();

// Start the Next.js server
require('./server.js');

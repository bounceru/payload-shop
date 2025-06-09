// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Fix for SDK 53 + Metro breaking changes
config.resolver.unstable_enablePackageExports = false

module.exports = config

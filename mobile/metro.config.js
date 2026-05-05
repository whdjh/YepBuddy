const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = path.dirname(require.resolve("./package.json"));
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [projectRoot];
config.resolver.blockList = [
  new RegExp(`${monorepoRoot}/node_modules/.*`),
];

module.exports = withNativeWind(config, { input: "./src/global.css" });

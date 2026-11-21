const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-three-fiber et three exposent un build ESM (`module`) et un build CJS
// (`main`). Metro privilégie `main` par défaut, ce qui charge three.cjs et
// appelle process.emitWarning, absent de Hermes. On préfère donc ESM.
config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];

module.exports = config;

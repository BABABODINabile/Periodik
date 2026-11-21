// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/**'],
  },
  {
    files: ['src/lib/vendor/**'],
    rules: { 'no-unused-vars': 'off' },
  },
  {
    files: ['src/components/AtomViewer.tsx'],
    rules: {
      // Les props Three.js (position, intensity, geometry...) sont des éléments JSX
      // natifs de react-three-fiber, pas des props DOM.
      'react/no-unknown-property': 'off',
    },
  },
]);

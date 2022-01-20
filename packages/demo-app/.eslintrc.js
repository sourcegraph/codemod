const baseConfig = require('../../.eslintrc')

module.exports = {
  root: true,
  extends: ['../../.eslintrc', 'plugin:@sourcegraph/eslint-plugin-sourcegraph/all'],
  plugins: ['@sourcegraph/eslint-plugin-sourcegraph'],
  parserOptions: {
    ...baseConfig.parserOptions,
    project: [__dirname + '/tsconfig.json'],
  },
}

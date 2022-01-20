const path = require('path')

module.exports = {
  extends: ['@sourcegraph/eslint-config'],
  "parserOptions": {
    "project": path.resolve(__dirname, "./tsconfig.test.json"),
  },
}

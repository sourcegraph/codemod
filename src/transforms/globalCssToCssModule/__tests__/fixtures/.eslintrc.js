const path = require('path')

module.exports = {
  "extends": "../../../../../.eslintrc.json",
  "parserOptions": {
    "project": path.resolve(__dirname, "./tsconfig.test.json"),
  },
}

module.exports = {
  extends: ['@sourcegraph/eslint-config'],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
    project: ['./tsconfig.eslint.json', './tsconfig.json', './packages/*/tsconfig.json'],
    allowAutomaticSingleRunInference: true,
    tsconfigRootDir: __dirname,
    warnOnUnsupportedTypeScriptVersion: false,
  },
  settings: {
    react: {
      version: '*',
    },
  },
  rules: {
    'no-sync': 'off',
    'arrow-body-style': ['error', 'always'],
  },
}

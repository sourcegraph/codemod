import type { InitialOptionsTsJest } from 'ts-jest'

import baseConfig from '../../jest.config.base'

const config: InitialOptionsTsJest = {
    ...baseConfig,
    displayName: 'codemod-app',
    rootDir: __dirname,
}

// eslint-disable-next-line import/no-default-export
export default config

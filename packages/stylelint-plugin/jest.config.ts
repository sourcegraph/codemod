/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
import type { InitialOptionsTsJest } from 'ts-jest'

import baseConfig from '../../jest.config.base'

const stylelintPreset = require('jest-preset-stylelint/jest-preset')
const tsPreset = require('ts-jest/jest-preset')

const config: InitialOptionsTsJest = {
    ...baseConfig,
    ...tsPreset,
    ...stylelintPreset,
    displayName: 'stylelint-plugin',
    rootDir: __dirname,
    setupFiles: ['./jest.setup.ts'],
}

// eslint-disable-next-line import/no-default-export
export default config

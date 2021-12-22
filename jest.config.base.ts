import type { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            isolatedModules: true,
        },
    },
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    modulePaths: ['node_modules', '<rootDir>/src'],
    modulePathIgnorePatterns: ['fixtures', 'dist'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

// eslint-disable-next-line import/no-default-export
export default config

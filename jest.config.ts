import type { InitialOptionsTsJest } from 'ts-jest'

const config: InitialOptionsTsJest = {
    projects: ['./packages/*/jest.config.ts'],
}

// eslint-disable-next-line import/no-default-export
export default config

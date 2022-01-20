/* eslint-disable unicorn/prevent-abbreviations */
import * as path from 'path'

import { ESLintUtils } from '@typescript-eslint/experimental-utils'

const { batchedSingleLineTests, RuleTester, noFormat } = ESLintUtils

export { batchedSingleLineTests, noFormat, RuleTester }

export function getFixturesRootDir(): string {
    return path.join(__dirname, 'fixtures')
}

// TODO: figure out how to make this helper redundant.
export function addReactFilename<T>(testCases: T[]): T[] {
    return testCases.map(testCase => {
        return {
            ...testCase,
            filename: 'react.tsx',
        }
    })
}

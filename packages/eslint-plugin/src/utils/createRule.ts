/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
import { ESLintUtils } from '@typescript-eslint/experimental-utils'

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const version: string = require('../../package.json').version

// Required to please Typescript
type CreateRule = ReturnType<typeof ESLintUtils.RuleCreator>

export const createRule: CreateRule = ESLintUtils.RuleCreator(name => {
    return `https://github.com/sourcegraph/codemod/blob/v${version}/packages/eslint-plugin/src/rules/${name}/${name}.md`
})

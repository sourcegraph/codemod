import { ESLintUtils } from '@typescript-eslint/experimental-utils'

export * from './createRule'
export * from './types'
export * from './getWrappedNode'

// this is done for convenience - saves migrating all of the old rules
const { applyDefault, deepMerge, isObjectNotArray, getParserServices } = ESLintUtils
type InferMessageIdsTypeFromRule<T> = ESLintUtils.InferMessageIdsTypeFromRule<T>
type InferOptionsTypeFromRule<T> = ESLintUtils.InferOptionsTypeFromRule<T>

export {
    applyDefault,
    deepMerge,
    isObjectNotArray,
    getParserServices,
    InferMessageIdsTypeFromRule,
    InferOptionsTypeFromRule,
}

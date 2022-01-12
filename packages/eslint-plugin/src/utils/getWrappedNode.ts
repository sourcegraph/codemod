import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils'
import { TSESTree } from '@typescript-eslint/types'
import { CompilerNodeToWrappedType, createWrappedNode, ts } from 'ts-morph'

export function getWrappedNode<T extends ts.Node>(
    context: TSESLint.RuleContext<string, unknown[]>,
    node: TSESTree.Node
): CompilerNodeToWrappedType<T> {
    const parserServices = ESLintUtils.getParserServices(context)
    const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node)

    return createWrappedNode<T>(originalNode as T, {
        sourceFile: originalNode.getSourceFile(),
    })
}

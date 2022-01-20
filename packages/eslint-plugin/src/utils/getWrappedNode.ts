import { ESLintUtils, TSESLint } from '@typescript-eslint/experimental-utils'
import { TSESTree } from '@typescript-eslint/types'
import { CompilerNodeToWrappedType, Constructor, createWrappedNode, ts } from 'ts-morph'

export function getSourceFileFromContext(context: TSESLint.RuleContext<string, unknown[]>): ts.SourceFile {
    const { program } = ESLintUtils.getParserServices(context)

    const currentFilePath =
        program.getRootFileNames().find(filePath => {
            return filePath.includes(context.getFilename())
        }) || context.getFilename()

    const sourceFile = program.getSourceFile(currentFilePath)

    if (!sourceFile) {
        throw new Error('Source file not found!')
    }

    return sourceFile
}

type NodeWrapper = <T extends ts.Node>(
    node: TSESTree.Node,
    ctor: unknown // Constructor<CompilerNodeToWrappedType<T>>
) => CompilerNodeToWrappedType<T>

/**
 * Light-weight version of the `getNodeFromCompilerNode` from  `packages/ts-morph/src/factories/CompilerFactory.ts`
 * It wraps only provided node into a wrapper class and doesn't initialize all node parents like `createWrappedNode`.
 */
export function getNodeWrapper(context: TSESLint.RuleContext<string, unknown[]>): NodeWrapper {
    const sourceFile = getSourceFileFromContext(context)
    const wrappedSourceFile = createWrappedNode<ts.SourceFile>(sourceFile)

    const { esTreeNodeToTSNodeMap } = ESLintUtils.getParserServices(context)

    return function wrapNode<T extends ts.Node>(node: TSESTree.Node, ctor: unknown): CompilerNodeToWrappedType<T> {
        const originalNode = esTreeNodeToTSNodeMap.get(node)

        return new (ctor as Constructor<CompilerNodeToWrappedType<T>>)(
            (wrappedSourceFile as any)._context,
            originalNode,
            wrappedSourceFile
        )
    }
}

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

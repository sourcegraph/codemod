import { createRule } from '../../utils'

export const messages = {
    noUnexplainedConsoleError:
        'Directly logging through `console.error()` is discouraged. If required, please add a comment explaining why so, otherwise consider passing the error through `Sentry.captureException()` instead.',
}

export const noUnexplainedConsoleError = createRule<[], keyof typeof messages>({
    name: 'no-unexplained-console-error',
    meta: {
        docs: {
            description:
                "Bans usage of the console.error() calls, unless supported by a comment explain why it's required.",
            recommended: 'error',
        },
        messages,
        schema: [],
        type: 'problem',
    },
    defaultOptions: [],
    create(context) {
        const sourceCode = context.getSourceCode()

        return {
            CallExpression(node) {
                const { callee } = node
                if (
                    callee.type === 'MemberExpression' &&
                    callee.object.type === 'Identifier' &&
                    callee.object.name === 'console' &&
                    callee.property.type === 'Identifier' &&
                    callee.property.name === 'error'
                ) {
                    const comments = sourceCode.getCommentsBefore(node)
                    if (comments.length === 0) {
                        context.report({
                            node,
                            messageId: 'noUnexplainedConsoleError',
                        })
                    }
                }
            },
        }
    },
})

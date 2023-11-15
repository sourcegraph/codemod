import { createRule } from '../../utils'

export const messages = {
    noEmptyCatchBlocks:
        'Catch blocks should not be empty. Either process the error, or comment why the exception can be ignored',
}

export const noEmptyCatchBlocks = createRule<[], keyof typeof messages>({
    name: 'no-empty-catch-blocks',
    meta: {
        docs: {
            description:
                'Bans usage of the empty catch blocks, unless supported by a comment explaining why the exception can be ignored.',
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
            CatchClause(node) {
                // Get all comments inside the catch block, and right before it
                const comments = [...sourceCode.getCommentsBefore(node), ...sourceCode.getCommentsInside(node)]
                // If the catch body is empty and there are no comments, report error
                if (node.body.body.length === 0 && comments.length === 0) {
                    context.report({
                        node,
                        messageId: 'noEmptyCatchBlocks',
                    })
                }
            },
        }
    },
})

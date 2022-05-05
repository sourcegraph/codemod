import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils'
import { Literal } from '@typescript-eslint/types/dist/ast-spec'

import { createRule } from '../../utils'

export const messages = {
    invalidHelpLink: 'Help link to non-existent page: {{ destination }}',
}

export interface Option {
    docsiteList: {
        type: string
    }[]
}

export const checkHelpLinks = createRule<Option[], keyof typeof messages>({
    name: 'check-help-links',
    meta: {
        docs: {
            description: 'Check that /help links point to real, non-redirected pages',
            recommended: false,
        },
        messages,
        schema: [
            {
                type: 'object',
                properties: {
                    docsiteList: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        type: 'problem',
    },
    defaultOptions: [],
    create(context) {
        // Build the set of valid pages. In order, we'll try to get this from:
        //
        // 1. The DOCSITE_LIST environment variable, which should be a newline
        //    separated list of pages, as outputted by `docsite ls`.
        // 2. The docsiteList rule option, which should be an array of pages.
        //
        // If neither of these are set, this rule will silently pass, so as not to
        // require docsite to be run when a user wants to run eslint in general.
        const pages = new Set()
        if (process.env.DOCSITE_LIST) {
            process.env.DOCSITE_LIST.split('\n').forEach(page => {
                return pages.add(page)
            })
        } else if (context.options.length > 0) {
            context.options[0].docsiteList.forEach(page => {
                return pages.add(page)
            })
        }

        // No pages were provided, so we'll return an empty object and do nothing.
        if (pages.size === 0) {
            return {}
        }

        // Return the object that will install the listeners we want. In this case,
        // we only need to look at JSX opening elements.
        //
        // Note that we could use AST selectors below, but the structure of the AST
        // makes that tricky: the identifer (Link or a) and attribute (to or href)
        // we use to identify an element of interest are siblings, so we'd probably
        // have to select on the identifier and have some ugly traversal code below
        // to check the attribute. It feels cleaner to do it this way with the
        // opening element as the context.
        return {
            JSXOpeningElement: node => {
                // Figure out what kind of element we have and therefore what attribute
                // we'd want to look for.
                let attributeName: string

                if (node.name.type === AST_NODE_TYPES.JSXIdentifier) {
                    if (node.name.name === 'Link') {
                        attributeName = 'to'
                    } else if (node.name.name === 'a') {
                        attributeName = 'href'
                    }
                } else {
                    // Anything that's not a link is uninteresting.
                    return
                }

                // Go find the link target in the attribute array.
                const target = node.attributes.reduce<Literal['value']>((target, attribute) => {
                    return (
                        target ||
                        (attribute.type === AST_NODE_TYPES.JSXAttribute &&
                        attribute.name &&
                        attribute.name.name === attributeName &&
                        attribute.value?.type === AST_NODE_TYPES.Literal
                            ? attribute.value.value
                            : null)
                    )
                }, null)

                // Make sure the target points to a help link; if not, we don't need to
                // go any further.
                if (typeof target !== 'string' || !target.startsWith('/help/')) {
                    return
                }

                // Strip off the /help/ prefix, any anchor, and any trailing slash, then
                // look up the resultant page in the pages set, bearing in mind that it
                // might point to a directory and we also need to look for any index
                // page that might exist.
                const destination = target.slice(6).split('#')[0].replace(/\/+$/, '')

                if (!pages.has(destination + '.md') && !pages.has(destination + '/index.md')) {
                    context.report({
                        node,
                        messageId: 'invalidHelpLink',
                        data: { destination },
                    })
                }
            },
        }
    },
})

import { TSESTree } from '@typescript-eslint/experimental-utils'
import { ts, StringLiteral, JsxOpeningElement } from 'ts-morph'

import { ButtonElementToComponent } from '@sourcegraph/codemod-transforms'

import { createRule, getNodeWrapper } from '../../utils'

export const messages = {
    bannedClassnameMessage: 'Use the Wildcard component `<Button />` instead of the `{{name}}` class.',
    bannedJsxElementMessage: 'Use the Wildcard component `<Button />` instead of the `{{name}}` element.',
}

export const useButtonComponent = createRule<[], keyof typeof messages>({
    name: 'use-button-component',
    meta: {
        docs: {
            description: 'Bans usage of the `button` element and button Bootstrap classes',
            recommended: 'error',
        },
        messages,
        schema: [],
        type: 'problem',
    },
    defaultOptions: [],
    create(context) {
        const getWrappedNode = getNodeWrapper(context)

        return {
            JSXOpeningElement: node => {
                const jsxOpeningElement = getWrappedNode<ts.JsxOpeningElement>(node, JsxOpeningElement)
                const validationResult = ButtonElementToComponent.validateCodemodTarget.JsxTagElement(jsxOpeningElement)

                if (validationResult) {
                    context.report({
                        node,
                        messageId: 'bannedJsxElementMessage',
                        data: {
                            name: validationResult.tagName,
                        },
                    })
                }
            },
            'JsxAttribute Literal': (node: TSESTree.Literal) => {
                if (typeof node.value !== 'string') {
                    return
                }

                const stringLiteralNode = getWrappedNode<ts.StringLiteral>(node, StringLiteral)
                const validationResult = ButtonElementToComponent.validateCodemodTarget.StringLiteral(stringLiteralNode)

                if (validationResult) {
                    context.report({
                        node,
                        messageId: 'bannedClassnameMessage',
                        data: {
                            name: validationResult.classNameMappings
                                .map(({ className }) => {
                                    return className
                                })
                                .join(', '),
                        },
                    })
                }
            },
        }
    },
})

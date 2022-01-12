import { ts } from 'ts-morph'

import { ButtonElementToComponent } from '@sourcegraph/codemod-transforms'

import { createRule, getWrappedNode } from '../../utils'

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
        return {
            JSXOpeningElement: node => {
                const jsxOpeningElement = getWrappedNode<ts.JsxOpeningElement>(context, node)

                if (ButtonElementToComponent.validateCodemodTarget.JsxTagElement(jsxOpeningElement)) {
                    context.report({
                        node,
                        messageId: 'bannedJsxElementMessage',
                        data: {
                            name: jsxOpeningElement.getTagNameNode().getText(),
                        },
                    })
                }
            },
            Literal: node => {
                const stringLiteralNode = getWrappedNode<ts.StringLiteral>(context, node)
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

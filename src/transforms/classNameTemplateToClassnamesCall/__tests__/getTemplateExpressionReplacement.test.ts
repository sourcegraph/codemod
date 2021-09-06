/* eslint-disable no-template-curly-in-string */
import { printNode, SyntaxKind } from 'ts-morph'
import { createSourceFile } from 'utils/tests'

import { getTemplateExpressionReplacement } from '../getTemplateExpressionReplacement'

describe('getTemplateExpressionReplacement', () => {
    function getReplacementString(sourceCode: string): string {
        const sourceFile = createSourceFile(sourceCode)
        const [templateExpression] = sourceFile.getDescendantsOfKind(SyntaxKind.TemplateExpression)

        return printNode(getTemplateExpressionReplacement(templateExpression))
    }

    it('handles binary expression', () => {
        const replacementString = getReplacementString("<div className={`my-class ${props.className || ''}`}>")

        expect(replacementString).toBe('classNames("my-class", props.className)')
    })

    describe('handles conditional expression', () => {
        it('with nested binary plus operator expression', () => {
            const replacementString = getReplacementString(
                "<div className={ `my-class${className ? ' ' + className : ''}`}>"
            )

            expect(replacementString).toBe('classNames("my-class", className)')
        })

        it('with empty when-false output', () => {
            const replacementString = getReplacementString(
                "<div className={`my-class ${isActive ? props.className :  ''}`}>"
            )

            expect(replacementString).toBe('classNames("my-class", isActive && props.className)')
        })

        it('with equal condition and when-true output ', () => {
            const replacementString = getReplacementString(
                "<div className={`my-class ${props.className ? props.className :  ''}`}>"
            )

            expect(replacementString).toBe('classNames("my-class", props.className)')
        })
    })
})

import { TemplateExpression, ts } from 'ts-morph'

import { wrapIntoClassNamesUtility } from '../../utils/classNamesUtility'

export function getTemplateExpressionReplacement(templateExpression: TemplateExpression): ts.CallExpression {
    const head = templateExpression.getHead().compilerNode.rawText?.trim() || ''
    const [secondSpan, ...templateSpans] = templateExpression.getTemplateSpans()
    const firstArguments: ts.Expression[] = []

    // Avoid extracting `variant` from the template literal in case of preceding `-`: `my-class-${variant}`
    if (head.endsWith('-')) {
        const preservedTemplateLiteral = ts.factory.createTemplateExpression(
            templateExpression.getHead().compilerNode,
            [ts.factory.createTemplateSpan(secondSpan.compilerNode.expression, ts.factory.createTemplateTail(''))]
        )

        firstArguments.push(preservedTemplateLiteral)
    } else {
        templateSpans.unshift(secondSpan)
    }

    const classNamesCallArguments = templateSpans.flatMap(span => {
        const tail = span.getLiteral().compilerNode.rawText?.trim() || ''
        const expression = span.getExpression().compilerNode

        /**
         * Handle binary expression:
         *
         * `my-class ${props.className || ''}`
         * classNames('my-class', props.className)
         */
        if (ts.isBinaryExpression(expression) && expression.right.getText() === "''") {
            return [expression.left, tail]
        }

        if (ts.isConditionalExpression(expression) && expression.whenFalse.getText() === "''") {
            const whenTrueExpression = expression.whenTrue

            /**
             * Handle binary expression with plus operator:
             *
             * `mdi-icon${className ? ' ' + className : ''}`
             * classNames('mdi-icon', className)
             */
            if (
                ts.isBinaryExpression(whenTrueExpression) &&
                ts.isPlusToken(whenTrueExpression.operatorToken) &&
                whenTrueExpression.left.getText() === "' '"
            ) {
                return [whenTrueExpression.right, tail]
            }

            /**
             * Handle conditional expression:
             *
             * `my-class ${className ? className : ''}`
             * classNames('my-class', className)
             */
            if (expression.condition.getText() === expression.whenTrue.getText()) {
                return [expression.whenTrue, tail]
            }

            /**
             * Handle conditional expression:
             *
             * `my-class ${isActive ? 'is-active' : ''}`
             * classNames('my-class', isActive && 'is-active')
             */
            const ampersandExpression = ts.factory.createLogicalAnd(expression.condition, expression.whenTrue)

            return [ampersandExpression, tail]
        }

        return [expression, tail]
    })

    const nonEmptyArguments = [firstArguments.length > 0 ? '' : head, ...classNamesCallArguments]
        .filter(Boolean)
        .map(argument => {
            if (typeof argument === 'string') {
                return ts.factory.createStringLiteral(argument)
            }

            return argument
        })

    return wrapIntoClassNamesUtility([...firstArguments, ...nonEmptyArguments])
}

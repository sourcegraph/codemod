import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { bootstrapAlertToComponent } from '../bootstrapAlertToComponent'

testCodemod('buttonElementToComponent', bootstrapAlertToComponent, [
    {
        label: 'div element and "alert" class',
        initialSource: 'export const Test = <div className="alert">Hey</div>',
        expectedSource: `
            import { Alert } from '@sourcegraph/wildcard'

            export const Test = <Alert>Hey</Alert>
        `,
    },
    {
        label: 'div element and alert variant class',
        initialSource: 'export const Test = <div className="alert alert-primary mb-3">Hey</div>',
        expectedSource: `
            import { Alert } from '@sourcegraph/wildcard'

            export const Test = (
                <Alert className="mb-3" variant="primary">
                    Hey
                </Alert>
            )
        `,
    },
    {
        label: 'testing',
        initialSource: `
            export const Test = (
                <div>
                    <div className="alert alert-info">
                        testing
                    </div>
                </div>
            )
        `,
        expectedSource: `
            import { Alert } from '@sourcegraph/wildcard'

            export const Test = (
                <Alert className="mb-3" variant="primary">
                    Hey
                </Alert>
            )
        `,
    },
    {
        label: '"classNames" utility removal',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                <div className={classNames('alert alert-secondary', className)}>Hey</button>
            )
        `,
        expectedSource: `
            import { Alert } from '@sourcegraph/wildcard'

            export const Test = (
                <Alert className={className} variant="secondary">
                    Hey
                </Alert>
            )
        `,
    },
    {
        label: '"classNames" arguments mutation',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                 <div className={classNames('alert alert-secondary hello', className)}>Hey</div>
            )
        `,
        expectedSource: `
            import classNames from 'classnames'

            import { Alert } from '@sourcegraph/wildcard'

            export const Test = (
                <Alert className={classNames('hello', className)} variant="secondary">
                    Hey
                </Alert>
            )
        `,
    },
    {
        label: '"ConditionalExpression" in "classNames" arguments and element children',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                <div className={classNames('alert', isActive ? 'alert-primary' : 'alert-info', className)}>
                    <small>Big</small> bad <b>button</b>
                </div>
            )
        `,
        expectedSource: `
            import classNames from 'classnames'

            import { Alert } from '@sourcegraph/wildcard'

            export const Test = (
                <Alert className={classNames(isActive ? 'alert-primary' : 'alert-info', className)}>
                    <small>Big</small> bad <b>button</b>
                </Alert>
            )
        `,
        expectedManualChangeMessages: [
            `
                /test.tsx:4:32 - warning: 'ConditionalExpression' parent is not supported. Please complete the transform manually.
                >>>    isActive ? 'alert-primary' : 'alert-info'
            `,
        ],
    },
    {
        label: '"BinaryExpression" in "classNames" arguments',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                <div className={classNames('alert alert-secondary hello', true && 'alert-primary')}>
                    Hey
                </div>
            )
        `,
        expectedSource: `
            import classNames from 'classnames'

            import { Alert } from '@sourcegraph/wildcard'

            export const Test = (
                <Alert className={classNames('hello', true && 'alert-primary')} variant="secondary">
                    Hey
                </Alert>
            )
        `,
        expectedManualChangeMessages: [
            `
                /test.tsx:4:40 - warning: 'BinaryExpression' parent is not supported. Please complete the transform manually.
                >>>     true && 'alert-primary'
            `,
        ],
    },
    {
        label: 'direct children of the same type and button class used on unsupported HTML element',
        initialSource: `
            export const Test = (
                <div>
                    <span className="alert">asd</span>
                </div>
            )
        `,
        expectedSource: `
            export const Test = (
                <div>
                    <span className="alert">asd</span>
                </div>
            )
        `,
        expectedManualChangeMessages: [
            `
                /test.tsx:3:9 - warning: Class 'alert' is used on the 'span' element. Please update it manually.
                >>>    <span className="alert">
            `,
        ],
    },
    {
        label: 'alert class used on unsupported React component',
        initialSource: 'export const Test = <Card className="alert">Hey</Card>',
        expectedSource: 'export const Test = <Card className="alert">Hey</Card>',
        expectedManualChangeMessages: [
            `
                /test.tsx:1:20 - warning: Class 'alert' is used on the 'Card' element. Please update it manually.
                >>>     <Card className="alert">
            `,
        ],
    },
])

import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { buttonElementToComponent } from '../buttonElementToComponent'

testCodemod('buttonElementToComponent', buttonElementToComponent, [
    {
        label: 'button element and "btn" class',
        initialSource: 'export const Test = <button className="btn">Hey</button>',
        expectedSource: `
            import { Button } from '@sourcegraph/wildcard'

            export const Test = <Button>Hey</Button>
        `,
    },
    {
        label: 'button element and all global button classes',
        initialSource:
            'export const Test = <button type="button" className="btn btn-primary btn-outline btn-sm btn-icon">Hey</button>',
        expectedSource: `
            import { Button } from '@sourcegraph/wildcard'

            export const Test = (
                <Button className="btn-icon" variant="primary" size="sm" outline={true}>
                    Hey
                </Button>
            )
        `,
    },
    {
        label: 'button element and "btn-outline-x" class',
        initialSource:
            'export const Test = <button type="button" className="btn btn-outline-primary btn-sm btn-icon">Hey</button>',
        expectedSource: `
            import { Button } from '@sourcegraph/wildcard'

            export const Test = (
                <Button className="btn-icon" variant="primary" outline={true} size="sm">
                    Hey
                </Button>
            )
        `,
    },
    {
        label: '"classNames" utility removal',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                <button className={classNames('btn btn-secondary', className)}>Hey</button>
            )
        `,
        expectedSource: `
            import { Button } from '@sourcegraph/wildcard'

            export const Test = (
                <Button className={className} variant="secondary">
                    Hey
                </Button>
            )
        `,
    },
    {
        label: '"classNames" arguments mutation',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                 <button type="submit" className={classNames('btn btn-secondary hello', className)}>Hey</button>
            )
        `,
        expectedSource: `
            import classNames from 'classnames'

            import { Button } from '@sourcegraph/wildcard'

            export const Test = (
                <Button type="submit" className={classNames('hello', className)} variant="secondary">
                    Hey
                </Button>
            )
        `,
    },
    {
        label: '"ConditionalExpression" in "classNames" arguments and element children',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                <button className={classNames('btn', isActive ? 'btn-primary' : 'btn-info', className)}>
                    <small>Big</small> bad <b>button</b>
                </button>
            )
        `,
        expectedSource: `
            import classNames from 'classnames'

            import { Button } from '@sourcegraph/wildcard'

            export const Test = (
                <Button className={classNames(isActive ? 'btn-primary' : 'btn-info', className)}>
                    <small>Big</small> bad <b>button</b>
                </Button>
            )
        `,
        expectedManualChangeMessages: [
            `
                /test.tsx:4:35 - warning: 'ConditionalExpression' parent is not supported. Please complete the transform manually.
                >>>    isActive ? 'btn-primary' : 'btn-info'
            `,
        ],
    },
    {
        label: '"BinaryExpression" in "classNames" arguments',
        initialSource: `
            import classNames from 'classnames'

            export const Test = (
                <button type="submit" className={classNames('btn btn-secondary hello', true && 'btn-primary')}>
                    Hey
                </button>
            )
        `,
        expectedSource: `
            import classNames from 'classnames'

            import { Button } from '@sourcegraph/wildcard'

            export const Test = (
                <Button type="submit" className={classNames('hello', true && 'btn-primary')} variant="secondary">
                    Hey
                </Button>
            )
        `,
        expectedManualChangeMessages: [
            `
                /test.tsx:4:57 - warning: 'BinaryExpression' parent is not supported. Please complete the transform manually.
                >>>     true && 'btn-primary'
            `,
        ],
    },
    {
        label: 'direct children of the same type and button class used on unsupported HTML element',
        initialSource: `
            export const Test = (
                <div>
                    <div className="btn">asd</div>
                </div>
            )
        `,
        expectedSource: `
            export const Test = (
                <div>
                    <div className="btn">asd</div>
                </div>
            )
        `,
        expectedManualChangeMessages: [
            `
                /test.tsx:3:9 - warning: Class 'btn' is used on the 'div' element. Please update it manually.
                >>>    <div className="btn">
            `,
        ],
    },
    {
        label: 'button class used on unsupported React component',
        initialSource: 'export const Test = <Link className="btn">Hey</Link>',
        expectedSource: 'export const Test = <Link className="btn">Hey</Link>',
        expectedManualChangeMessages: [
            `
                /test.tsx:1:20 - warning: Class 'btn' is used on the 'Link' element. Please update it manually.
                >>>     <Link className="btn">
            `,
        ],
    },
    {
        label: 'usage of the `tagToConvert` transform option',
        transformOptions: {
            tagToConvert: 'Link',
        },
        initialSource: 'export const Test = <Link className="btn">Hey</Link>',
        expectedSource: `
            import { Button } from '@sourcegraph/wildcard'

            export const Test = <Button as={Link}>Hey</Button>
        `,
    },
])

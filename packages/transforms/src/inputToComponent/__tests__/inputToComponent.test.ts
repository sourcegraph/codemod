import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { inputToComponent } from '../inputToComponent'

testCodemod('inputToComponent', inputToComponent, [
    {
        label: 'case 1',
        initialSource: 'export const Test = <input className="hello form-control" type="text" {...rest} />',
        expectedSource: `
            import { Input } from '@sourcegraph/wildcard'

            export const Test = <Input className="hello" {...rest} />
        `,
    },
    {
        label: 'case 2',
        initialSource: 'export const Test = <input className="form-control form-control-sm hello" />',
        expectedSource: `
            import { Input } from '@sourcegraph/wildcard'

            export const Test = <Input className="hello" size="sm" />
        `,
    },
    {
        label: 'case 3',
        initialSource: `
            import classNames from 'classnames'
            export const Test = <input className={classNames('form-control-sm hello', styles.coolInput)} />`,
        expectedSource: `
            import classNames from 'classnames'

            import { Input } from '@sourcegraph/wildcard'

            export const Test = <Input className={classNames('hello', styles.coolInput)} size="sm" />
        `,
    },
    {
        label: 'case 4',
        initialSource: `
            import classNames from 'classnames'
            export const Test = <input aria-label="Console icon" className={classNames('form-control', styles.coolInput)} />`,
        expectedSource: `
            import { Input } from '@sourcegraph/wildcard'

            export const Test = <Input aria-label="Console icon" className={styles.coolInput} />
        `,
    },
    {
        label: 'case 5',
        initialSource: 'export const Test = <input className="hello" type="text" {...rest} />',
        expectedSource: `
            import { Input } from '@sourcegraph/wildcard'

            export const Test = <Input className="hello" {...rest} />
        `,
    },
])

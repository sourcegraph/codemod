import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { iconToComponent } from '../iconToComponent'

testCodemod('iconToComponent', iconToComponent, [
    {
        label: 'case 1',
        initialSource: 'export const Test = <CloseIcon className="icon-inline hello" />',
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className="hello" svg={CloseIcon} />
        `,
    },
    {
        label: 'case 2',
        initialSource: 'export const Test = <ConsoleIcon className="icon-inline-md hello" />',
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className="hello" svg={ConsoleIcon} size="md" />
        `,
    },
    {
        label: 'case 3',
        initialSource: `
            import classNames from 'classnames'
            export const Test = <ConsoleIcon className={classNames('icon-inline-md hello', styles.consoleIcon)} />`,
        expectedSource: `
            import classNames from 'classnames'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className={classNames('hello', styles.consoleIcon)} svg={ConsoleIcon} size="md" />
        `,
    },
    {
        label: 'case 4',
        initialSource: `
            import classNames from 'classnames'
            export const Test = <ConsoleIcon aria-label="Console icon" className={classNames('icon-inline-md', styles.consoleIcon)} />`,
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon aria-label="Console icon" className={styles.consoleIcon} svg={ConsoleIcon} size="md" />
        `,
    },
])

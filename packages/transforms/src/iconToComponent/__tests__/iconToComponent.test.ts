import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { iconToComponent } from '../iconToComponent'

testCodemod('iconToComponent', iconToComponent, [
    {
        label: 'case 1',
        initialSource: 'export const Test = <CloseIcon className="icon-inline hello" />',
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon svg={<CloseIcon />} className="hello" />
        `,
    },
    {
        label: 'case 2',
        initialSource: 'export const Test = <ConsoleIcon className="icon-inline-md hello" />',
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon svg={<ConsoleIcon />} size="md" className="hello" />
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

            export const Test = <Icon svg={<ConsoleIcon />} size="md" className={classNames('hello', styles.consoleIcon)} />
        `,
    },
    {
        label: 'case 4',
        initialSource: `
            import classNames from 'classnames'
            export const Test = <ConsoleIcon aria-label="Console icon" className={classNames('icon-inline-md', styles.consoleIcon)} />`,
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon svg={<ConsoleIcon aria-label="Console icon" />} size="md" className={styles.consoleIcon} />
        `,
    },
])

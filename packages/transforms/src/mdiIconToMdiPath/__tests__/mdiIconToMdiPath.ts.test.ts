import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { mdiIconToMdiPath } from '../mdiIconToMdiPath'

testCodemod('mdiIconToMdiPath', mdiIconToMdiPath, [
    {
        label: 'case 1',
        initialSource: `
            import { Icon } from '@sourcegraph/wildcard'
            import CloseIcon from 'mdi-react/CloseIcon'

            export const Test = <Icon as={CloseIcon} className="hello" />`,
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'
            import { mdiCloseIcon } from '@mdi-react/CloseIcon'

            export const Test = <Icon className="hello" svgPath={mdiCloseIcon} />
        `,
    },
    // {
    //     label: 'case 2',
    //     initialSource: 'export const Test = <ConsoleIcon className="icon-inline-md hello" />',
    //     expectedSource: `
    //         import { Icon } from '@sourcegraph/wildcard'

    //         export const Test = <Icon className="hello" as={ConsoleIcon} size="md" />
    //     `,
    // },
    // {
    //     label: 'case 3',
    //     initialSource: `
    //         import classNames from 'classnames'
    //         export const Test = <ConsoleIcon className={classNames('icon-inline-md hello', styles.consoleIcon)} />`,
    //     expectedSource: `
    //         import classNames from 'classnames'

    //         import { Icon } from '@sourcegraph/wildcard'

    //         export const Test = <Icon className={classNames('hello', styles.consoleIcon)} as={ConsoleIcon} size="md" />
    //     `,
    // },
    // {
    //     label: 'case 4',
    //     initialSource: `
    //         import classNames from 'classnames'
    //         export const Test = <ConsoleIcon aria-label="Console icon" className={classNames('icon-inline-md', styles.consoleIcon)} />`,
    //     expectedSource: `
    //         import { Icon } from '@sourcegraph/wildcard'

    //         export const Test = <Icon aria-label="Console icon" className={styles.consoleIcon} as={ConsoleIcon} size="md" />
    //     `,
    // },
])

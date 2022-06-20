import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { mdiIconToMdiPath } from '../mdiIconToMdiPath'

testCodemod('mdiIconToMdiPath', mdiIconToMdiPath, [
    {
        label: 'handles mdi icons',
        initialSource: `
            import CloseIcon from 'mdi-react/CloseIcon'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon as={CloseIcon} className="hello" />`,
        expectedSource: `
            import { mdiClose } from '@mdi/js'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className="hello" svgPath={mdiClose} />
        `,
    },
    {
        label: 'handles custom icons',
        initialSource: `
            import { Icon } from '@sourcegraph/wildcard'

            import CustomIcon from '../CustomIcon'

            export const Test = <Icon as={CustomIcon} className="hello" />`,
        expectedSource: `
            import { Icon } from '@sourcegraph/wildcard'

            import CustomIcon from '../CustomIcon'

            export const Test = <Icon as={CustomIcon} className="hello" />
        `,
    },
    {
        label: 'ignores icons with complex logic',
        initialSource: `
            import CloseIcon from 'mdi-react/CloseIcon'
            import OpenIcon from 'mdi-react/OpenIcon'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon as={CloseIcon} className="hello" />
            export const Test2 = <Icon as={isOpen ? CloseIcon : OpenIcon} className="hello" />`,
        expectedSource: `
            import { mdiClose } from '@mdi/js'
            import CloseIcon from 'mdi-react/CloseIcon'
            import OpenIcon from 'mdi-react/OpenIcon'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className="hello" svgPath={mdiClose} />
            export const Test2 = <Icon as={isOpen ? CloseIcon : OpenIcon} className="hello" />
        `,
        expectedManualChangeMessages: [
            `
            /test.tsx:7:27 - warning: Updating an expression is not supported. Please complete the transform manually
            >>>     as={isOpen ? CloseIcon : OpenIcon}
            `,
        ],
    },
])

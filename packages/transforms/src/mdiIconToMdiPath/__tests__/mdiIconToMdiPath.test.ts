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
    {
        label: 'handles direct usage of mdi icons',
        initialSource: `
            import CloseIcon from 'mdi-react/CloseIcon'

            export const Test = <CloseIcon className="hello" />`,
        expectedSource: `
            import { mdiClose } from '@mdi/js'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className="hello" svgPath={mdiClose} inline={false} aria-hidden={true} />
        `,
        expectedManualChangeMessages: [
            `
            /test.tsx:3:20 - warning: <MdiIcon /> component did not have accessibility attributes and has been hidden from screen readers automatically. Please review manually
            >>>     <Icon className="hello" svgPath={mdiClose} inline={false} aria-hidden={true} />
            `,
        ],
    },
    {
        label: 'handles direct usage of mdi icons with existing aria attributes',
        initialSource: `
            import CloseIcon from 'mdi-react/CloseIcon'

            export const Test = <CloseIcon className="hello" aria-label="Close" />`,
        expectedSource: `
            import { mdiClose } from '@mdi/js'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon className="hello" aria-label="Close" svgPath={mdiClose} inline={false} />
        `,
    },
    {
        label: 'handles direct usage of mdi icons with the size prop',
        initialSource: `
            import CloseIcon from 'mdi-react/CloseIcon'

            export const Test = <CloseIcon className="hello" aria-label="Close" size="2rem" />
            export const Test2 = <CloseIcon className="hello" aria-label="Close" size={16} />`,
        expectedSource: `
            import { mdiClose } from '@mdi/js'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = (
                <Icon className="hello" aria-label="Close" svgPath={mdiClose} inline={false} height="2rem" width="2rem" />
            )
            export const Test2 = (
                <Icon className="hello" aria-label="Close" svgPath={mdiClose} inline={false} height={16} width={16} />
            )
        `,
    },
])

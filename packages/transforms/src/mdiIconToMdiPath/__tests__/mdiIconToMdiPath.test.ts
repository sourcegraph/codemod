import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { mdiIconToMdiPath } from '../mdiIconToMdiPath'

testCodemod('mdiIconToMdiPath', mdiIconToMdiPath, [
    {
        label: 'case 1',
        initialSource: `
            import CloseIcon from 'mdi-react/CloseIcon'

            import { Icon } from '@sourcegraph/wildcard'

            export const Test = <Icon as={CloseIcon} className="hello" />`,
        expectedSource: `
            import { mdiClose } from '@mdi/js'

            import { IconV2 } from '@sourcegraph/wildcard'

            export const Test = <IconV2 className="hello" svgPath={mdiClose} />
        `,
    },
])

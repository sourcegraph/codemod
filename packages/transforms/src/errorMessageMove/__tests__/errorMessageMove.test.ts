import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { errorMessageMove } from '../errorMessageMove'

testCodemod('errorMessageMove', errorMessageMove, [
    {
        label: 'default',
        initialSource: `
            import { ErrorMessage } from '@sourcegraph/branded/src/components/alerts'

            export const Test = <ErrorMessage className="btn">Hey</ErrorMessage>
        `,
        expectedSource: `
            import { ErrorMessage } from '@sourcegraph/wildcard'

            export const Test = <ErrorMessage className="btn">Hey</ErrorMessage>
        `,
    },
])

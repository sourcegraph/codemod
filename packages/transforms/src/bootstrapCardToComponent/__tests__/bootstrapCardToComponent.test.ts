import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { bootstrapCardToComponent } from '../bootstrapCardToComponent'

testCodemod('bootstrapCardToComponent', bootstrapCardToComponent, [
    {
        label: 'div element and "card-header" class',
        initialSource: 'export const Test = <div className="card-header">Hey</div>',
        expectedSource: `
            import { Card } from '@sourcegraph/wildcard'

            export const Test = <CardHeader>Hey</CardHeader>
        `,
    },
])

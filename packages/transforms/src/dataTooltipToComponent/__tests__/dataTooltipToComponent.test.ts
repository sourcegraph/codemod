import { testCodemod } from '@sourcegraph/codemod-toolkit-ts'

import { dataTooltipToComponent } from '../dataTooltipToComponent'

testCodemod('dataTooltipToComponent', dataTooltipToComponent, [
    {
        label: 'div element with "data-tooltip" attribute',
        initialSource: 'export const Test = <div data-tooltip="Tooltip 1">Hover me</button>',
        expectedSource: `
            import { Tooltip } from '@sourcegraph/wildcard'

            export const Test = <Tooltip content="Tooltip 1"><div>Hover me</div></Tooltip>
        `,
    },
    {
        label: 'div element with "data-tooltip" and "data-delay" attributes',
        initialSource: 'export const Test = <div data-tooltip="Tooltip 1" data-delay="10000">Hover me</button>',
        expectedSource: `
            import { Tooltip } from '@sourcegraph/wildcard'

            export const Test = <Tooltip content="Tooltip 1"><div>Hover me</div></Tooltip>
        `,
    },
    {
        label: 'div element with "data-tooltip" and a specific "data-placement" attribute',
        initialSource: 'export const Test = <div data-tooltip="Tooltip 1" data-placement="top">Hover me</button>',
        expectedSource: `
            import { Tooltip } from '@sourcegraph/wildcard'

            export const Test = <Tooltip content="Tooltip 1" placement="top"><div>Hover me</div></Tooltip>
        `,
    },
    {
        label: 'div element with "data-tooltip" and the auto "data-placement" attribute',
        initialSource: 'export const Test = <div data-tooltip="Tooltip 1" data-placement="auto">Hover me</button>',
        expectedSource: `
            import { Tooltip } from '@sourcegraph/wildcard'

            export const Test = <Tooltip content="Tooltip 1"><div>Hover me</div></Tooltip>
        `,
    },
    {
        label: 'self-closing div element with "data-tooltip"',
        initialSource: 'export const Test = <div data-tooltip="Tooltip 1" />',
        expectedSource: `
            import { Tooltip } from '@sourcegraph/wildcard'

            export const Test = <Tooltip content="Tooltip 1"><div /></Tooltip>
        `,
    },
])

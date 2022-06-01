import { ts } from 'ts-morph'

export const ICON_SIZES = ['sm', 'md'] as const

export interface PropertyMapping {
    inputProp: string | ts.Node
    outputProp: string | ts.Node
}

// const sizeClassNamesMapping: PropertyMapping[] = ICON_SIZES.map(size => {
//     return {
//         className: `icon-inline-${size}`,
//         props: [
//             {
//                 name: 'size',
//                 value: ts.factory.createStringLiteral(size),
//             },
//         ],
//     }
// })

export const iconClassNamesMapping: PropertyMapping[] = [
    {
        inputProp: 'icon-inline',
        props: [],
    },
]

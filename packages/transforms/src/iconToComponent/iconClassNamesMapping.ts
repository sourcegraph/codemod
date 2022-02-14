import { ts } from 'ts-morph'

export const ICON_SIZES = ['sm', 'md'] as const

export interface ClassNameMapping {
    className: string
    props: {
        name: string
        value: ts.Node
    }[]
}

const sizeClassNamesMapping: ClassNameMapping[] = ICON_SIZES.map(size => {
    return {
        className: `icon-inline-${size}`,
        props: [
            {
                name: 'size',
                value: ts.factory.createStringLiteral(size),
            },
        ],
    }
})

export const iconClassNamesMapping: ClassNameMapping[] = [
    ...sizeClassNamesMapping,
    {
        className: 'icon-inline',
        props: [],
    },
]

import { ts } from 'ts-morph'

export const INPUT_SIZES = ['sm'] as const

export interface ClassNameMapping {
    className: string
    props: {
        name: string
        value: ts.Node
    }[]
}

const sizeClassNamesMapping: ClassNameMapping[] = INPUT_SIZES.map(size => {
    return {
        className: `form-control-${size}`,
        props: [
            {
                name: 'size',
                value: ts.factory.createStringLiteral(size),
            },
        ],
    }
})

export const inputClassNamesMapping: ClassNameMapping[] = [
    ...sizeClassNamesMapping,
    {
        className: 'form-control',
        props: [],
    },
]

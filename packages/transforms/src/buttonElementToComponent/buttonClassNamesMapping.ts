import { ts } from 'ts-morph'

export const BUTTON_VARIANTS = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'merged',
    'link',
] as const

export const BUTTON_SIZES = ['sm', 'lg'] as const
export const BUTTON_OUTLINE_VARIANTS = BUTTON_VARIANTS.map(variant => {
    return `outline-${variant}`
})

export interface ClassNameMapping {
    className: string
    props: {
        name: string
        value: ts.Node
    }[]
}

const outlineClassMapping: ClassNameMapping = {
    className: 'btn-outline',
    props: [
        {
            name: 'outline',
            value: ts.factory.createJsxExpression(undefined, ts.factory.createTrue()),
        },
    ],
}

const variantClassNamesMapping: ClassNameMapping[] = BUTTON_VARIANTS.flatMap(variant => {
    return [
        {
            className: `btn-${variant}`,
            props: [
                {
                    name: 'variant',
                    value: ts.factory.createStringLiteral(variant),
                },
            ],
        },
        {
            className: `btn-outline-${variant}`,
            props: [
                {
                    name: 'variant',
                    value: ts.factory.createStringLiteral(variant),
                },
                outlineClassMapping.props[0],
            ],
        },
    ]
})

const sizeClassNamesMapping: ClassNameMapping[] = BUTTON_SIZES.map(size => {
    return {
        className: `btn-${size}`,
        props: [
            {
                name: 'size',
                value: ts.factory.createStringLiteral(size),
            },
        ],
    }
})

export const buttonClassNamesMapping: ClassNameMapping[] = [
    ...variantClassNamesMapping,
    ...sizeClassNamesMapping,
    outlineClassMapping,
    {
        className: 'btn',
        props: [],
    },
]

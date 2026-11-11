import { ts } from 'ts-morph'

export const ALERT_VARIANTS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'merged'] as const

export interface ClassNameMapping {
    className: string
    props: {
        name: string
        value: ts.Node
    }[]
}

const variantClassNamesMapping: ClassNameMapping[] = ALERT_VARIANTS.flatMap(variant => {
    return [
        {
            className: `alert-${variant}`,
            props: [
                {
                    name: 'variant',
                    value: ts.factory.createStringLiteral(variant),
                },
            ],
        },
    ]
})

export const alertClassNamesMapping: ClassNameMapping[] = [
    ...variantClassNamesMapping,
    {
        className: 'alert',
        props: [],
    },
]

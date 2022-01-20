import { ts } from 'ts-morph'

export interface ClassNameMapping {
    className: string
    props: {
        name: string
        value: ts.Node
    }[]
}

export const cardClassNameMapping: ClassNameMapping[] = [
    {
        className: 'card-header',
        props: [],
    },
]

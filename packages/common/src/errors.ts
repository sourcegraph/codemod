import { errors } from '@ts-morph/common'
import { Node } from 'ts-morph'

import { AnyFunction, NonVoidFunction } from './types'

export { errors }

export class ManualChangeError extends Error {
    constructor(public node: Node, public message: string) {
        super(message)
    }
}

type NonVoidRecordMethods<T extends Record<string, AnyFunction>> = {
    [key in keyof T]: NonVoidFunction<T[key]>
}

/**
 * Wraps each object's method into `errors.throwIfNullOrUndefined()` and updates type signature accordingly.
 */
export function throwFromMethodsIfUndefinedReturn<T extends Record<string, AnyFunction>>(
    record: T
): NonVoidRecordMethods<T> {
    const entriesWithWrappedValueCall = Object.entries(record).map(([key, value]) => {
        return [
            key,
            (...args: unknown[]) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return errors.throwIfNullOrUndefined(value(...args), 'unexpected void return')
            },
        ]
    })

    return Object.fromEntries(entriesWithWrappedValueCall) as NonVoidRecordMethods<T>
}

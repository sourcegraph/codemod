// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any[]) => any

/**
 * Remove `void` from the return type of the function.
 */
export type NonVoidFunction<T extends AnyFunction> = (...args: Parameters<T>) => Exclude<ReturnType<T>, void>

/**
 * Checks if type `T` is the `any` type.
 */
export declare type IsAny<T> = 0 extends 1 & T ? true : false

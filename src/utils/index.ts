export function isDefined<T>(argument: T | undefined): argument is T {
    return argument !== undefined
}

export * from './formatWithPrettierEslint'
export * from './formatWithStylelint'

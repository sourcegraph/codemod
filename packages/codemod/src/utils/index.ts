export function isDefined<T>(argument: T | undefined): argument is T {
    return argument !== undefined
}

export const decapitalize = ([first, ...rest]: string): string => {
    return first.toLowerCase() + rest.join('')
}

export * from './formatWithPrettierEslint'
export * from './formatWithStylelint'

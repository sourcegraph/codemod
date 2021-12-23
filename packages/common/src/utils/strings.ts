export const decapitalize = ([first, ...rest]: string): string => {
    return first.toLowerCase() + rest.join('')
}

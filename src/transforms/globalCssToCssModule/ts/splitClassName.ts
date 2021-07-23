interface SplitClassNameResult {
    exportNames: string[]
    leftOverClassnames: string[]
}

/**
 * Example: splitClassName('kek--wow d-flex mr-1', { 'kek--wow': 'kekWow' })
 * returns: { exportNames: ['kekWow'], leftOverClassnames: ['d-flex', 'mr-1'] }
 *
 * @param className ClassName value string which might contain replaceable parts.
 * @param exportNameMap Mapping between classes and exportNames.
 * @returns Object that contains array of exportNames found in the className and the left over value.
 */
export function splitClassName(className: string, exportNameMap: Record<string, string>): SplitClassNameResult {
    const classNamesToReplace = Object.keys(exportNameMap)

    return className.split(' ').reduce<SplitClassNameResult>(
        (accumulator, className) => {
            if (classNamesToReplace.includes(className)) {
                accumulator.exportNames.push(exportNameMap[className])
            } else {
                accumulator.leftOverClassnames.push(className)
            }

            return accumulator
        },
        {
            exportNames: [],
            leftOverClassnames: [],
        }
    )
}

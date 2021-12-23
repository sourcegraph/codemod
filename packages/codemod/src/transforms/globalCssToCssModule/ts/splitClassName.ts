interface SplitClassNameOptions {
    // ClassName value string which might contain replaceable parts.
    className: string
    // Mapping between classes and exportNames.
    exportNameMap: Record<string, string>
    // Object to collect replaced classes usage in React component.
    usageStats: Record<string, boolean>
}

// Object that contains array of exportNames found in the className and the left over value.
interface SplitClassNameResult {
    exportNames: string[]
    leftOverClassnames: string[]
}

/**
 * Example: splitClassName({ className: 'kek--wow d-flex mr-1', exportNameMap: { 'kek--wow': 'kekWow' }, usageStats: {})
 * returns: { exportNames: ['kekWow'], leftOverClassnames: ['d-flex', 'mr-1'] }
 */
export function splitClassName(options: SplitClassNameOptions): SplitClassNameResult {
    const { className, exportNameMap, usageStats } = options
    const classNamesToReplace = Object.keys(exportNameMap)

    return className.split(' ').reduce<SplitClassNameResult>(
        (accumulator, className) => {
            if (classNamesToReplace.includes(className)) {
                usageStats[className] = true
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

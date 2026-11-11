import signale from 'signale'
import { SourceFile } from 'ts-morph'

import { isDefined } from '@sourcegraph/codemod-common'

import { getNodesWithClassName } from './getNodesWithClassName'
import { processNodesWithClassName } from './processNodesWithClassName'

interface TransformComponentFileOptions {
    tsSourceFile: SourceFile
    exportNameMap: Record<string, string>
    cssModuleFileName: string
    classname: 'classnames' | 'clsx'
}

export function transformComponentFile(options: TransformComponentFileOptions): void {
    const { tsSourceFile, exportNameMap, cssModuleFileName, classname } = options

    // Object to collect CSS classes usage and report unused classes after the codemod.
    const usageStats = Object.fromEntries(
        Object.keys(exportNameMap).map(className => {
            return [className, false]
        })
    )

    let areAllNodesProcessed = false

    while (!areAllNodesProcessed) {
        // `processNodesWithClassName` returns `true` when there's nothing more to process.
        areAllNodesProcessed = processNodesWithClassName({
            usageStats,
            exportNameMap,
            nodesWithClassName: getNodesWithClassName(tsSourceFile),
            classname
        })
    }

    const unusedClassNames = Object.entries(usageStats)
        .map(([className, isUsed]) => {
            return isUsed ? undefined : className
        })
        .filter(isDefined)

    if (unusedClassNames.length > 0) {
        signale.warn(`Unused CSS classes in ${cssModuleFileName}`, unusedClassNames)
    }
}

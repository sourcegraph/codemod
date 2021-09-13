import { decapitalize, isDefined } from '../../../utils'

interface RemovedPrefix {
    prefix: string
    exportName: string
}

interface RemovePrefixFromExportNameIfNeededOptions {
    className: string
    exportName: string
    prefixesToRemove: RemovedPrefix[]
}

/**
 * If `className` starts with `prefix__` and `exportName` starts with `prefix` -> remove `prefix` from the export name.
 *
 * ```ts
 * const exportName = removePrefixFromExportNameIfNeeded({
 *     className: 'menu__button',
 *     exportName: 'menuButton',
 *     prefixesToRemove: [{ prefix: 'menu__', exportName: 'menu' }]
 * })
 *
 * exportName === 'button'
 * ```
 */
export function removePrefixFromExportNameIfNeeded(options: RemovePrefixFromExportNameIfNeededOptions): string {
    const { className, exportName, prefixesToRemove } = options

    const removedPrefix = prefixesToRemove.find(
        removedPrefix => exportName.startsWith(removedPrefix.exportName) && className.startsWith(removedPrefix.prefix)
    )

    if (removedPrefix) {
        return decapitalize(exportName.replace(removedPrefix.exportName, ''))
    }

    return exportName
}

/**
 * Upon conversion to the CSS module, we lift `&__` nested selectors to the root level:
 *
 * ```scss
 * .menu {
 *   &__button { ... }
 * }
 *
 * .menu {}
 * .button {}
 * ```
 *
 * Here `menu__` is a removed prefix because className changed:
 * .menu__button -> .button
 *
 */
export function getPrefixesToRemove(exportNameMap: Record<string, string>): RemovedPrefix[] {
    const prefixesToRemove = Object.keys(exportNameMap)
        .map(key => {
            const matches = key.match(/(.+)__/)

            if (matches) {
                return {
                    prefix: matches[0],
                    exportName: exportNameMap[matches[1]],
                }
            }

            return undefined
        })
        .filter(isDefined)

    return [...new Set(prefixesToRemove)]
}

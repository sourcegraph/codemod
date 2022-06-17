import { Node } from 'ts-morph'

import { addOrUpdateSourcegraphWildcardImportIfNeeded } from '@sourcegraph/codemod-toolkit-packages'
import {
    runTransform,
    JsxTagElement,
    setOnJsxTagElement,
    getParentUntilOrThrow,
    isJsxTagElement,
} from '@sourcegraph/codemod-toolkit-ts'

/**
 * Convert `<Icon as={MdiIcon} />` element to `<Icon svgPath={mdiIconPath} />` component.
 */
export const mdiIconToMdiPath = runTransform(context => {
    const jsxTagElementsToUpdate = new Set<JsxTagElement>()
    const mdiIconPathsToImport = new Set<string>()

    return {
        JsxAttribute(jsxAttribute) {
            const jsxTagElement = getParentUntilOrThrow(jsxAttribute, isJsxTagElement)
            if (jsxTagElement.getTagNameNode().getText() !== 'Icon') {
                // Not Icon component, lets exit
                return
            }

            const structure = jsxAttribute.getStructure()
            if (structure.name !== 'as' || !structure.initializer) {
                // Not the 'as' prop or empty, so we exit
                return
            }

            // Updates `{CloseIcon}` to `mdiClose`
            const updatedValue = `mdi${structure.initializer.replace('{', '').replace('}', '').replace('Icon', '')}`

            // Add `svgPath={...}` with updated value
            jsxTagElement.addAttribute({
                name: 'svgPath',
                initializer: `{${updatedValue}}`,
            })

            // Remove `as={...}` with old value
            jsxAttribute.remove()

            // Store this element so we can import it once finished with this file.
            jsxTagElementsToUpdate.add(jsxTagElement)

            // Store this import so we can import it once finished with this file.
            mdiIconPathsToImport.add(updatedValue)
        },
        SourceFileExit(sourceFile) {
            if (jsxTagElementsToUpdate.size > 0) {
                // Update <Icon to <IconV2
                for (const jsxTagElement of jsxTagElementsToUpdate) {
                    if (Node.isJsxSelfClosingElement(jsxTagElement)) {
                        setOnJsxTagElement(jsxTagElement, { name: 'IconV2' })
                    }
                }
                // Add <IconV2 import
                addOrUpdateSourcegraphWildcardImportIfNeeded({
                    sourceFile,
                    importStructure: {
                        namedImports: ['IconV2'],
                    },
                })
            }

            if (mdiIconPathsToImport.size > 0) {
                // Add mdiIcon import
                sourceFile.addImportDeclaration({
                    namedImports: [...mdiIconPathsToImport],
                    moduleSpecifier: '@mdi/js',
                })
            }

            sourceFile.fixUnusedIdentifiers()
        },
    }
})

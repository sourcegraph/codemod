import { Node } from 'ts-morph'

import { addOrUpdateSourcegraphWildcardImportIfNeeded } from '@sourcegraph/codemod-toolkit-packages'
import {
    runTransform,
    getParentUntilOrThrow,
    isJsxTagElement,
    getImportDeclarationByModuleSpecifier,
} from '@sourcegraph/codemod-toolkit-ts'

/**
 * Convert `<Icon as={MdiIcon} />` element to `<Icon svgPath={mdiIconPath} />` component.
 */
export const mdiIconToMdiPath = runTransform(context => {
    const { throwManualChangeError, addManualChangeLog } = context

    const mdiIconPathsToImport = new Set<string>()

    const isMdiReactToken = (token: string): boolean => {
        const importDeclaration = getImportDeclarationByModuleSpecifier(context.sourceFile, `mdi-react/${token}`)
        return importDeclaration !== undefined
    }

    return {
        /**
         * Handles converting <MdiIcon /> to <Icon svgPath={mdiIcon} />
         */
        JsxSelfClosingElement(jsxElement) {
            const tagElementName = jsxElement.getTagNameNode().getText()
            const iconRegex = /(\w*.)Icon/

            if (!tagElementName.match(iconRegex) || !isMdiReactToken(tagElementName)) {
                // Not <MdiIcon component, so we exit
                return
            }

            const updatedValue = `mdi${tagElementName.replace(iconRegex, '$1')}`

            // e.g. update <CloseIcon /> to <Icon /> (we handle correct import later)
            jsxElement.set({
                name: 'Icon',
            })

            // Add updated svgPath attribute
            jsxElement.addAttribute({
                name: 'svgPath',
                initializer: `{${updatedValue}}`,
            })

            // Ensure `inline` is set to false to guarantee that we aren't introducing any new CSS with this change.
            jsxElement.addAttribute({
                name: 'inline',
                initializer: '{false}',
            })

            // We need to set accessibility attributes on all icons
            // If these aren't already set, we default to `aria-hidden={true}` and leave a message to review.
            if (!jsxElement.getAttribute('aria-label') && !jsxElement.getAttribute('aria-hidden')) {
                jsxElement.addAttribute({
                    name: 'aria-hidden',
                    initializer: '{true}',
                })

                addManualChangeLog({
                    node: jsxElement,
                    message:
                        '<MdiIcon /> component did not have accessibility attributes and has been hidden from screen readers automatically. Please review manually',
                })
            }

            // Our previous icon library supported a `size` prop, which set height and width.
            // We convert this to height and width to be explicit.
            const sizeAttribute = jsxElement.getAttribute('size')
            if (sizeAttribute && Node.isJsxAttribute(sizeAttribute)) {
                jsxElement.addAttribute({
                    name: 'height',
                    initializer: sizeAttribute.getInitializer()?.getText(),
                })

                jsxElement.addAttribute({
                    name: 'width',
                    initializer: sizeAttribute.getInitializer()?.getText(),
                })

                // Remove the old attribute
                jsxElement.getAttribute('size')?.remove()
            }

            // Store this value so we can import it once finished with this file.
            mdiIconPathsToImport.add(updatedValue)
        },
        /**
         * Handles converting <Icon as={MdiIcon} /> to <Icon svgPath={mdiIcon} />
         */
        JsxAttribute(jsxAttribute) {
            const jsxTagElement = getParentUntilOrThrow(jsxAttribute, isJsxTagElement)
            if (jsxTagElement.getTagNameNode().getText() !== 'Icon') {
                // Not Icon component, so we exit
                return
            }

            const structure = jsxAttribute.getStructure()
            if (structure.name !== 'as' || !structure.initializer) {
                // Not the 'as' prop or empty, so we exit
                return
            }

            if (structure.initializer.includes(' ')) {
                // complex expression, so we exit
                throwManualChangeError({
                    node: jsxAttribute,
                    message: 'Updating an expression is not supported. Please complete the transform manually',
                })
            }

            // like `{CloseIcon}`
            const token = structure.initializer

            const iconRegex = /(\w*.)Icon/
            if (!token.match(iconRegex)) {
                // Not an icon, so we exit
                return
            }

            if (!isMdiReactToken(token.replace('{', '').replace('}', ''))) {
                // its a custom icon, we don't need to do anything
                return
            }

            const updatedValue = `mdi${token.replace(iconRegex, '$1')}`.replace('{', '').replace('}', '')

            // Store this value so we can import it once finished with this file.
            mdiIconPathsToImport.add(updatedValue)

            // Add `svgPath={...}` with updated value
            jsxTagElement.addAttribute({
                name: 'svgPath',
                initializer: `{${updatedValue}}`,
            })

            // Remove `as={...}` with old value
            jsxAttribute.remove()
        },
        SourceFileExit(sourceFile) {
            if (mdiIconPathsToImport.size > 0) {
                // Add mdiIcon import
                sourceFile.addImportDeclaration({
                    namedImports: [...mdiIconPathsToImport],
                    moduleSpecifier: '@mdi/js',
                })

                // If we're using the <Icon /> component for the first time,
                // we need to add the import
                addOrUpdateSourcegraphWildcardImportIfNeeded({
                    sourceFile,
                    importStructure: {
                        namedImports: ['Icon'],
                    },
                })

                // Clean up
                sourceFile.fixUnusedIdentifiers()
            }
        },
    }
})

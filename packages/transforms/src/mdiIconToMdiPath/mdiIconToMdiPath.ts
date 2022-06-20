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
    const { throwManualChangeError } = context

    const mdiIconPathsToImport = new Set<string>()

    const isMdiReactToken = (token: string): boolean => {
        const importDeclaration = getImportDeclarationByModuleSpecifier(context.sourceFile, `mdi-react/${token}`)
        return importDeclaration !== undefined
    }

    return {
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
            }

            sourceFile.fixUnusedIdentifiers()
        },
    }
})

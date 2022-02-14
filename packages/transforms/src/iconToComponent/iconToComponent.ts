import { JsxAttributeStructure, JsxSpreadAttributeStructure, Node, printNode, StructureKind, ts } from 'ts-morph'

import {
    removeClassNameAndUpdateJsxElement,
    addOrUpdateSourcegraphWildcardImportIfNeeded,
} from '@sourcegraph/codemod-toolkit-packages'
import {
    runTransform,
    getParentUntilOrThrow,
    isJsxTagElement,
    getTagName,
    JsxTagElement,
} from '@sourcegraph/codemod-toolkit-ts'

import { validateCodemodTarget, validateCodemodTargetOrThrow } from './validateCodemodTarget'

interface IconToComponentOptions {
    tagToConvert: string
}

/**
 * Convert `<SomeIcon class="icon-inline" />` element to the `<Icon svg={<SomeIcon />} />` component.
 */
export const iconToComponent = runTransform<IconToComponentOptions>(context => {
    const { throwManualChangeError, addManualChangeLog } = context

    const jsxTagElementsToUpdate: {
        jsxTagElement: JsxTagElement
        props: {
            name: string
            value: ts.Node
        }[]
    }[] = []

    return {
        StringLiteral(stringLiteral) {
            const { classNameMappings } = validateCodemodTargetOrThrow.StringLiteral(stringLiteral)
            const jsxAttribute = getParentUntilOrThrow(stringLiteral, Node.isJsxAttribute)
            // console.log(jsxAttribute)
            if (!/classname/i.test(jsxAttribute.getName())) {
                return
            }

            const jsxTagElement = getParentUntilOrThrow(jsxAttribute, isJsxTagElement)

            if (!validateCodemodTarget.JsxTagElement(jsxTagElement)) {
                throwManualChangeError({
                    node: jsxTagElement,
                    message: `Class '${stringLiteral.getLiteralText()}' is used on the '${getTagName(
                        jsxTagElement
                    )}' element. Please update it manually.`,
                })
            }

            const iconProps: {
                name: string
                value: ts.Node
            }[] = []

            for (const { className, props } of classNameMappings) {
                const { isRemoved, manualChangeLog } = removeClassNameAndUpdateJsxElement(stringLiteral, className)

                if (manualChangeLog) {
                    addManualChangeLog(manualChangeLog)
                }

                if (isRemoved) {
                    iconProps.push(...props)
                }
            }

            jsxTagElementsToUpdate.push({
                jsxTagElement,
                props: iconProps,
            })
        },
        SourceFileExit(sourceFile) {
            if (jsxTagElementsToUpdate.length === 0) {
                return
            }

            for (const { jsxTagElement, props } of jsxTagElementsToUpdate) {
                if (Node.isJsxSelfClosingElement(jsxTagElement)) {
                    const className = jsxTagElement.getAttribute('className')?.getStructure()
                    const backup = jsxTagElement
                        .getAttributes()
                        .filter(attribute => {
                            return Node.isJsxSpreadAttribute(attribute) || attribute.getName() !== 'className'
                        })
                        .map(attribute => {
                            return attribute.getStructure()
                        })

                    jsxTagElement.set({
                        attributes: backup,
                    })

                    const beforeDelete = `{${jsxTagElement.print()}}`

                    const iconAttributes: (JsxAttributeStructure | JsxSpreadAttributeStructure)[] = props.map(
                        property => {
                            return {
                                name: property.name,
                                kind: StructureKind.JsxAttribute,
                                initializer: printNode(property.value),
                            }
                        }
                    )

                    if (className) {
                        iconAttributes.push(className)
                    }

                    iconAttributes.unshift({
                        name: 'svg',
                        kind: StructureKind.JsxAttribute,
                        initializer: beforeDelete,
                    })

                    jsxTagElement.set({
                        name: 'Icon',
                        attributes: iconAttributes,
                    })
                }
            }

            addOrUpdateSourcegraphWildcardImportIfNeeded({
                sourceFile,
                importStructure: {
                    namedImports: ['Icon'],
                },
            })

            sourceFile.fixUnusedIdentifiers()
        },
    }
})

/* eslint-disable rxjs/throw-error, etc/throw-error */
import { AcceptedPlugin, Rule, ChildNode, Root } from 'postcss'
import parser, { isRoot, Selector } from 'postcss-selector-parser'

interface PostcssToCssModulePluginOptions {
    // Classes that will be wrapped into a :global() keyword.
    globalTopLevelClasses?: string[]
}

// Based on the implementation of the `postcss-nested` plugin:
// https://github.com/postcss/postcss-nested/blob/main/index.js
export function postcssToCssModulePlugin(options: PostcssToCssModulePluginOptions = {}): AcceptedPlugin {
    const { globalTopLevelClasses = ['.theme-light', '.theme-dark'] } = options

    return {
        postcssPlugin: 'postcss-to-css-module',
        Root(root) {
            if (root.last) {
                // Remove default spacing applied by `postcss`.
                root.last.raws.before = undefined
            }
        },
        Rule(parentRule) {
            const isRootRule = isRoot(parentRule.parent)

            /**
             * Check if root level selectors include well-known global classes and wrap them
             * into a `:global()` keyword in case of a match.
             *
             * ```scss
             * .theme-light -> :global(.theme-light)
             * ```
             */
            if (isRootRule && globalTopLevelClasses.some(globalClass => parentRule.selector.includes(globalClass))) {
                for (const globalClass of globalTopLevelClasses) {
                    parentRule.selector = parentRule.selector.replace(
                        globalClass,
                        wrapSelectorInGlobalKeyword(globalClass)
                    )
                }
            }

            /**
             * Do not process children of `globalTopLevelClasses`
             *
             * ```scss
             * .theme-dark {
             *   .repo-header {
             *     border: 1px red;
             *   }
             * }
             *
             * Turns into:
             *
             * :global(.theme-dark) {
             *   .repo-header {
             *     border: 1px red;
             *   }
             * }
             * ```
             *
             * Note that the `.repo-header` selector is not affected.
             *
             */
            if (isRootRule && parentRule.selector.includes(':global(')) {
                return
            }

            // Go through all child selectors and remove redundant nesting according to our guidelines:
            // https://docs.sourcegraph.com/dev/background-information/web/styling#css-modules
            parentRule.each(child => {
                if (child.type === 'rule') {
                    child.selectors = updateChildSelectors(parentRule, child)
                }
            })
        },
    }
}

function updateChildSelectors(parent: Rule, child: Rule): string[] {
    let shouldRemoveNesting = false

    const updatedChildSelectors = child.selectors.reduce<string[]>((result, selectorString) => {
        if (selectorString.length !== 0) {
            const selectorNode = parse(selectorString, child)
            shouldRemoveNesting = replaceSelectorNodesIfNeeded(selectorNode)

            result.push(selectorNode.toString())
        }

        return result
    }, [])

    // If nesting should be removed, uplift nested selector to the direct child level.
    if (shouldRemoveNesting) {
        /**
         * Preserve comment above the selector on nesting removal.
         *
         * ```scss
         * .menu {
         *   ...
         *
         *   Some important comment about &__button selector.
         *   &__button { ... }
         * }
         *
         * Turns into:
         *
         * .menu { ... }
         *
         * Some important comment about &__button selector.
         * .button { ... }
         */
        pickComment(child.prev(), parent.root())
        parent.root().last?.after(child)
    }

    if (parent.nodes.length === 0) {
        parent.remove()
    }

    return updatedChildSelectors
}

function replaceSelectorNodesIfNeeded(nodes: Selector): boolean {
    return nodes.reduce<boolean>((shouldRemoveNesting, node, index) => {
        /**
         * Assume that all nested classes and ids not starting with `&` are global:
         *
         * Example:
         *
         * ```scss
         * .menu {
         *   .nav-bar { ... } -> :global(.nav-bar) { ... }
         *   #sign-up { ... } -> :global(#sign-up) { ... }
         * }
         */
        if (node.type === 'class' || node.type === 'id') {
            const globalClass = wrapSelectorInGlobalKeyword(node.toString())
            node.replaceWith(parse(globalClass))
        }

        if (node.type === 'nesting') {
            if (node.value !== '&') {
                throw new Error(`Found unhandled nesting! ${node.value}`)
            }

            // Get text after ampersand operator: &--disabled or &__button.
            const nextNode = node.next()
            const nextNodeValue = nextNode?.value

            if (nextNodeValue) {
                if (nextNodeValue.startsWith('--')) {
                    // Preserve nesting for modifier classes, e.g., `&--disabled`
                } else if (nextNodeValue.startsWith('__')) {
                    /**
                     * Remove nesting for selectors starting from `__`
                     *
                     * ```scss
                     * .menu {
                     *   ...
                     *
                     *   &__button { ... }
                     * }
                     *
                     * Turns into:
                     *
                     * .menu { ... }
                     * .button { ... }
                     * ```
                     */
                    node.replaceWith(parse(''))
                    nextNode.replaceWith(parse(nextNodeValue.replace('__', '.')))

                    /**
                     * If its not the first node of the selector — keep nesting in place
                     *
                     * ```scss
                     * .menu {
                     *   &:hover &__button { ... }
                     * }
                     * ```
                     *
                     * Turns into:
                     *
                     * ```scss
                     * .menu {
                     *   &:hover .button { ... }
                     * }
                     * ```
                     */
                    if (index === 0) {
                        return true
                    }
                }
            }
        }

        return shouldRemoveNesting
    }, false)
}

function wrapSelectorInGlobalKeyword(selector: string): string {
    return `:global(${selector})`
}

// If passed node is a comment -> attach it to the end of the file and return it, otherwise return the passed node.
function pickComment(maybeCommentNode: ChildNode | undefined, parent: Rule | Root): Rule | Root {
    if (maybeCommentNode && maybeCommentNode.type === 'comment') {
        parent.last?.after(maybeCommentNode)

        return maybeCommentNode as unknown as Rule
    }

    return parent
}

// Logic without changes from the `postcss-nested`:
// https://github.com/postcss/postcss-nested/blob/main/index.js#L3
function parse(source: string, rule?: Rule): Selector {
    let nodes: parser.Root | undefined

    const saver = parser(parsed => {
        nodes = parsed
    })

    try {
        saver.processSync(source)
    } catch (error) {
        if (source.includes(':')) {
            throw rule ? rule.error('Missed semicolon') : error
        } else if (error instanceof Error) {
            throw rule ? rule.error(error.message) : error
        }
    }

    return nodes!.at(0)
}

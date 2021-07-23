import { AcceptedPlugin, Rule, ChildNode } from 'postcss'
import parser, { isRoot, Selector } from 'postcss-selector-parser'

const GLOBAL_TOP_LEVEL_CLASSES = ['.theme-redesign', '.theme-light', '.theme-dark']

// Based on the implementation of the `postcss-nested` plugin:
// https://github.com/postcss/postcss-nested/blob/main/index.js
export function postcssToCssModulePlugin(): AcceptedPlugin {
    return {
        postcssPlugin: 'postcss-to-css-module',
        Root(root) {
            if (root.last) {
                // Remove default spacing applied by postcss.
                root.last.raws.before = undefined
            }
        },
        Rule(parentRule) {
            const isRootRule = isRoot(parentRule.parent)

            // Check if root level selectors include well-known global classes and wrap them
            // into a `:global()` keyword in case of a match.
            if (isRootRule && GLOBAL_TOP_LEVEL_CLASSES.some(globalClass => parentRule.selector.includes(globalClass))) {
                for (const globalClass of GLOBAL_TOP_LEVEL_CLASSES) {
                    parentRule.selector = parentRule.selector.replace(
                        globalClass,
                        wrapSelectorInGlobalKeyword(globalClass)
                    )
                }
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

    // If nesting was removed, uplift nested selector to the direct child level.
    if (shouldRemoveNesting) {
        // Preserve comment above the selector on nesting removal.
        const parentOrComment = pickComment(child.prev(), parent)
        parentOrComment.after(child)
    }

    return updatedChildSelectors
}

function replaceSelectorNodesIfNeeded(nodes: Selector): boolean {
    return nodes.reduce<boolean>((shouldRemoveNesting, node) => {
        // Assume that all nested classes not starting with `&` are global classes:
        // .menu {
        //   .nav-bar -> :global(.nav-bar)
        // }
        if (node.type === 'class') {
            const globalClass = wrapSelectorInGlobalKeyword(node.toString())
            node.replaceWith(parse(globalClass))
        }

        if (node.type === 'nesting') {
            if (node.value !== '&') {
                throw new Error(`Found unhandled nesting! ${node.value}`)
            } else {
                const nextNode = node.next()

                if (nextNode) {
                    if (nextNode.value?.startsWith('--')) {
                        // Preserve nesting for modifier classes, e.g., `&--disabled`
                    } else if (nextNode.value?.startsWith('__')) {
                        // Remove nesting for selectors starting from `__`
                        // &__button -> .button
                        node.replaceWith(parse(''))
                        nextNode.replaceWith(parse(nextNode.value?.replace('__', '.')))
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
function pickComment(maybeCommentNode: ChildNode | undefined, parent: Rule): Rule {
    if (maybeCommentNode && maybeCommentNode.type === 'comment') {
        parent.after(maybeCommentNode)
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
        } else {
            throw rule ? rule.error(error.message) : error
        }
    }

    return nodes!.at(0)
}

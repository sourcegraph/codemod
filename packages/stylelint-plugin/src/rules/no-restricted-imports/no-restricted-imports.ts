import path from 'path'

import { findRootSync } from '@manypkg/find-root'
// Use same glob matcher as ESLint.
import ignore from 'ignore'
import valueParser, { Node } from 'postcss-value-parser'
import stylelint from 'stylelint'

import { createPlugin, isString } from '../../utils'

export const ruleName = '@sourcegraph/no-restricted-imports'
export const messages = stylelint.utils.ruleMessages(ruleName, {
    rejected: importPath => {
        return `'${String(importPath)}' import is restricted from being used.`
    },
})

const ROOT_DIR = findRootSync(process.cwd())

function getImportURI(node: Node): string {
    if (node.type === 'function' && node.value === 'url') {
        return node.nodes[0].value
    }

    return node.value
}

interface RuleConfig {
    paths: string[]
}

export const noRestrictedImports = createPlugin<RuleConfig>(ruleName, (isEnabled, config) => {
    if (!config) {
        throw new Error(`The ${ruleName} rule configuration is not provided!`)
    }

    const { paths = [] } = config
    const ignorer = ignore().add(paths)

    return function (postcssRoot, postcssResult) {
        if (!isEnabled) {
            return
        }

        const areOptionsValid = stylelint.utils.validateOptions(
            postcssResult,
            ruleName,
            {
                actual: isEnabled,
                optional: false,
                possible: [true, false],
            },
            {
                actual: config,
                optional: false,
                possible: {
                    paths: [isString],
                },
            }
        )

        if (!areOptionsValid) {
            return
        }

        const fileName = postcssRoot.source?.input.from
        const fileDirectory = fileName ? path.parse(fileName).dir : ''

        postcssRoot.walkAtRules(/^import$/i, atRule => {
            const { nodes } = valueParser(atRule.params)

            if (nodes.length === 0) {
                return
            }

            // Extract `uri` from `url()` if exists.
            const [firstNode] = nodes
            const importURI = getImportURI(firstNode)

            // Normalize the path for ignorer.
            const importPath = importURI.startsWith('.')
                ? path.relative(ROOT_DIR, path.join(fileDirectory, importURI))
                : importURI

            const isRestricted = paths.includes(importPath) || ignorer.ignores(importPath)

            if (isRestricted) {
                stylelint.utils.report({
                    message: messages.rejected(importURI),
                    node: atRule,
                    result: postcssResult,
                    ruleName,
                })

                return
            }
        })
    }
})

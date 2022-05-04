import path from 'path'

import stylelint from 'stylelint'

import { createPlugin, isString } from '../../utils'

export const ruleName = '@sourcegraph/filenames-match-regex'
export const messages = stylelint.utils.ruleMessages(ruleName, {
    expected: fileName => {
        return `Filename ${String(fileName)} does not match the regular expression.`
    },
})

interface RuleConfig {
    regexp: string
}

export const filenameMatchRegexRule = createPlugin<RuleConfig>(ruleName, (isEnabled, config) => {
    if (!config) {
        throw new Error(`The ${ruleName} rule configuration is not provided!`)
    }

    const regexp = new RegExp(config.regexp)

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
                    regexp: [isString],
                },
            }
        )

        if (!areOptionsValid) {
            return
        }

        const filePath = postcssRoot.source?.input.from

        if (!filePath || !postcssRoot.first) {
            return
        }

        const fileName = path.basename(filePath)
        const isRegexMatch = regexp.test(fileName)

        if (!isRegexMatch) {
            stylelint.utils.report({
                message: messages.expected(fileName),
                ruleName,
                node: postcssRoot.first,
                result: postcssResult,
                line: 1,
            })
        }
    }
})

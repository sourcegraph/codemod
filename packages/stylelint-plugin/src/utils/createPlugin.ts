import stylelint, { Plugin, Rule } from 'stylelint'

export interface DefaultStylelintPlugin {
    ruleName: string
    rule: Rule
}

export type StylelintPlugin<RuleConfig> = (isEnabled: boolean, ruleConfig?: RuleConfig) => ReturnType<Plugin>

/**
 * Allows to pass rule configuration options as a Typescript generic.
 */
export function createPlugin<RuleConfig>(
    ruleName: string,
    plugin: StylelintPlugin<RuleConfig>
): DefaultStylelintPlugin {
    return stylelint.createPlugin(ruleName, plugin as unknown as Plugin) as DefaultStylelintPlugin
}

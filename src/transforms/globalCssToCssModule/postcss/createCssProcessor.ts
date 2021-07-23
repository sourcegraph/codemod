import postcss, { AcceptedPlugin, LazyResult } from 'postcss'
import postcssScss from 'postcss-scss'

export const createCssProcessor = (...plugins: AcceptedPlugin[]): ((css: string) => LazyResult) => {
    const configuredProcessor = postcss(plugins)

    return (css: string) =>
        configuredProcessor.process(css, {
            parser: postcssScss,
            from: 'CSS',
        })
}

// Source from: https://github.com/DefinitelyTyped/DefinitelyTyped/pull/54526/files
// Should be deleted once the PR is merged and @types/prettier-eslint is published.

/// <reference types="node" />

declare module 'prettier-eslint' {
    import * as eslint from 'eslint'
    import * as prettier from 'prettier'

    namespace format {
        /**
         * Logging level for the traceback of the synchronous formatting process.
         */
        type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace'

        /**
         * Options to format text with Prettier and ESLint.
         */
        interface Options {
            /**
             * The config to use for formatting with ESLint.
             */
            eslintConfig?: eslint.Linter.Config
            /**
             * The path to the eslint module to use.
             * Will default to require.resolve('eslint')
             */
            eslintPath?: string
            /**
             * The options to pass for formatting with `prettier` if the given
             * option is not inferrable from the `eslintConfig`.
             */
            fallbackPrettierOptions?: prettier.Options
            /**
             * The path of the file being formatted can be used in lieu of
             * `eslintConfig` (eslint will be used to find the relevant
             * config for the file). Will also be used to load the `text` if
             * `text` is not provided.
             */
            filePath?: string
            /**
             * The level for the logs (error, warn, info, debug, trace).
             */
            logLevel?: LogLevel
            /**
             * The options to pass for formatting with `prettier`. If not provided,
             * prettier-eslint will attempt to create the options based on the
             * `eslintConfig` value.
             */
            prettierOptions?: prettier.Options
            /**
             * The path to the `prettier` module.
             * Will default to require.resovlve('prettier')
             */
            prettierPath?: string
            /**
             * Run Prettier last.
             */
            prettierLast?: boolean
            /**
             * The text (JavaScript code) to format.
             */
            text: string
        }
    }

    /**
     * Formats the text with Prettier and then ESLint while obeying the user's
     * configuration.
     *
     * @param options Options to format text with Prettier and Eslint.
     * @param options.eslintConfig The config to use for formatting
     * with ESLint.
     * @param options.eslintPath The path to the eslint module to use.
     * Will default to require.resolve('eslint')
     * @param options.fallbackPrettierOptions The options to pass for
     * formatting with `prettier` if the given option is not inferrable from the
     * eslintConfig.
     * @param options.filePath The path of the file being formatted
     * can be used in lieu of `eslintConfig` (eslint will be used to find the
     * relevant config for the file). Will also be used to load the `text` if
     * `text` is not provided.
     * @param options.prettierOptions The options to pass for
     * formatting with `prettier`. If not provided, prettier-eslint will attempt
     * to create the options based on the `eslintConfig` value.
     * @param options.prettierLast Run Prettier last.
     * @param options.prettierPath The path to the prettier module.
     * Will default to require.resovlve('prettier')
     * @param options.logLevel The level for the logs (`error`, `warn`,
     * `info`, `debug`, `trace`).
     * @param options.text The text (JavaScript code) to format.
     * @returns Auto-formatted text that is mostly compliant with the
     * supplied configuration. The auto-formatting is limited to the issues that
     * Prettier and ESLint can automatically fix.
     */
    function format(options: format.Options): string

    export = format
}

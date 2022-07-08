import { getFixturesRootDir, RuleTester } from "../../../testing/RuleTester"
import { noEmptyCatchBlocks } from "../no-empty-catch-blocks"

const ruleTester = new RuleTester({
    parserOptions: {
        tsconfigRootDir: getFixturesRootDir(),
        project: './tsconfig.json',
    },
    parser: '@typescript-eslint/parser',
})

ruleTester.run('no-empty-catch-blocks', noEmptyCatchBlocks, {
    valid: [
        {
            code: `
                try {}
                /* Ignore this error */
                catch {}
            `,
        },
        {
            code: `
                try {}
                catch {
                    // Ignore this error
                }
            `,
        },
        {
            code: `
                try {}
                catch (error) {
                    Sentry.captureException(error)
                }
            `,
        },
    ],
    invalid: [
        {
            code: `try {} catch {}`,
            errors: [{ messageId: 'noEmptyCatchBlocks' }]
        },
    ],
})

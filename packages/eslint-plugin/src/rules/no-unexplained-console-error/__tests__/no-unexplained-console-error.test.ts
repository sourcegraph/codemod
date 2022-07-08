import { getFixturesRootDir, RuleTester } from '../../../testing/RuleTester'
import { noUnexplainedConsoleError } from '../no-unexplained-console-error'

const ruleTester = new RuleTester({
    parserOptions: {
        tsconfigRootDir: getFixturesRootDir(),
        project: './tsconfig.json',
    },
    parser: '@typescript-eslint/parser',
})

ruleTester.run('no-unexplained-console-error', noUnexplainedConsoleError, {
    valid: [
        {
            code: `
                try {}
                catch (error) {
                    // This comment explains why we need to do this
                    console.error(error)
                }
            `,
        },
    ],
    invalid: [
        { code: 'console.error(err)' },
        {
            code: `
                try {} catch (err) {
                    console.error(err)
                }
            `,
        },
    ].map(test => {
        return {
            ...test,
            errors: [{ messageId: 'noUnexplainedConsoleError' }],
        }
    }),
})

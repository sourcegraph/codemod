// Disabled some rules in the process of migration from JS to avoid bloating lint output with warnings.
// To fix these issues the `@typescript-eslint/no-explicit-any` warning in this file should be fixed.
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { RuleTester } from '../../../testing/RuleTester'
import { checkHelpLinks } from '../check-help-links'

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 6,
        ecmaFeatures: {
            jsx: true,
        },
    },
    parser: '@typescript-eslint/parser',
})

const invalidLinkError = (path: string) => {
    return { message: 'Help link to non-existent page: ' + path, type: 'JSXOpeningElement' }
}
const options = [{ docsiteList: ['a.md', 'b/c.md', 'd/index.md'] }]

// Build up the test cases given the various combinations we need to support.
const cases: any = { valid: [], invalid: [] }

for (const [element, attribute] of [
    ['a', 'href'],
    ['Link', 'to'],
]) {
    for (const anchor of ['', '#anchor', '#anchor#double']) {
        for (const content of ['', 'link content']) {
            const code = (target: string) => {
                return content
                    ? `<${element} ${attribute}="${target}${anchor}">${content}</${element}>`
                    : `<${element} ${attribute}="${target}${anchor}" />`
            }

            cases.valid.push(
                ...[
                    '/help/a',
                    '/help/b/c',
                    '/help/d',
                    '/help/d/',
                    'not-a-help-link',
                    'help/but-not-absolute',
                    '/help-but-not-a-directory',
                ].map(target => {
                    return {
                        code: code(target),
                        options,
                    }
                })
            )

            cases.invalid.push(
                ...['/help/', '/help/b', '/help/does/not/exist'].map(target => {
                    return {
                        code: code(target),
                        errors: [invalidLinkError(target.slice(6))],
                        options,
                    }
                })
            )
        }
    }
}

// Every case should be valid if the options are empty.
cases.valid.push(
    ...[...cases.invalid, ...cases.valid].map(({ code }) => {
        return { code }
    })
)

// Actually run the tests.
ruleTester.run('check-help-links', checkHelpLinks, cases)

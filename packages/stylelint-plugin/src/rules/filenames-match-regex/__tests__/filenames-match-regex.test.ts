import { messages, ruleName } from '../filenames-match-regex'

const ruleConfig = { regexp: '^.+\\.module(\\.css)$' }

testRule({
    ruleName,
    config: [true, ruleConfig],
    codeFilename: 'test.module.css',
    accept: [
        {
            code: 'div {}',
            description: 'CSS module file',
        },
    ],
})

testRule({
    ruleName,
    config: [true, ruleConfig],
    codeFilename: 'test.css',
    reject: [
        {
            code: 'div {}',
            description: 'global CSS file',
            message: messages.expected('test.css'),
        },
    ],
})

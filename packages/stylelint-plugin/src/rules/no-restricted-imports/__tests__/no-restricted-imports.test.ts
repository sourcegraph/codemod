import { messages, ruleName } from '../no-restricted-imports'

testRule({
    ruleName,
    config: [true, { paths: ['bootstrap*', 'reactstrap/index.css'] }],
    codeFilename: 'packages/stylelint-plugin/test.css',
    accept: [
        {
            code: '@import "reactstrap/not-banned.css"',
            description: 'Absolute import',
        },
        {
            code: '@import "./branded/src/global-styles/index.scss";',
            description: 'Relative import',
        },
        {
            code: '@import "../../branded/src/global-styles/index.scss";',
            description: 'Deep relative import',
        },
    ],
    reject: [
        {
            code: '@import "reactstrap/index.css";',
            description: 'Banned import exact path',
            message: messages.rejected('reactstrap/index.css'),
        },
        {
            code: '@import "bootstrap";',
            description: 'Banned import via glob',
            message: messages.rejected('bootstrap'),
        },
        {
            code: '@import "bootstrap/scss/functions";',
            description: 'Banned nested import via glob',
            message: messages.rejected('bootstrap/scss/functions'),
        },
    ],
})

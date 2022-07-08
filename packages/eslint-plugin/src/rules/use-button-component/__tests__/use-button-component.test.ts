import { RuleTester, getFixturesRootDir, addFilename } from '../../../testing/RuleTester'
import { useButtonComponent } from '../use-button-component'

const ruleTester = new RuleTester({
    parserOptions: {
        tsconfigRootDir: getFixturesRootDir(),
        project: './tsconfig.json',
    },
    parser: '@typescript-eslint/parser',
})

ruleTester.run('use-button-component', useButtonComponent, {
    valid: addFilename('react.tsx', [
        {
            code: '<Button variant="primary" className="d-flex" />',
        },
        {
            code: '<div className="d-flex btn-another" />',
        },
        {
            code: '<div><div className="d-flex btn-another" /></div>',
        },
    ]),
    invalid: addFilename('react.tsx', [
        {
            code: '<button />',
            errors: [
                {
                    line: 1,
                    column: 1,
                    messageId: 'bannedJsxElementMessage',
                },
            ],
        },
        {
            code: '<Wow className={classNames("btn", props.className)} />',
            errors: [
                {
                    line: 1,
                    column: 28,
                    messageId: 'bannedClassnameMessage',
                },
            ],
        },
        {
            code: `
                <div>
                    <button type="button" className="kek">
                        Just button element
                    </button>
                    <button type="button" />
                    <SmartButton customClassName="wow btn-primary" className="btn kek">
                        custom component with banned classname
                    </SmartButton>
                    <div className={classNames("btn d-flex btn-primary")}>
                        more banned classes
                    </div>
                </div>
            `,
            errors: [
                {
                    line: 3,
                    column: 21,
                    messageId: 'bannedJsxElementMessage',
                },
                {
                    line: 6,
                    column: 21,
                    messageId: 'bannedJsxElementMessage',
                },
                {
                    line: 7,
                    column: 50,
                    messageId: 'bannedClassnameMessage',
                },
                {
                    line: 7,
                    column: 78,
                    messageId: 'bannedClassnameMessage',
                },
                {
                    line: 10,
                    column: 48,
                    messageId: 'bannedClassnameMessage',
                },
            ],
        },
    ]),
})

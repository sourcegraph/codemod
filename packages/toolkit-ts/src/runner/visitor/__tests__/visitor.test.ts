import { Node, Project } from 'ts-morph'

import { createManualChangeList, errors } from '@sourcegraph/codemod-common'

import { VisitorContext } from '../types'
import { visitor } from '../visitor'

function createVisitorContext(fileSource: string): VisitorContext {
    const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true })
    const sourceFile = project.createSourceFile('test.tsx', fileSource)

    return {
        ...createManualChangeList(),
        sourceFile,
    }
}

describe('visitor', () => {
    it('provides correct AST node to a `SyntaxKind` handler', () => {
        const visitorContext = createVisitorContext('const x = 1')

        visitor(visitorContext, {
            VariableDeclaration(node) {
                expect(Node.isVariableDeclaration(node)).toBe(true)
                expect(node.getText()).toEqual('x = 1')
            },
        })
    })

    it('calls a `SourceFileExit` handler after `SyntaxKind` handlers', () => {
        const visitorContext = createVisitorContext('const x = 1')

        const nodeHandler = jest.fn()
        const exitHandler = jest.fn()

        visitor(visitorContext, {
            VariableDeclaration: nodeHandler,
            SourceFileExit: exitHandler,
        })

        const nodeOrder = nodeHandler.mock.invocationCallOrder[0]
        const exitOrder = exitHandler.mock.invocationCallOrder[0]

        expect(nodeOrder).toBeLessThan(exitOrder)
    })

    it('visits all nodes of `SyntaxKind` in the source file', () => {
        const visitorContext = createVisitorContext(`
          import classNames from 'classnames'

          const Button = props => {
              const { isActive } = props

              return <button className={classNames('btn', isActive && 'btn-primary')} />
          }
        `)

        const stringLiteralHandler = jest.fn()
        const variableDeclarationHandler = jest.fn()

        visitor(visitorContext, {
            StringLiteral: stringLiteralHandler,
            VariableDeclaration: variableDeclarationHandler,
        })

        expect(stringLiteralHandler.mock.calls.length).toBe(3)
        expect(variableDeclarationHandler.mock.calls.length).toBe(2)
    })

    it('handles `ManualChangeError`', () => {
        const visitorContext = createVisitorContext('const x = 1')
        const message = 'oopsie!'
        const exitHandler = jest.fn()

        visitor(visitorContext, {
            VariableDeclaration(node) {
                visitorContext.throwManualChangeError({ node, message })
            },
            SourceFileExit: exitHandler,
        })

        expect(Object.values(visitorContext.manualChangesReported)[0].message).toContain(message)
        expect(exitHandler.mock.calls.length).toBe(1)
    })

    it('handles `InvalidOperationError`', () => {
        const visitorContext = createVisitorContext('const x = 1')
        const exitHandler = jest.fn()

        visitor(visitorContext, {
            VariableDeclaration() {
                throw new errors.InvalidOperationError('stop it!')
            },
            SourceFileExit: exitHandler,
        })

        expect(exitHandler.mock.calls.length).toBe(1)
    })
})

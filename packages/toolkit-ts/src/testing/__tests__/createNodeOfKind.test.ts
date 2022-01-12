import { SyntaxKind, VariableDeclaration } from 'ts-morph'

import { createNodeOfKind, createStringLiteral } from '../createNodeOfKind'

describe('createNodeOfKind', () => {
    it('creates ts-morph Node of provided SyntaxKind', () => {
        const { node } = createNodeOfKind<VariableDeclaration>('const x = 1', SyntaxKind.VariableDeclaration)

        expect(node.getText()).toBe('x = 1')
        expect(node.getKind()).toBe(SyntaxKind.VariableDeclaration)
    })
})

describe('createStringLiteral', () => {
    it('creates string literal from provided string', () => {
        const stringLiteral = createStringLiteral('const x = "hey!"')

        expect(stringLiteral.getLiteralValue()).toBe('hey!')
    })
})

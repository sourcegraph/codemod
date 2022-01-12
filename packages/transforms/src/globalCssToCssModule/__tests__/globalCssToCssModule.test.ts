import path from 'path'

import signale from 'signale'
import { Project } from 'ts-morph'

import { globalCssToCssModule } from '../globalCssToCssModule'

const TARGET_FILE = path.resolve(__dirname, './fixtures/MyComponent.tsx')

describe('globalCssToCssModule', () => {
    beforeEach(() => {
        signale.disable()
    })

    it('transforms correctly', async () => {
        const project = new Project()
        project.addSourceFilesAtPaths(TARGET_FILE)
        const [{ files }] = await globalCssToCssModule({ project, shouldFormat: true })

        expect(files).toBeTruthy()

        if (files) {
            const [cssModule, reactComponent] = files

            expect(cssModule.source).toMatchSnapshot()
            expect(reactComponent.source).toMatchSnapshot()
        }
    }, 15000) // Timeout of 15s (default is 5s). `prettier-eslint` format is slow 😬.
})

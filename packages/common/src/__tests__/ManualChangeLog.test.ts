import { Project } from 'ts-morph'

import { createManualChangeList } from '../ManualChangeList'

describe('createManualChangeList', () => {
    it('collects manual change logs', () => {
        const manualChangeList = createManualChangeList()

        const project = new Project({ useInMemoryFileSystem: true, skipLoadingLibFiles: true })
        const sourceFile = project.createSourceFile('test.tsx', 'const x = 1')

        const manualChangeLog = {
            node: sourceFile.getFirstChildOrThrow(),
            message: 'Hello there!',
        }

        expect(manualChangeList.manualChangesReported).toEqual({})

        manualChangeList.addManualChangeLog(manualChangeLog)
        manualChangeList.addManualChangeLog(manualChangeLog)

        const changelogEntries = Object.entries(manualChangeList.manualChangesReported)
        expect(changelogEntries.length).toBe(1)

        const [id, { node, message }] = changelogEntries[0]

        expect(node).toBe(manualChangeLog.node)
        expect(message).toBe(['', '/test.tsx:1:1 - warning: Hello there!', '>>>    const x = 1'].join('\n'))
        expect(id).toBe('/test.tsx,0,0,1,Hello there!')
    })
})

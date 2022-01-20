import signale from 'signale'
import { dedent } from 'ts-dedent'

import { Codemod, TransformOptions } from '@sourcegraph/codemod-cli'
import { ManualChangeLog } from '@sourcegraph/codemod-common'

import { DEFAULT_FILE_NAME, createSourceFile } from './createSourceFile'

interface CodemodTestCase<T> {
    initialSource: string
    expectedSource: string
    expectedManualChangeMessages?: string[]
    transformOptions?: T
    label?: string
}

const TEST_FILE_REGEX = new RegExp(`^.+/${DEFAULT_FILE_NAME}`, 'm')

function dropFilePath({ message }: ManualChangeLog): string {
    return message.replace(TEST_FILE_REGEX, `/${DEFAULT_FILE_NAME}`).trim()
}

export function testCodemod<T extends TransformOptions>(
    name: string,
    codemod: Codemod<T>,
    testCases: CodemodTestCase<T>[]
): void {
    describe(`codemod ${name}`, () => {
        beforeAll(() => {
            return signale.disable()
        })

        for (const testCase of testCases) {
            const {
                initialSource,
                expectedSource,
                expectedManualChangeMessages,
                transformOptions,
                label = 'transforms correctly',
            } = testCase

            it(label, async () => {
                const [{ files, manualChangesReported }] = await codemod({
                    project: createSourceFile(dedent(initialSource)).project,
                    shouldFormat: true,
                    transformOptions,
                })

                expect(files).toBeTruthy()

                if (files) {
                    expect(files[0].source.trim()).toBe(dedent(expectedSource))

                    if (Object.keys(manualChangesReported).length > 0) {
                        expect(Object.values(manualChangesReported).map(dropFilePath)).toEqual(
                            expectedManualChangeMessages?.map(message => {
                                return dedent(message).trim()
                            })
                        )
                    }
                }
            })
        }
    })
}

import { createSourceFile } from 'utils/tests'

import { getNodesWithClassName } from '../getNodesWithClassName'
import { processNodesWithClassName } from '../processNodesWithClassName'

describe('processNodesWithClassName', () => {
    it('correctly replaces classes based on `exportNameMap` provided', () => {
        const sourceFile = createSourceFile(`
            <div className="kek kek--wow d-flex m-1">
                <div
                    className={classNames('m-1', true ? 'kek' : false, 'd-flex', {
                        kek: false,
                        'd-flex mr-1 kek': isActive,
                    })}
                >
                    Important text
                </div>
                It's a component<p className="kek--wow">🤩!</p>
                <div className="m-2 repo-header d-flex m-1">Thank you for attention.</div>
            </div>
        `)

        processNodesWithClassName({
            nodesWithClassName: getNodesWithClassName(sourceFile),
            exportNameMap: {
                kek: 'kek',
                'kek--wow': 'kekWow',
                'repo-header': 'repoHeader',
            },
        })

        expect(sourceFile.getText()).toEqual(`<div className={classNames("d-flex m-1", styles.kek, styles.kekWow)}>
                <div
                    className={classNames('m-1', true ? styles.kek : false, 'd-flex', {
                        [styles.kek]: false,
                        [classNames("d-flex mr-1", styles.kek)]: isActive,
                    })}
                >
                    Important text
                </div>
                It's a component<p className={styles.kekWow}>🤩!</p>
                <div className={classNames("m-2 d-flex m-1", styles.repoHeader)}>Thank you for attention.</div>
            </div>
        `)
    })
})

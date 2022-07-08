// This file is used by `scripts/generate-configs.ts` for rules extraction.
import { checkHelpLinks } from './check-help-links'
import { noEmptyCatchBlocks } from './no-empty-catch-blocks'

// eslint-disable-next-line import/no-default-export
export default {
    'check-help-links': checkHelpLinks,
    'no-empty-catch-blocks': noEmptyCatchBlocks
}

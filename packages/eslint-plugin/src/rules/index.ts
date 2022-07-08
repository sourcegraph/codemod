// This file is used by `scripts/generate-configs.ts` for rules extraction.
import { checkHelpLinks } from './check-help-links'
import { noUnexplainedConsoleError } from './no-unexplained-console-error'

// eslint-disable-next-line import/no-default-export
export default {
    'check-help-links': checkHelpLinks,
    'no-unexplained-console-error': noUnexplainedConsoleError,
}

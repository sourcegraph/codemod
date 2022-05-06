// This file is used by `scripts/generate-configs.ts` for rules extraction.
import { checkHelpLinks } from './check-help-links'
import { useButtonComponent } from './use-button-component'

// eslint-disable-next-line import/no-default-export
export default {
    'use-button-component': useButtonComponent,
    'check-help-links': checkHelpLinks,
}

import path from 'path'

import { getTestRule } from 'jest-preset-stylelint'

global.testRule = getTestRule({ plugins: [path.join(__dirname, './src')] })

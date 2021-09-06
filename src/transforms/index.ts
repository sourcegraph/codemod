import { globalCssToCssModule } from './globalCssToCssModule/globalCssToCssModule'

export const transforms = {
    globalCssToCssModule,
} as const

export const transformNames = Object.keys(transforms)

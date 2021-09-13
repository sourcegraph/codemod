import { classNameTemplateToClassnamesCall } from './classNameTemplateToClassnamesCall'
import { globalCssToCssModule } from './globalCssToCssModule/globalCssToCssModule'

export const transforms = {
    globalCssToCssModule,
    classNameTemplateToClassnamesCall,
} as const

export const transformNames = Object.keys(transforms)

import { createPageProvider } from '@/providers/create-page-provider'
import { type ColorLayout } from '@/types/ColorLayout'

type ColorLayoutDialogType = 'create' | 'update' | 'detail' | 'delete'

export const [ColorLayoutProvider, useColorLayoutContext] = createPageProvider<
  ColorLayoutDialogType,
  ColorLayout
>('ColorLayout')

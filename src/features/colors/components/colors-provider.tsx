import { createPageProvider } from '@/providers/create-page-provider'
import { type Color } from '@/types/Color'

type ColorDialogType = 'create' | 'update' | 'delete'

export const [ColorsProvider, useColorsContext] = createPageProvider<
  ColorDialogType,
  Color
>('Colors')

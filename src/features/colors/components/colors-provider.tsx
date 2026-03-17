import { createPageProvider } from '@/hooks/create-page-provider'
import { type Color } from '@/types/Color'

type ColorDialogType = 'create' | 'update' | 'delete'

export const [ColorsProvider, useColorsContext] = createPageProvider<
  ColorDialogType,
  Color
>('Colors')

import type {Color} from '@/types/Color';
import { createPageProvider } from '@/providers/create-page-provider'

type ColorDialogType = 'create' | 'update' | 'delete'

export const [ColorsProvider, useColorsContext] = createPageProvider<
  ColorDialogType,
  Color
>('Colors')

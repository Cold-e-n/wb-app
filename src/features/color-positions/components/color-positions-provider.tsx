import type {ColorPositionWithRelations} from '@/types/ColorPosition';
import { createPageProvider } from '@/providers/create-page-provider'

type ColorPositionsDialogType = 'create' | 'update' | 'delete'

export const [ColorPositionsProvider, useColorPositionsContext] =
  createPageProvider<ColorPositionsDialogType, ColorPositionWithRelations>(
    'ColorPositions',
  )

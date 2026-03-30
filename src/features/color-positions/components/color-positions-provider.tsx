import { createPageProvider } from '@/providers/create-page-provider'
import { type ColorPositionWithRelations } from '@/types/ColorPosition'

type ColorPositionsDialogType = 'create' | 'update' | 'delete'

export const [ColorPositionsProvider, useColorPositionsContext] =
  createPageProvider<ColorPositionsDialogType, ColorPositionWithRelations>(
    'ColorPositions',
  )

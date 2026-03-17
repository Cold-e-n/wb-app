import { createPageProvider } from '@/hooks/create-page-provider'
import { type ColorPositionWithRelations } from '@/types/ColorPosition'

type ColorPositionsDialogType = 'create' | 'update' | 'delete'

export const [ColorPositionsProvider, useColorPositionsContext] =
  createPageProvider<ColorPositionsDialogType, ColorPositionWithRelations>(
    'ColorPositions',
  )

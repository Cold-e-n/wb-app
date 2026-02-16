import * as React from 'react'
import { useDialogState } from '@/hooks/use-dialog-state'
import { type ColorPosition } from '@/types/ColorPosition'
import { type ColorLayout } from '@/types/ColorLayout'
import { type Fabric } from '@/types/Fabric'

// Extended type for table data
export type ColorPositionWithRelations = ColorPosition & {
  fabric: Fabric
  colorLayout: ColorLayout
}

type ColorPositionsDialogType = 'create' | 'update' | 'delete'

type ColorPositionsContextType = {
  open: ColorPositionsDialogType | null
  setOpen: (open: ColorPositionsDialogType | null) => void
  currentRow: ColorPositionWithRelations | null
  setCurrentRow: React.Dispatch<
    React.SetStateAction<ColorPositionWithRelations | null>
  >
}

const ColorPositionsContext =
  React.createContext<ColorPositionsContextType | null>(null)

export const ColorPositionsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [open, setOpen] = useDialogState<ColorPositionsDialogType>(null)
  const [currentRow, setCurrentRow] =
    React.useState<ColorPositionWithRelations | null>(null)

  return (
    <ColorPositionsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </ColorPositionsContext.Provider>
  )
}

export const useColorPositionsContext = () => {
  const context = React.useContext(ColorPositionsContext)
  if (!context) {
    throw new Error(
      'useColorPositionsContext must be used within a ColorPositionsProvider',
    )
  }
  return context
}

import * as React from 'react'
import { useDialogState } from '@/hooks/use-dialog-state'
import { type Color } from '@/types/Color'

type ColorDialogType = 'create' | 'update' | 'delete'

type ColorsContextType = {
  open: ColorDialogType | null
  setOpen: (str: ColorDialogType | null) => void
  currentRow: Color | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Color | null>>
}

const ColorsContext = React.createContext<ColorsContextType | null>(null)

export const ColorsProvider = ({ children }: React.PropsWithChildren) => {
  const [open, setOpen] = useDialogState<ColorDialogType>(null)
  const [currentRow, setCurrentRow] = React.useState<Color | null>(null)
  return (
    <ColorsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ColorsContext>
  )
}

export const useColorsContext = () => {
  const context = React.useContext(ColorsContext)
  if (!context) {
    throw new Error('useColorsContext must be used within a ColorsProvider')
  }
  return context
}

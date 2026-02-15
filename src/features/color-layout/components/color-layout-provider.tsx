import * as React from 'react'
import { useDialogState } from '@/hooks/use-dialog-state'
import { type ColorLayout } from '@/types/ColorLayout'

type ColorLayoutDialogType = 'create' | 'update' | 'detail' | 'delete'

type ColorLayoutContextType = {
  open: ColorLayoutDialogType | null
  setOpen: (open: ColorLayoutDialogType | null) => void
  currentRow: ColorLayout | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ColorLayout | null>>
}

const ColorLayoutContext = React.createContext<ColorLayoutContextType | null>(
  null,
)

export const ColorLayoutProvider = ({ children }: React.PropsWithChildren) => {
  const [open, setOpen] = useDialogState<ColorLayoutDialogType>(null)
  const [currentRow, setCurrentRow] = React.useState<ColorLayout | null>(null)

  return (
    <ColorLayoutContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </ColorLayoutContext.Provider>
  )
}

export const useColorLayoutContext = () => {
  const context = React.useContext(ColorLayoutContext)
  if (!context) {
    throw new Error(
      'useColorLayoutContext must be used within a ColorLayoutProvider',
    )
  }
  return context
}

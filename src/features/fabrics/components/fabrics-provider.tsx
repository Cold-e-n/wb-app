import * as React from 'react'
import { useDialogState } from '@/hooks/use-dialog-state'
import { type Fabric } from '@/types/Fabric'

type FabricsDialogType = 'create' | 'update' | 'detail' | 'delete'

type FabricsContextType = {
  open: FabricsDialogType | null
  setOpen: (open: FabricsDialogType | null) => void
  currentRow: Fabric | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Fabric | null>>
}

const FabricsContext = React.createContext<FabricsContextType | null>(null)

export const FabricsProvider = ({ children }: React.PropsWithChildren) => {
  const [open, setOpen] = useDialogState<FabricsDialogType>(null)
  const [currentRow, setCurrentRow] = React.useState<Fabric | null>(null)
  return (
    <FabricsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </FabricsContext>
  )
}

export const useFabricsContext = () => {
  const context = React.useContext(FabricsContext)
  if (!context) {
    throw new Error('useFabricsContext must be used within a FabricsProvider')
  }
  return context
}

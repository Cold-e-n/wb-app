import React from 'react'
import type { Yarn } from '@/types/Yarn'

type YarnsDialogType = 'create' | 'update' | 'delete' | null

interface YarnsContextType {
  open: YarnsDialogType
  setOpen: (open: YarnsDialogType) => void
  currentRow: Yarn | null
  setCurrentRow: (row: Yarn | null) => void
}

const YarnsContext = React.createContext<YarnsContextType | null>(null)

export const useYarnsContext = () => {
  const context = React.useContext(YarnsContext)
  if (!context) {
    throw new Error('useYarnsContext must be used within a YarnsProvider')
  }
  return context
}

export const YarnsProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState<YarnsDialogType>(null)
  const [currentRow, setCurrentRow] = React.useState<Yarn | null>(null)

  return (
    <YarnsContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
      }}
    >
      {children}
    </YarnsContext.Provider>
  )
}

import * as React from 'react'
import { useDialogState } from '@/hooks/use-dialog-state'

type PageProviderContextType<TDialogType extends string, TRow> = {
  open: TDialogType | null
  setOpen: (open: TDialogType | null) => void
  currentRow: TRow | null
  setCurrentRow: React.Dispatch<React.SetStateAction<TRow | null>>
}

/**
 * Factory that creates a page-scoped dialog-state provider and its
 * companion context hook in one call, eliminating the boilerplate of
 * manually writing createContext + Provider + useContext for every feature.
 *
 * @param displayName - Used in React DevTools labels and the
 *   missing-provider error message.
 * @returns A `[Provider, useContextHook]` tuple that is a drop-in
 *   replacement for the hand-written provider + useXxxContext pattern.
 *
 * @example
 * type ColorDialogType = 'create' | 'update' | 'delete'
 *
 * export const [ColorsProvider, useColorsContext] =
 *   createPageProvider<ColorDialogType, Color>('Colors')
 */
export function createPageProvider<TDialogType extends string, TRow>(
  displayName: string,
) {
  const Context = React.createContext<PageProviderContextType<
    TDialogType,
    TRow
  > | null>(null)

  const Provider = ({ children }: React.PropsWithChildren) => {
    const [open, setOpen] = useDialogState<TDialogType>(null)
    const [currentRow, setCurrentRow] = React.useState<TRow | null>(null)

    return (
      <Context value={{ open, setOpen, currentRow, setCurrentRow }}>
        {children}
      </Context>
    )
  }
  Provider.displayName = `${displayName}Provider`

  const usePageContext = () => {
    const context = React.useContext(Context)
    if (!context) {
      throw new Error(
        `use${displayName}Context must be used within a ${displayName}Provider`,
      )
    }
    return context
  }

  return [Provider, usePageContext] as const
}

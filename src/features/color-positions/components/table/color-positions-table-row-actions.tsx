import { BookSearch, Pencil, Trash } from 'lucide-react'
import { useColorPositionsContext } from '../color-positions-provider'
import type { Row } from '@tanstack/react-table'
import type {ColorPositionWithRelations} from '@/types/ColorPosition';
import { DataTableRowActions } from '@/components/data-table/row-actions'

type ColorPositionsTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const ColorPositionsTableRowActions = <TData,>({
  row,
}: ColorPositionsTableRowActionsProps<TData>) => {
  const colorPosition = row.original as ColorPositionWithRelations
  const { setOpen, setCurrentRow } = useColorPositionsContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Detail',
          icon: BookSearch,
          href: `/color-positions/${colorPosition.id}`,
        },
        {
          type: 'item',
          label: 'Edit',
          icon: Pencil,
          onClick: () => {
            setCurrentRow(colorPosition)
            setOpen('update')
          },
        },
        {
          type: 'separator',
        },
        {
          type: 'item',
          label: 'Hapus',
          icon: Trash,
          variant: 'destructive',
          onClick: () => {
            setCurrentRow(colorPosition)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

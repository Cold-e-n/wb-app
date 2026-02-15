import { Row } from '@tanstack/react-table'
import {
  type ColorPositionWithRelations,
  useColorPositionsContext,
} from '../color-positions-provider'
import { DataTableRowActions } from '@/components/data-table/row-actions'
import { BookSearch, Pencil, Trash } from 'lucide-react'

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
          onClick: () => {
            setCurrentRow(colorPosition)
            setOpen('detail')
          },
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

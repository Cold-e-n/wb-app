import { Edit2, Trash2 } from 'lucide-react'
import { useColorsContext } from '../colors-provider'
import type { Row } from '@tanstack/react-table'
import { colorSchema } from '@/types/Color'

import { DataTableRowActions } from '@/components/data-table/row-actions'


type ColorsTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const ColorsTableRowActions = <TData,>({
  row,
}: ColorsTableRowActionsProps<TData>) => {
  const color = colorSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useColorsContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Edit',
          icon: Edit2,
          onClick: () => {
            setCurrentRow(color)
            setOpen('update')
          },
        },
        {
          type: 'separator',
        },
        {
          type: 'item',
          label: 'Hapus',
          icon: Trash2,
          variant: 'destructive',
          onClick: () => {
            setCurrentRow(color)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

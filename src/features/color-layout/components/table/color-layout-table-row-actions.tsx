import { BookSearch, Edit2, Trash2 } from 'lucide-react'
import { useColorLayoutContext } from '../color-layout-provider'
import type { Row } from '@tanstack/react-table'
import { colorLayoutSchema } from '@/types/ColorLayout'

import { DataTableRowActions } from '@/components/data-table/row-actions'


type ColorLayoutTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const ColorLayoutTableRowActions = <TData,>({
  row,
}: ColorLayoutTableRowActionsProps<TData>) => {
  const colorLayout = colorLayoutSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useColorLayoutContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Detail',
          icon: BookSearch,
          href: `/color-layouts/${colorLayout.id}`,
        },

        {
          type: 'item',
          label: 'Edit',
          icon: Edit2,
          href: `/color-layouts/${colorLayout.id}/edit`,
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
            setCurrentRow(colorLayout)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

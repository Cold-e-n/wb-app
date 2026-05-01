import { Edit2, Trash2 } from 'lucide-react'
import { useYarnsContext } from '../yarns-provider'
import type { Row } from '@tanstack/react-table'
import { yarnSchema } from '@/types/Yarn'

import { DataTableRowActions } from '@/components/data-table/row-actions'

type YarnsTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const YarnsTableRowActions = <TData,>({
  row,
}: YarnsTableRowActionsProps<TData>) => {
  const yarn = yarnSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useYarnsContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Edit',
          icon: Edit2,
          onClick: () => {
            setCurrentRow(yarn)
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
            setCurrentRow(yarn)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

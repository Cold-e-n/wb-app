import { Row } from '@tanstack/react-table'
import { fabricSchema } from '@/types/Fabric'
import { useFabricsContext } from '../fabrics-provider'

import { DataTableRowActions } from '@/components/data-table/row-actions'

import { Edit2, BookSearch, Trash2 } from 'lucide-react'

type FabricsTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const FabricsTableRowActions = <TData,>({
  row,
}: FabricsTableRowActionsProps<TData>) => {
  const fabric = fabricSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useFabricsContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item' as const,
          label: 'Detail',
          icon: BookSearch,
          onClick: () => {
            setCurrentRow(fabric)
            setOpen('detail')
          },
        },
        {
          type: 'item' as const,
          label: 'Edit',
          icon: Edit2,
          onClick: () => {
            setCurrentRow(fabric)
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
            setCurrentRow(fabric)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

import { BookSearch, Edit2, Trash2 } from 'lucide-react'
import type { Row } from '@tanstack/react-table'
import { useFabricSpecsContext } from '../fabric-specs-provider'
import { fabricSpecSchema } from '@/types/FabricSpec'
import { DataTableRowActions } from '@/components/data-table/row-actions'

type FabricSpecsTableRowActionsProps<TData> = {
  row: Row<TData>
}

export const FabricSpecsTableRowActions = <TData,>({
  row,
}: FabricSpecsTableRowActionsProps<TData>) => {
  const fabricSpec = fabricSpecSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useFabricSpecsContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Detail',
          icon: BookSearch,
          href: `/fabric-specs/${fabricSpec.id}`,
        },
        {
          type: 'item',
          label: 'Edit',
          icon: Edit2,
          href: `/fabric-specs/${fabricSpec.id}/edit`,
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
            setCurrentRow(fabricSpec)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

import { Pencil, Trash2 } from 'lucide-react'
import { Row } from '@tanstack/react-table'
import { useWeavingMachinesContext } from '../weaving-machines-provider'
import { WeavingMachine } from '@/types/WeavingMachine'
import { DataTableRowActions } from '@/components/data-table/row-actions'

interface WeavingMachinesTableRowActionsProps {
  row: Row<WeavingMachine>
}

export const WeavingMachinesTableRowActions = ({
  row,
}: WeavingMachinesTableRowActionsProps) => {
  const { setOpen, setCurrentRow } = useWeavingMachinesContext()

  return (
    <DataTableRowActions
      items={[
        {
          type: 'item',
          label: 'Edit',
          icon: Pencil,
          onClick: () => {
            setCurrentRow(row.original)
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
          onClick: () => {
            setCurrentRow(row.original)
            setOpen('delete')
          },
        },
      ]}
    />
  )
}

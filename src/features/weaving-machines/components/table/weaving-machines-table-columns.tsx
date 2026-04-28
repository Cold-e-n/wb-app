import type { ColumnDef } from '@tanstack/react-table'
import type { WeavingMachine } from '@/types/WeavingMachine'

import { Checkbox } from '@/components/ui/checkbox'
import { WeavingMachinesTableRowActions } from './weaving-machines-table-row-actions'

export const columns: Array<ColumnDef<WeavingMachine>> = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => {
          row.toggleSelected(!!value)
        }}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nama Mesin',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'width',
    header: 'Lebar',
    cell: ({ row }) => <div>{row.getValue('width')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Tipe',
    cell: ({ row }) => <div>{row.getValue('type')}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <WeavingMachinesTableRowActions row={row} />,
  },
]

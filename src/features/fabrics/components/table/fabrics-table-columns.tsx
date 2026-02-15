import { ColumnDef } from '@tanstack/react-table'
import { type Fabric } from '@/types/Fabric'

import { Checkbox } from '@/components/ui/checkbox'

import { FabricsTableRowActions } from './fabrics-table-row-actions'

export const fabricsTableColumns: ColumnDef<Fabric>[] = [
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
    header: 'Nama Kain',
    cell: ({ row }) => row.getValue('name'),
  },
  {
    id: 'actions',
    cell: ({ row }) => <FabricsTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]

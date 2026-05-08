import type { ColumnDef } from '@tanstack/react-table'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'

import { Checkbox } from '@/components/ui/checkbox'
import { FabricSpecsTableRowActions } from './fabric-specs-table-row-actions'

export const columns: ColumnDef<FabricSpecWithRelation>[] = [
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
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'fabric.name',
    header: 'Nama Kain',
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original.fabric?.name ?? '-'}</span>
      )
    },
  },
  {
    id: 'dimension',
    header: 'Lebar x Panjang',
    cell: ({ row }) => {
      const { width, length } = row.original
      return (
        <span>
          {width} cm x {length} meter
        </span>
      )
    },
  },
  {
    id: 'warpYarn',
    header: 'Lusi',
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original.warpYarn?.name ?? '-'}</span>
      )
    },
  },
  {
    id: 'weftYarn',
    header: 'Pakan',
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original.weftYarn?.name ?? '-'}</span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <FabricSpecsTableRowActions row={row} />,
  },
]

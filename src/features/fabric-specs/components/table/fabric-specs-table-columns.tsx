import type { ColumnDef } from '@tanstack/react-table'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'

import { Checkbox } from '@/components/ui/checkbox'
import { truncate } from '@/lib/utils'
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
        <span className="font-medium">
          {truncate(row.original.fabric?.name ?? '-', 35)}
        </span>
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
        <span className="font-medium">
          {truncate(row.original.warpYarn?.name ?? '-', 40)}
        </span>
      )
    },
  },
  {
    id: 'weftYarn',
    header: 'Pakan',
    cell: ({ row }) => {
      return (
        <span className="font-medium tracking-tight">
          {truncate(row.original.weftYarn?.name ?? '-', 35)}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <FabricSpecsTableRowActions row={row} />,
  },
]

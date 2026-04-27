import type { RankingInfo } from '@tanstack/match-sorter-utils'
import '@tanstack/react-table'

declare module '@tanstack/react-table' {
   
  interface ColumnMeta<TData, TValue> {
    className?: string // apply to both th and td
    tdClassName?: string
    thClassName?: string
  }

  // Add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }

  interface FilterMeta {
    itemRank: RankingInfo
  }
}

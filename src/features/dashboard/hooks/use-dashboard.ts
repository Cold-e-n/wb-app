import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import * as Api from '../api/dashboard.api'

export const getDashboardStatsQueryOptions = queryOptions({
  queryKey: ['dashboardStats'],
  queryFn: Api.getDashboardStats,
  staleTime: Infinity,
})

export const useDashboardStats = () => {
  return useSuspenseQuery(getDashboardStatsQueryOptions)
}

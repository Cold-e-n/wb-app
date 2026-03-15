import { createFileRoute } from '@tanstack/react-router'
import { getDashboardStatsQueryOptions } from '@/features/dashboard/hooks/use-dashboard'
import { Dashboard } from '@/features/dashboard/dashboard'

export const Route = createFileRoute('/_auth/dashboard')({
  loader: async ({ context }) => {
    await context.queryClient.fetchQuery(getDashboardStatsQueryOptions)
  },
  head: () => ({
    meta: [
      {
        title: `Dashboard - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: Dashboard,
})

import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard/dashboard'

export const Route = createFileRoute('/_auth/dashboard')({
  loader: async ({ context }) => {
    await context.queryClient.invalidateQueries({
      queryKey: ['dashboardStats'],
    })
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

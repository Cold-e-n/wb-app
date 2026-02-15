import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard/dashboard'

export const Route = createFileRoute('/_auth/dashboard')({
  head: () => ({
    meta: [
      {
        title: `Dashboard - ${import.meta.env.VITE_APP_DEPARTMENT_NAME} App`,
      },
    ],
  }),
  component: Dashboard,
})

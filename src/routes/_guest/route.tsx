import { AuthLayout } from '@/components/layout/auth-layout'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_guest')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}

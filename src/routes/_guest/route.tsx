import { Outlet, createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '@/components/layout/auth-layout'

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

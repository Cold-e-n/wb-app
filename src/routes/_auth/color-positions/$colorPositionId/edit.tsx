import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/color-positions/$colorPositionId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/color-positions/$colorPositionId/edit"!</div>
}

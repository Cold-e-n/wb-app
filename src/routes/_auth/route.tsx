import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@/lib/cookies'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const getSidebarState = createServerFn({
  method: 'GET',
}).handler(async () => {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  return { defaultOpen }
})

export const Route = createFileRoute('/_auth')({
  loader: async () => {
    const req = await getSidebarState()
    return {
      sidebarDefaultOpen: req.defaultOpen,
    }
  },
  component: Component,
})

export function Component() {
  const { sidebarDefaultOpen } = Route.useLoaderData()
  return <AuthenticatedLayout defaultOpen={sidebarDefaultOpen} />
}

import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const getSidebarState = createServerFn({
  method: 'GET',
}).handler(async () => {
  const request = getRequest()
  const cookieHeader = request.headers.get('cookie') ?? ''
  const match = cookieHeader.match(/(?:^|;\s*)sidebar_state=([^;]*)/)
  const defaultOpen = match ? match[1] !== 'false' : true
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
